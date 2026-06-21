import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './routes/ProtectedRoute';

// Layout & Pages
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Notices from './pages/Notices';
import Resources from './pages/Resources';

// Feature Pages
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import Assignments from './pages/Assignments';
import ManageAssignments from './pages/ManageAssignments';
import Quizzes from './pages/Quizzes';
import ManageQuizzes from './pages/ManageQuizzes';

// New Portal Custom Modules
import MySlips from './pages/MySlips';
import MyResults from './pages/MyResults';
import SessionalMarks from './pages/SessionalMarks';
import UploadResults from './pages/UploadResults';
import SessionalMarksTeacher from './pages/SessionalMarksTeacher';
import HODEnrollmentApproval from './pages/HODEnrollmentApproval';
import OnlineLectures from './pages/OnlineLectures';
import LectureRoom from './pages/LectureRoom';
import Timetable from './pages/Timetable';

// Admin / HOD Pages
import ManageUsers from './pages/ManageUsers';
import ManageCourses from './pages/ManageCourses';
import HODDashboard from './pages/HODDashboard';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Authentication Screens */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Fullscreen Secure Lecture Room (Distraction-free) */}
          <Route 
            path="/lecture/:meetingId" 
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <LectureRoom />
              </ProtectedRoute>
            } 
          />

          {/* Secure Workspace Modules inside MainLayout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root path to Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Common Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* General Bulletin board and shared Library */}
            <Route path="notices" element={<Notices />} />
            <Route path="resources" element={<Resources />} />

            {/* Courses views */}
            <Route path="courses" element={<Courses />} />
            
            {/* Online Lectures List */}
            <Route path="lectures" element={<OnlineLectures />} />

            {/* Timetable View */}
            <Route 
              path="timetable" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <Timetable />
                </ProtectedRoute>
              } 
            />

            {/* Student specific metrics */}
            <Route 
              path="attendance" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Attendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="assignments" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Assignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="quizzes" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Quizzes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="slips" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MySlips />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="results" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="sessional" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SessionalMarks />
                </ProtectedRoute>
              } 
            />

            {/* Teacher specific portals */}
            <Route 
              path="attendance/mark" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <MarkAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="assignments/manage" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <ManageAssignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="quizzes/manage" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <ManageQuizzes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="results/upload" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <UploadResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="sessional/manage" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <SessionalMarksTeacher />
                </ProtectedRoute>
              } 
            />

            {/* Administrator configurations */}
            <Route 
              path="admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/courses" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageCourses />
                </ProtectedRoute>
              } 
            />

            {/* HOD Analytics section */}
            <Route 
              path="hod/analytics" 
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <HODDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="hod/enrollments" 
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <HODEnrollmentApproval />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
