import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import UserUIView from './components/UserUIView';
import AdminDashboard from './components/AdminDashboard';
import Notes from './components/Notes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Combined Login and Signup */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />

          {/* User / Employee Portal */}
          <Route path="/userUI" element={<UserUIView />} />
          <Route path="/employee" element={<UserUIView />} />
          <Route path="/app" element={<UserUIView />} />

          {/* Admin Console & Management */}
          <Route path="/admin" element={<AdminDashboard initialTab="patches" />} />
          <Route path="/patch-dashboard" element={<AdminDashboard initialTab="patches" />} />
          <Route path="/static-content-admin" element={<AdminDashboard initialTab="documents" />} />

          {/* Preserved Notes */}
          <Route path="/notes" element={<Notes />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
