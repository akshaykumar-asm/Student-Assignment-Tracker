import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Upload, AlertCircle, Star } from 'lucide-react';
import './SubmitAssignment.css';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const [assignmentData, setAssignmentData] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/assignment/${assignmentId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setAssignmentData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Assignment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('assignmentId', assignmentId);
      data.append('file', file);

      const response = await axios.post('http://localhost:5000/api/student/submit-assignment', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setFile(null);
        setTimeout(() => {
          window.location.href = '/student-assignments';
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!assignmentData) {
    return <div className="submit-assignment"><div className="error-message">Assignment not found</div></div>;
  }

  const dueDate = new Date(assignmentData.due_date);
  const extensionDate = assignmentData.extension_deadline ? new Date(assignmentData.extension_deadline) : null;
  const now = new Date();
  const isDueSoon = !extensionDate ? (dueDate - now < 24 * 60 * 60 * 1000 && dueDate > now) : (extensionDate - now < 24 * 60 * 60 * 1000 && extensionDate > now);
  const isPastExtension = extensionDate ? now > extensionDate : now > dueDate;
  const isAlreadySubmitted = !!assignmentData.submission;
  const isGraded = assignmentData.submission && assignmentData.submission.grade !== null;
  const isLate = assignmentData.submission && assignmentData.submission.submitted_late;

  return (
    <div className="submit-assignment">
      <div className="submit-container">
        <button className="back-btn" onClick={() => window.history.back()}>← Back</button>

        <div className="assignment-details">
          <h1>{assignmentData.title}</h1>

          <div className="assignment-info">
            <div className={`due-info ${isPastExtension ? 'past-deadline' : isDueSoon ? 'due-soon' : ''}`}>
              <p><strong>Due Date:</strong></p>
              <p>{dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}</p>
              
              {extensionDate && (
                <div className="extension-info">
                  <p><strong>Extended To:</strong></p>
                  <p>{extensionDate.toLocaleDateString()} {extensionDate.toLocaleTimeString()}</p>
                </div>
              )}
              
              {isPastExtension && (
                <p className="past-deadline-warning">
                  <AlertCircle size={16} />
                  ✕ Submission deadline has passed. No more submissions allowed.
                </p>
              )}
              
              {isDueSoon && !isPastExtension && (
                <p className="due-soon-warning">
                  <AlertCircle size={16} />
                  ⚠ Due very soon! Submit your work.
                </p>
              )}
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{assignmentData.description}</p>
          </div>

          {assignmentData.file && (
            <div className="file-section">
              <a
                href={`http://localhost:5000/uploads/assignments/${assignmentData.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-file-btn"
              >
                <Download size={18} /> Download Assignment File
              </a>
            </div>
          )}

          {isAlreadySubmitted ? (
            <div className="submission-info">
              <h3>Your Submission</h3>
              <p className={`submitted-badge ${isLate ? 'late' : ''}`}>
                Submitted At: {new Date(assignmentData.submission.submitted_at).toLocaleString()}
                {isLate && ' (⚠️ Late Submission)'}
              </p>
              
              {isGraded && (
                <div className="grade-info-section">
                  <div className="grade-display-large">
                    <Star size={24} />
                    <span className="grade-large">Grade: {assignmentData.submission.grade}/100</span>
                  </div>
                  {assignmentData.submission.feedback && (
                    <div className="feedback-box">
                      <h4>Teacher's Feedback:</h4>
                      <p>{assignmentData.submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
              
              <a
                href={`http://localhost:5000/uploads/submissions/${assignmentData.submission.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-file-btn"
              >
                <Download size={18} /> Download Your Submission
              </a>
            </div>
          ) : (
            <>
              {isPastExtension ? (
                <div className="error-message blocked-message">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Submission Closed</strong>
                    <p>The deadline for this assignment has passed. No further submissions are accepted.</p>
                  </div>
                </div>
              ) : (
                <form className="submission-form" onSubmit={handleSubmit}>
                  <h3>Submit Your Assignment</h3>

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <div className="form-group">
                    <label>Upload File (PDF, DOC, DOCX) *</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        id="submission-file"
                        required
                      />
                      <label htmlFor="submission-file" className="file-label">
                        <Upload size={24} />
                        <span>{file ? file.name : 'Click to select file'}</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitAssignment;
