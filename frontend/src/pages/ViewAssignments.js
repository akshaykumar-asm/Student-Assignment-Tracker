import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Users, Clock, Calendar, Edit2, X } from 'lucide-react';
import './ViewAssignments.css';

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionTime, setExtensionTime] = useState('23:59');
  const [submittingExtension, setSubmittingExtension] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/assignments', {
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

  const handleDownload = async (assignmentId) => {
    try {
      await axios.get(`http://localhost:5000/api/teacher/download-assignment/${assignmentId}`, {
        withCredentials: true,
        responseType: 'blob'
      });
      // Browser will handle the download
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const openExtensionModal = (assignment) => {
    setSelectedAssignment(assignment);
    const extensionDead = assignment.extension_deadline ? new Date(assignment.extension_deadline) : null;
    if (extensionDead) {
      setExtensionDate(extensionDead.toISOString().split('T')[0]);
      setExtensionTime(extensionDead.toTimeString().substring(0, 5));
    } else {
      setExtensionDate('');
      setExtensionTime('23:59');
    }
    setShowExtensionModal(true);
  };

  const handleSetExtension = async (e) => {
    e.preventDefault();
    if (!extensionDate) {
      alert('Please select a date');
      return;
    }

    setSubmittingExtension(true);
    try {
      const deadlineDateTime = `${extensionDate}T${extensionTime}:00`;
      const response = await axios.put(
        `http://localhost:5000/api/teacher/set-extension/${selectedAssignment.id}`,
        { extensionDeadline: deadlineDateTime },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('Extension deadline set successfully!');
        setShowExtensionModal(false);
        fetchAssignments();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error setting extension');
    } finally {
      setSubmittingExtension(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="assignments-view">
      <div className="assignments-container">
        <h1>My Assignments</h1>

        {assignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments created yet</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map(assignment => {
              const dueDate = new Date(assignment.due_date);
              const extensionDate = assignment.extension_deadline ? new Date(assignment.extension_deadline) : null;
              const now = new Date();
              const isOverdue = extensionDate ? now > extensionDate : now > dueDate;

              return (
                <div key={assignment.id} className="assignment-card">
                  <div className="card-header">
                    <h3>{assignment.title}</h3>
                    <span className={`due-badge ${isOverdue ? 'overdue' : ''}`}>
                      {isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>

                  <p className="description">{assignment.description.substring(0, 100)}...</p>

                  <div className="card-meta">
                    <span className="due-date">
                      <Clock size={16} />
                      Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                    </span>
                    {extensionDate && (
                      <span className="extension-deadline">
                        <Calendar size={16} />
                        Extended: {extensionDate.toLocaleDateString()} {extensionDate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="card-actions">
                    {assignment.file && (
                      <button
                        className="action-btn download-btn"
                        onClick={() => handleDownload(assignment.id)}
                        title="Download assignment file"
                      >
                        <Download size={16} /> Download
                      </button>
                    )}
                    <a href={`/edit-assignment/${assignment.id}`} className="action-btn edit-btn">
                      <Edit2 size={16} /> Edit
                    </a>
                    <a href={`/view-submissions/${assignment.id}`} className="action-btn submissions-btn">
                      <Users size={16} /> Submissions
                    </a>
                    <button
                      className="action-btn extension-btn"
                      onClick={() => openExtensionModal(assignment)}
                      title="Set extension deadline"
                    >
                      <Calendar size={16} /> Extend
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extension Modal */}
      {showExtensionModal && selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Extension Deadline</h2>
              <button className="close-btn" onClick={() => setShowExtensionModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="assignment-name">Assignment: <strong>{selectedAssignment.title}</strong></p>

              <form onSubmit={handleSetExtension}>
                <div className="form-group">
                  <label>Original Due Date</label>
                  <input
                    type="text"
                    value={new Date(selectedAssignment.due_date).toLocaleString()}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>New Extension Deadline Date *</label>
                  <input
                    type="date"
                    value={extensionDate}
                    onChange={(e) => setExtensionDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Time (Optional)</label>
                  <input
                    type="time"
                    value={extensionTime}
                    onChange={(e) => setExtensionTime(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowExtensionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={submittingExtension}>
                    {submittingExtension ? 'Setting...' : 'Set Extension'}
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

export default ViewAssignments;
