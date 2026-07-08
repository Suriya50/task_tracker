import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy load pages
const Login = React.lazy(() => import('../pages/Login/Login'));
const Register = React.lazy(() => import('../pages/Register/Register'));
const Dashboard = React.lazy(() => import('../pages/Dashboard/Dashboard'));
const Projects = React.lazy(() => import('../pages/Projects/Projects'));
const Tasks = React.lazy(() => import('../pages/Tasks/Tasks'));
const Chat = React.lazy(() => import('../pages/Chat/Chat'));
const Calendar = React.lazy(() => import('../pages/Calendar/Calendar'));
const Profile = React.lazy(() => import('../pages/Profile/Profile'));
const Settings = React.lazy(() => import('../pages/Settings/Settings'));
const Employees = React.lazy(() => import('../pages/Employees/Employees'));
const Meeting = React.lazy(() => import('../pages/Meeting/Meeting'));

const AppRoutes = () => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-darkBg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Private Routes (require authentication) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <PrivateRoute>
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="/meeting/:roomId"
          element={
            <PrivateRoute>
              <Meeting />
            </PrivateRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;