import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, AlertCircle, CheckCircle2, Star, X } from 'lucide-react';
import './ViewSubmissions.css';

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const [activeTab, setActiveTab] = useState('submitted');
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [gradingLoading, setGradingLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [submittedRes, pendingRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/teacher/submitted-students/${assignmentId}`, {
          withCredentials: true
        }),
        axios.get(`http://localhost:5000/api/teacher/pending-students/${assignmentId}`, {
          withCredentials: true
        })
      ]);

      if (submittedRes.data.success) {
        setSubmittedStudents(submittedRes.data.data);
      }
      if (pendingRes.data.success) {
        setPendingStudents(pendingRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const openGradeModal = async (submission) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/teacher/submission-details/${submission.id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const data = response.data.data;
        setSelectedSubmission(data);
        setGradeForm({
          grade: data.grade !== null ? data.grade : '',
          feedback: data.feedback || ''
        });
        setShowGradeModal(true);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Error loading submission details');
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!gradeForm.grade || gradeForm.grade === '') {
      alert('Please enter a grade');
      return;
    }
    
    const gradeNum = parseInt(gradeForm.grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      alert('Grade must be a number between 0 and 100');
      return;
    }
    
    setGradingLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/teacher/grade-submission/${selectedSubmission.id}`,
        {
          grade: gradeNum,
          feedback: gradeForm.feedback || null
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('Submission graded successfully!');
        setShowGradeModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      alert(error.response?.data?.message || 'Error grading submission');
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="view-submissions">
      <div className="submissions-container">
        <h1>Assignment Submissions</h1>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveTab('submitted')}
          >
            <CheckCircle2 size={18} /> Submitted ({submittedStudents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <AlertCircle size={18} /> Pending ({pendingStudents.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'submitted' && (
            <div className="students-list">
              {submittedStudents.length === 0 ? (
                <p className="empty">No submissions yet</p>
              ) : (
                submittedStudents.map(student => (
                  <div key={student.id} className={`student-item submitted ${student.grade !== null ? 'graded' : ''}`}>
                    <div className="student-info">
                      <h4>{student.name}</h4>
                      <p>{student.email}</p>
                      <div className="assignment-info">
                        <p className="assignment-title"><strong>Assignment:</strong> {student.assignment_title}</p>
                        <p className="assignment-subject"><strong>Subject:</strong> {student.subject}</p>
                      </div>
                      <p className="submitted-time">
                        Submitted: {new Date(student.submitted_at).toLocaleString()}
                      </p>
                      {student.submitted_late && (
                        <p className="late-badge">⚠️ Late Submission</p>
                      )}
                    </div>
                    <div className="grade-info">
                      {student.grade !== null ? (
                        <div className="graded-status">
                          <p className="grade-display">Grade: <strong>{student.grade}</strong></p>
                          {student.feedback && <p className="feedback-preview">{student.feedback.substring(0, 50)}...</p>}
                        </div>
                      ) : (
                        <span className="ungraded-badge">Not Graded</span>
                      )}
                    </div>
                    <div className="student-actions">
                      <a href={`http://localhost:5000/uploads/submissions/${student.file}`} target="_blank" rel="noopener noreferrer" className="download-link">
                        <Download size={18} /> Download
                      </a>
                      <button 
                        className="grade-btn"
                        onClick={() => openGradeModal(student)}
                      >
                        <Star size={18} /> {student.grade !== null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="students-list">
              {pendingStudents.length === 0 ? (
                <p className="empty">All students have submitted!</p>
              ) : (
                pendingStudents.map(student => (
                  <div key={student.id} className="student-item pending">
                    <div className="student-info">
                      <h4>{student.name}</h4>
                      <p>{student.email}</p>
                    </div>
                    <span className="pending-badge">Pending</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Grade Submission</h2>
              <button className="close-btn" onClick={() => setShowGradeModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="submission-info">
                <p><strong>Student:</strong> {selectedSubmission.name}</p>
                <p><strong>Email:</strong> {selectedSubmission.email}</p>
                <p><strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                {selectedSubmission.submitted_late && (
                  <p><strong style={{color: '#e74c3c'}}>⚠️ Late Submission</strong></p>
                )}
              </div>

              <form onSubmit={handleGradeSubmit}>
                <div className="form-group">
                  <label>Grade (out of 100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                    placeholder="Enter grade (0-100)"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Feedback (Optional)</label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                    placeholder="Add feedback for the student"
                    rows="4"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowGradeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={gradingLoading || !gradeForm.grade}>
                    {gradingLoading ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
