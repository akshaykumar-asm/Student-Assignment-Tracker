import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus, X, Trash2Icon, Trash } from 'lucide-react';
import './ManageUsers.css';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '' });
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/teachers', {
        withCredentials: true
      });
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
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

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/add-teacher', formData, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess('Teacher added successfully');
        setFormData({ name: '', email: '', password: '' });
        setShowForm(false);
        fetchTeachers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding teacher');
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacherId(teacher.id);
    setEditFormData({ name: teacher.name, email: teacher.email, password: '' });
    setShowEditModal(true);
    setError('');
  };

  const handleUpdateTeacher = async (e) => {
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
        `http://localhost:5000/api/admin/update-teacher/${editingTeacherId}`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Teacher updated successfully');
        setShowEditModal(false);
        setEditFormData({ name: '', email: '', password: '' });
        setEditingTeacherId(null);
        fetchTeachers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/admin/teacher/${id}`, {
          withCredentials: true
        });

        if (response.data.success) {
          setSuccess('Teacher deleted successfully');
          fetchTeachers();
        }
      } catch (error) {
        setError('Error deleting teacher');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-users">
      <div className="manage-container">
        <div className="manage-header">
          <h1>Manage Teachers</h1>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Add Teacher
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showForm && (
          <form className="user-form" onSubmit={handleAddTeacher}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Teacher name"
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
                  placeholder="Teacher email"
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
            <button type="submit" className="submit-btn">Add Teacher</button>
          </form>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Teacher</h2>
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
              <form onSubmit={handleUpdateTeacher}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Teacher name"
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
                    placeholder="Teacher email"
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
                <button type="submit" className="submit-btn">Update Teacher</button>
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

          {teachers.map(teacher => (
            <div key={teacher.id} className="table-row">
              <div className="table-cell">{teacher.name}</div>
              <div className="table-cell">{teacher.email}</div>
              <div className="table-cell actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditTeacher(teacher)}
                  title="Edit teacher"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  title="Delete teacher"
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

export default ManageTeachers;
