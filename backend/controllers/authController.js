const pool = require('../config/db');

// Register user
const register = async (req, res) => {
  let connection;
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    connection = await pool.getConnection();
    
    // Check if email exists
    const [existingUser] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Insert user with plain text password
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Login user
const login = async (req, res) => {
  let connection;
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role required' });
    }

    connection = await pool.getConnection();
    
    // Find user by email
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Compare plain text password with database password
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    // Verify role matches
    if (user.role !== role) {
      return res.status(401).json({ success: false, message: `Please login as ${user.role}` });
    }
    
    // Store in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ success: true, message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

// Logout user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
};

// Get current user
const getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.session.user });
};

module.exports = { register, login, logout, getCurrentUser };
