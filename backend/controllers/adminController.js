const pool = require('../config/db');

// Get admin dashboard data
const getDashboardData = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [teachersResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "teacher"'
    );
    
    const [studentsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    );
    
    const [assignmentsResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM assignments'
    );
    
    const data = {
      totalTeachers: teachersResult[0].count,
      totalStudents: studentsResult[0].count,
      totalAssignments: assignmentsResult[0].count
    };
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get all teachers
const getTeachers = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [teachers] = await connection.execute(
      'SELECT id, name, email FROM users WHERE role = "teacher"'
    );
    
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Get all students
const getStudents = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [students] = await connection.execute(
      'SELECT id, name, email FROM users WHERE role = "student"'
    );
    
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Add teacher
const addTeacher = async (req, res) => {
  let connection;
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    connection = await pool.getConnection();
    
    const [existing] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'teacher']
    );
    
    res.json({ success: true, message: 'Teacher added successfully' });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Add student
const addStudent = async (req, res) => {
  let connection;
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    connection = await pool.getConnection();
    
    const [existing] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'student']
    );
    
    res.json({ success: true, message: 'Student added successfully' });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE id = ? AND role = "teacher"', [id]);
    
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE id = ? AND role = "student"', [id]);
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Reset password
const resetPassword = async (req, res) => {
  let connection;
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and new password required' });
    }

    connection = await pool.getConnection();
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    connection = await pool.getConnection();
    
    // Check if email already exists (for other users)
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ? AND role = "teacher"',
      [email, id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Update with optional password
    if (password) {
      await connection.execute(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = "teacher"',
        [name, email, password, id]
      );
    } else {
      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ? AND role = "teacher"',
        [name, email, id]
      );
    }
    
    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update student
const updateStudent = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    connection = await pool.getConnection();
    
    // Check if email already exists (for other users)
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ? AND role = "student"',
      [email, id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Update with optional password
    if (password) {
      await connection.execute(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = "student"',
        [name, email, password, id]
      );
    } else {
      await connection.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ? AND role = "student"',
        [name, email, id]
      );
    }
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Update user details (legacy)
const updateUserDetails = async (req, res) => {
  let connection;
  try {
    const { userId, name, email } = req.body;
    
    if (!userId || !name || !email) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    connection = await pool.getConnection();
    await connection.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
    
    res.json({ success: true, message: 'User details updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getDashboardData,
  getTeachers,
  getStudents,
  addTeacher,
  addStudent,
  deleteTeacher,
  deleteStudent,
  resetPassword,
  updateUserDetails,
  updateTeacher,
  updateStudent
};
