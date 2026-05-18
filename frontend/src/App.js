import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageTeachers from './pages/ManageTeachers';
import ManageStudents from './pages/ManageStudents';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import CreateAssignment from './pages/CreateAssignment';
import EditAssignment from './pages/EditAssignment';
import ViewAssignments from './pages/ViewAssignments';
import ViewSubmissions from './pages/ViewSubmissions';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentViewAssignments from './pages/StudentViewAssignments';
import SubmitAssignment from './pages/SubmitAssignment';

import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-teachers"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-students"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageStudents />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute requiredRole="teacher">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-assignment/:id"
          element={
            <ProtectedRoute requiredRole="teacher">
              <EditAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-assignments"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ViewAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-submissions/:assignmentId"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ViewSubmissions />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-assignments"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentViewAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-assignment/:assignmentId"
          element={
            <ProtectedRoute requiredRole="student">
              <SubmitAssignment />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
