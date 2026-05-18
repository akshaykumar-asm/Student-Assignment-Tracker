import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
        role: activeTab
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const role = response.data.user.role;
        navigate(`/${role}-dashboard`);
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <div className="header-content">
            <div className="header-icon">
              {/* <BookOpen size={48} /> */}
            </div>
            <h1>Assignment Tracker</h1>
            <p>Your Simple Digital Classroom Solution</p>
          </div>
        </div>

        <div className="login-container">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setError(''); }}
            >
              Admin
            </button>
            <button
              className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
              onClick={() => { setActiveTab('teacher'); setError(''); }}
            >
              Teacher
            </button>
            <button
              className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => { setActiveTab('student'); setError(''); }}
            >
              Student
            </button>
          </div>

          <div className="tab-content">
            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          {/* <div className="demo-credentials">
              <p><strong>Demo Admin Login:</strong></p>
              <p>Email: admin@example.com</p>
              <p>Password: admin123</p>
            </div> */}
          </div>
        </div>

        <div className="register-link">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
