import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Meetings from './pages/Meeting';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Meeting from './pages/Meeting'; // ✅ ADDED
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';
import { loadUser } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  if (isLoading) {
    return <Loader fullPage />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <Meetings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* ✅ ADDED: Video Call Route */}
        <Route
          path="/meeting/:roomId"
          element={
            <ProtectedRoute>
              <Meeting />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;