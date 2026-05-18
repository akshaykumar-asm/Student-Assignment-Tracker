import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import './CreateAssignment.css';

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    file: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('dueDate', formData.dueDate);
      if (formData.file) {
        data.append('file', formData.file);
      }

      const response = await axios.post('http://localhost:5000/api/teacher/create-assignment', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Assignment created successfully!');
        setFormData({
          title: '',
          description: '',
          subject: '',
          dueDate: '',
          file: null
        });
        setTimeout(() => {
          window.location.href = '/teacher-assignments';
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-assignment">
      <div className="create-container">
        <h1>Create New Assignment</h1>

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

            <div className="form-group">
              <label>Upload File (PDF, DOC, DOCX)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx"
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  <Upload size={20} />
                  {formData.file ? formData.file.name : 'Choose File'}
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
