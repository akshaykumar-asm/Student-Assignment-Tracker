import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import './CreateAssignment.css';

const EditAssignment = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAssignment = async () => {
    try {
      // Get all assignments and find the one with this ID
      const response = await axios.get('http://localhost:5000/api/teacher/assignments', {
        withCredentials: true
      });
      
      if (response.data.success) {
        const assignment = response.data.data.find(a => a.id === parseInt(id));
        if (assignment) {
          // Format the due_date to datetime-local format
          const dueDateObj = new Date(assignment.due_date);
          const formattedDate = dueDateObj.toISOString().slice(0, 16);
          
          setFormData({
            title: assignment.title,
            description: assignment.description || '',
            subject: assignment.subject,
            dueDate: formattedDate
          });
        } else {
          setError('Assignment not found');
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Error loading assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Title, subject, and due date are required; description is optional
    if (!formData.title || !formData.subject || !formData.dueDate) {
      setError('Title, subject, and due date are required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/teacher/update-assignment/${id}`,
        {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          dueDate: formData.dueDate
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Assignment updated successfully!');
        setTimeout(() => {
          window.location.href = '/teacher-assignments';
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading assignment...</div>;

  return (
    <div className="create-assignment">
      <div className="create-container">
        <div className="header-with-back">
          <a href="/teacher-assignments" className="back-link">
            <ArrowLeft size={20} /> Back to Assignments
          </a>
          <h1>Edit Assignment</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="assignment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topic Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter topic name"
              required
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter subject (e.g., Mathematics, Physics, History)"
              required
            />
          </div>

          <div className="form-group">
            <label>Assignment Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed description"
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <a href="/teacher-assignments" className="cancel-btn">
              Cancel
            </a>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignment;
