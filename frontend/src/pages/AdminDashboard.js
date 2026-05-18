import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, UserCheck } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          withCredentials: true
        });
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>

        <div className="dashboard-grid">
          <div className="dashboard-card teachers-card">
            <div className="card-icon">
              <Users size={40} />
            </div>
            <div className="card-content">
              <h3>Total Teachers</h3>
              <p className="card-number">{dashboardData?.totalTeachers || 0}</p>
            </div>
          </div>

          <div className="dashboard-card students-card">
            <div className="card-icon">
              <UserCheck size={40} />
            </div>
            <div className="card-content">
              <h3>Total Students</h3>
              <p className="card-number">{dashboardData?.totalStudents || 0}</p>
            </div>
          </div>

          <div className="dashboard-card assignments-card">
            <div className="card-icon">
              <BookOpen size={40} />
            </div>
            <div className="card-content">
              <h3>Total Assignments</h3>
              <p className="card-number">{dashboardData?.totalAssignments || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
