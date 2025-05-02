import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupCard from './pages/signUp';
import SignInCard from './pages/signIn';
import UserApplicationForm from './component/form';
import StudentDashboard from './pages/student';
import ApproverDashboard from './pages/approver';

// Protects private routes
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!authToken || !user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// Prevents access to public routes if already logged in
const PublicRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (authToken && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignInCard />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupCard />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {JSON.parse(localStorage.getItem('user'))?.userType === 'student' ? (
                <StudentDashboard />
              ) : (
                <ApproverDashboard />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <UserApplicationForm />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
