import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileCheck, Clock, BookOpen } from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teacher/dashboard', {
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
        <h1>Teacher Dashboard</h1>

        <div className="teacher-dashboard-grid">
          <div className="dashboard-card total-card">
            <div className="card-icon">
              <BookOpen size={40} />
            </div>
            <div className="card-content">
              <h3>Total Assignments</h3>
              <p className="card-number">{dashboardData?.totalAssignments || 0}</p>
            </div>
          </div>

          <div className="dashboard-card submitted-card">
            <div className="card-icon">
              <FileCheck size={40} />
            </div>
            <div className="card-content">
              <h3>Submitted</h3>
              <p className="card-number">{dashboardData?.submittedCount || 0}</p>
            </div>
          </div>

          <div className="dashboard-card pending-card">
            <div className="card-icon">
              <Clock size={40} />
            </div>
            <div className="card-content">
              <h3>Pending</h3>
              <p className="card-number">{dashboardData?.pendingCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
