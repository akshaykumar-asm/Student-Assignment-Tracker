import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Upload, Clock, Star } from 'lucide-react';
import './StudentViewAssignments.css';

const StudentViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/assignments', {
        withCredentials: true
      });
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="student-assignments-view">
      <div className="assignments-container">
        <h1>Assignments</h1>

        {assignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments available</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map(assignment => {
              const dueDate = new Date(assignment.due_date);
              const extensionDate = assignment.extension_deadline ? new Date(assignment.extension_deadline) : null;
              const now = new Date();
              const isOverdue = extensionDate ? now > extensionDate : now > dueDate;
              const isSubmitted = !!assignment.submissionId;
              const isGraded = assignment.grade !== null;
              const isLate = assignment.submitted_late;

              return (
                <div key={assignment.id} className={`assignment-card ${isGraded ? 'graded' : ''}`}>
                  <div className="card-header">
                    <h3>{assignment.title}</h3>
                    <div className="badge-container">
                      <span className={`status-badge ${isGraded ? 'graded' : isSubmitted ? 'submitted' : isOverdue ? 'overdue' : 'pending'}`}>
                        {isGraded ? 'Graded' : isSubmitted ? (isLate ? '⚠️ Late' : 'Submitted') : isOverdue ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="subject-badge">
                    <strong>Subject:</strong> {assignment.subject}
                  </div>

                  <p className="description">{assignment.description.substring(0, 100)}...</p>

                  <div className="card-meta">
                    <span className="due-date">
                      <Clock size={16} />
                      Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                    </span>
                    {extensionDate && (
                      <span className="extension-date">
                        Extended: {extensionDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {isGraded && (
                    <div className="grade-section">
                      <div className="grade-display">
                        <Star size={18} />
                        <span className="grade-value">{assignment.grade}/100</span>
                      </div>
                      {assignment.feedback && (
                        <div className="feedback-section">
                          <p className="feedback-label">Feedback:</p>
                          <p className="feedback-text">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card-actions">
                    {assignment.file && (
                      <a
                        href={`http://localhost:5000/uploads/assignments/${assignment.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn download-btn"
                        title="Download assignment"
                      >
                        <Download size={16} /> Download
                      </a>
                    )}
                    <a href={`/submit-assignment/${assignment.id}`} className="action-btn submit-btn">
                      <Upload size={16} /> {isSubmitted ? 'View' : 'Submit'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentViewAssignments;
