import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import './ManageUsers.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '' });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students', {
        withCredentials: true
      });
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/add-student', formData, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess('Student added successfully');
        setFormData({ name: '', email: '', password: '' });
        setShowForm(false);
        fetchStudents();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditFormData({ name: student.name, email: student.email, password: '' });
    setShowEditModal(true);
    setError('');
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editFormData.name || !editFormData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      const updateData = { name: editFormData.name, email: editFormData.email };
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/update-student/${editingStudentId}`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Student updated successfully');
        setShowEditModal(false);
        setEditFormData({ name: '', email: '', password: '' });
        setEditingStudentId(null);
        fetchStudents();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/admin/student/${id}`, {
          withCredentials: true
        });

        if (response.data.success) {
          setSuccess('Student deleted successfully');
          fetchStudents();
        }
      } catch (error) {
        setError('Error deleting student');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-users">
      <div className="manage-container">
        <div className="manage-header">
          <h1>Manage Students</h1>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Add Student
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <form className="user-form" onSubmit={handleAddStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Student name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Student email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">Add Student</button>
          </form>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Student</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormData({ name: '', email: '', password: '' });
                  }}
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateStudent}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Student name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    placeholder="Student email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password (Optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <button type="submit" className="submit-btn">Update Student</button>
              </form>
            </div>
          </div>
        )}

        <div className="users-table">
          <div className="table-header">
            <div className="table-cell">Name</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Actions</div>
          </div>

          {students.map(student => (
            <div key={student.id} className="table-row">
              <div className="table-cell">{student.name}</div>
              <div className="table-cell">{student.email}</div>
              <div className="table-cell actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditStudent(student)}
                  title="Edit student"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteStudent(student.id)}
                  title="Delete student"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
