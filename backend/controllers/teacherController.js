const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get teacher dashboard data
const getDashboardData = async (req, res) => {
  let connection;
  try {
    const teacherId = req.userId;
    connection = await pool.getConnection();
    
    const [assignmentsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM assignments WHERE teacher_id = ?',
      [teacherId]
    );
    
    const [submittedResult] = await connection.execute(
      'SELECT COUNT(DISTINCT s.assignment_id) as count FROM submissions s ' +
      'JOIN assignments a ON s.assignment_id = a.id WHERE a.teacher_id = ?',
      [teacherId]
    );
    
    const [allAssignments] = await connection.execute(
      'SELECT id FROM assignments WHERE teacher_id = ?',
      [teacherId]
    );
    
    const totalAssignments = assignmentsResult[0].count;
    const submittedCount = submittedResult[0].count;
    const pendingCount = Math.max(0, totalAssignments - submittedCount);
    
    const data = {
      totalAssignments: totalAssignments,
      submittedCount: submittedCount,
      pendingCount: pendingCount
    };
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Create assignment
const createAssignment = async (req, res) => {
  let connection;
  try {
    const { title, description, subject, dueDate } = req.body;
    const teacherId = req.userId;
    
    // Description is now optional
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, subject, and due date are required' });
    }

    let fileName = null;
    if (req.file) {
      fileName = req.file.filename;
    }

    connection = await pool.getConnection();
    
    await connection.execute(
      'INSERT INTO assignments (teacher_id, title, subject, description, file, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [teacherId, title, subject, description || null, fileName, dueDate]
    );
    
    res.json({ success: true, message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get all assignments for teacher
const getAssignments = async (req, res) => {
  let connection;
  try {
    const teacherId = req.userId;
    connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(
      'SELECT id, title, subject, description, file, due_date, created_at FROM assignments WHERE teacher_id = ? ORDER BY created_at DESC',
      [teacherId]
    );
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get submitted students for an assignment
const getSubmittedStudents = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.params;
    connection = await pool.getConnection();
    
    const [students] = await connection.execute(
      'SELECT s.id, u.id as student_id, u.name, u.email, a.title as assignment_title, a.subject, s.file, s.submitted_at, s.grade, s.feedback, s.submitted_late FROM users u ' +
      'JOIN submissions s ON u.id = s.student_id ' +
      'JOIN assignments a ON s.assignment_id = a.id ' +
      'WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC',
      [assignmentId]
    );
    
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get submitted students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get pending students for an assignment
const getPendingStudents = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.params;
    connection = await pool.getConnection();
    
    const [students] = await connection.execute(
      'SELECT id, name, email FROM users WHERE role = "student" AND id NOT IN ' +
      '(SELECT student_id FROM submissions WHERE assignment_id = ?)',
      [assignmentId]
    );
    
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Download submission file
const downloadSubmission = async (req, res) => {
  let connection;
  try {
    const { submissionId } = req.params;
    connection = await pool.getConnection();
    
    const [submissions] = await connection.execute(
      'SELECT file FROM submissions WHERE id = ?',
      [submissionId]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    const filePath = path.join(__dirname, '../uploads/submissions', submissions[0].file);
    
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

// Grade submission
const gradeSubmission = async (req, res) => {
  let connection;
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    // Validate grade
    if (grade === undefined || grade === null) {
      return res.status(400).json({ success: false, message: 'Grade is required' });
    }
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      return res.status(400).json({ success: false, message: 'Grade must be a number between 0 and 100' });
    }

    connection = await pool.getConnection();
    
    const [submissions] = await connection.execute(
      'SELECT id FROM submissions WHERE id = ?',
      [submissionId]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    await connection.execute(
      'UPDATE submissions SET grade = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
      [gradeNum, feedback || null, submissionId]
    );
    
    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get submission details with grades
const getSubmissionDetails = async (req, res) => {
  let connection;
  try {
    const { submissionId } = req.params;
    connection = await pool.getConnection();
    
    const [submissions] = await connection.execute(
      'SELECT s.id, s.assignment_id, s.student_id, s.file, s.submitted_at, s.grade, s.feedback, s.submitted_late, ' +
      'u.name, u.email FROM submissions s ' +
      'JOIN users u ON s.student_id = u.id WHERE s.id = ?',
      [submissionId]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.json({ success: true, data: submissions[0] });
  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update assignment extension deadline
const setExtensionDeadline = async (req, res) => {
  let connection;
  try {
    const { assignmentId } = req.params;
    const { extensionDeadline } = req.body;
    const teacherId = req.userId;
    
    if (!extensionDeadline) {
      return res.status(400).json({ success: false, message: 'Extension deadline required' });
    }

    connection = await pool.getConnection();
    
    const [assignments] = await connection.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );
    
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    await connection.execute(
      'UPDATE assignments SET extension_deadline = ? WHERE id = ?',
      [extensionDeadline, assignmentId]
    );
    
    res.json({ success: true, message: 'Extension deadline set successfully' });
  } catch (error) {
    console.error('Set extension deadline error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { title, description, subject, dueDate } = req.body;
    const teacherId = req.userId;
    
    // Title, subject, and due date are required
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, subject, and due date are required' });
    }

    connection = await pool.getConnection();
    
    // Verify assignment belongs to the logged-in teacher
    const [assignments] = await connection.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [id, teacherId]
    );
    
    if (assignments.length === 0) {
      return res.status(403).json({ success: false, message: 'You can only edit your own assignments' });
    }
    
    // Update the assignment
    await connection.execute(
      'UPDATE assignments SET title = ?, subject = ?, description = ?, due_date = ? WHERE id = ? AND teacher_id = ?',
      [title, subject, description || null, dueDate, id, teacherId]
    );
    
    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getDashboardData,
  createAssignment,
  getAssignments,
  getSubmittedStudents,
  getPendingStudents,
  downloadSubmission,
  downloadAssignment,
  gradeSubmission,
  getSubmissionDetails,
  setExtensionDeadline,
  updateAssignment
};
