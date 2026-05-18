const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get student dashboard data
const getDashboardData = async (req, res) => {
  let connection;
  try {
    const studentId = req.userId;
    connection = await pool.getConnection();
    
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM assignments'
    );
    
    const [submittedResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM submissions WHERE student_id = ?',
      [studentId]
    );
    
    const total = totalResult[0].count;
    const submitted = submittedResult[0].count;
    const pending = total - submitted;
    
    const data = {
      totalAssignments: total,
      submittedAssignments: submitted,
      pendingAssignments: pending
    };
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get all assignments for student
const getAssignments = async (req, res) => {
  let connection;
  try {
    const studentId = req.userId;
    connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(
      'SELECT a.id, a.title, a.description, a.subject, a.file, a.due_date, a.extension_deadline, a.created_at, ' +
      's.id as submissionId, s.grade, s.feedback, s.submitted_late, s.submitted_at ' +
      'FROM assignments a ' +
      'LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ? ' +
      'ORDER BY a.created_at DESC',
      [studentId]
    );
    
    // Add calculated fields
    const data = assignments.map(assignment => ({
      ...assignment,
      dueDate: assignment.due_date,
      extensionDeadline: assignment.extension_deadline,
      hasSubmission: !!assignment.submissionId,
      isGraded: assignment.grade !== null
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get assignment details
const getAssignmentDetails = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.params;
    const studentId = req.userId;
    connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(
      'SELECT id, title, description, file, due_date, extension_deadline FROM assignments WHERE id = ?',
      [assignmentId]
    );
    
    const [submissions] = await connection.execute(
      'SELECT id, file, submitted_at, grade, feedback, submitted_late FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );
    
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const assignment = assignments[0];
    const submission = submissions.length > 0 ? submissions[0] : null;
    
    const data = {
      ...assignment,
      submission,
      isGraded: submission && submission.grade !== null,
      submitdeadlineText: assignment.extension_deadline ? 'Extended' : 'Normal'
    };
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get assignment details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.body;
    const studentId = req.userId;
    
    if (!assignmentId || !req.file) {
      return res.status(400).json({ success: false, message: 'Assignment ID and file required' });
    }

    const fileName = req.file.filename;
    connection = await pool.getConnection();
    
    // Check if submission already exists
    const [existing] = await connection.execute(
      'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }
    
    // Check if assignment is past due date
    const [assignments] = await connection.execute(
      'SELECT due_date, extension_deadline FROM assignments WHERE id = ?',
      [assignmentId]
    );
    
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const assignment = assignments[0];
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const extensionDeadline = assignment.extension_deadline ? new Date(assignment.extension_deadline) : null;
    
    // Check if submission is late
    let isLate = false;
    let canSubmit = true;
    
    if (extensionDeadline && now > extensionDeadline) {
      // Past extension deadline
      canSubmit = false;
    } else if (!extensionDeadline && now > dueDate) {
      // Past original due date but no extension
      isLate = true;
    }
    
    if (!canSubmit) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed. Cannot submit after extension deadline.' });
    }
    
    // Insert submission with late flag
    await connection.execute(
      'INSERT INTO submissions (assignment_id, student_id, file, submitted_late) VALUES (?, ?, ?, ?)',
      [assignmentId, studentId, fileName, isLate]
    );
    
    const message = isLate ? 'Assignment submitted successfully (Late submission marked)' : 'Assignment submitted successfully';
    res.json({ success: true, message, isLate });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Download assignment file
const downloadAssignment = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.params;
    connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(
      'SELECT file FROM assignments WHERE id = ?',
      [assignmentId]
    );
    
    if (assignments.length === 0 || !assignments[0].file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '../uploads/assignments', assignments[0].file);
    
    // Verify file exists before attempting download
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getDashboardData,
  getAssignments,
  getAssignmentDetails,
  submitAssignment,
  downloadAssignment
};
