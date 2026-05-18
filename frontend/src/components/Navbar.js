import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/current-user', {
          withCredentials: true
        });
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    const baseLinks = [
      { to: `/${user.role}-dashboard`, label: 'Dashboard' },
    ];

    if (user.role === 'admin') {
      baseLinks.push(
        { to: '/manage-teachers', label: 'Teachers' },
        { to: '/manage-students', label: 'Students' }
      );
    } else if (user.role === 'teacher') {
      baseLinks.push(
        { to: '/teacher-assignments', label: 'Assignments' },
        { to: '/create-assignment', label: 'Create Assignment' }
      );
    } else if (user.role === 'student') {
      baseLinks.push(
        { to: '/student-assignments', label: 'Assignments' }
      );
    }

    return baseLinks;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-text">Assignment Tracker</span>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {user && (
            <>
              <div className="nav-links">
                {getNavLinks().map((link) => (
                  <a
                    key={link.to}
                    href={link.to}
                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="navbar-right">
                <span className="user-info">
                  {user.role.toUpperCase()} - {user.name}
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
