/**
 * Main Application Component
 *
 * Handles routing, authentication state, and layout structuring for the entire application.
 * This is the root component that renders different routes based on authentication status.
 *
 * @module App
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Pipelines from './pages/pipelines/Pipelines';
import PipelineDetail from './pages/pipelines/PipelineDetail';
import BuildDetail from './pages/builds/BuildDetail';
import Organizations from './pages/organizations/Organizations';
import OrganizationDetail from './pages/organizations/OrganizationDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Redux actions
import { initializeAuth, clearAuth } from './features/auth/authSlice';
import { initializeSocket } from './features/socket/socketSlice';

// Auth utilities
import { verifySession } from './utils/authGuard';

// Theme provider
import { ThemeProvider } from './hooks/useTheme';

// Loading spinner component
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * Main App component
 * @returns {JSX.Element} The rendered application
 */
const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  
  /**
   * Initialize authentication state on app load
   */
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  /**
   * Initialize WebSocket connection when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(initializeSocket());
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Session verification on page visibility change
   * This handles cases where the user returns to the app after it's been in the background
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Verify session when page becomes visible
        if (!verifySession()) {
          dispatch(clearAuth());
          navigate('/auth/login');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, isAuthenticated, navigate]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes - accessible to all users */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth routes - redirect to dashboard if already authenticated */}
        <Route element={<AuthLayout />}>
          <Route 
            path="/auth/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/forgot-password" 
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/reset-password" 
            element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />} 
          />
        </Route> 

        {/* Protected routes - require authentication */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/auth/login" replace />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pipelines" element={<Pipelines />} />
          <Route path="pipelines/:pipelineId" element={<PipelineDetail />} />
          <Route path="builds/:buildId" element={<BuildDetail />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="organizations/:organizationId" element={<OrganizationDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
