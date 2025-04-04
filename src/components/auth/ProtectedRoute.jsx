import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Detailed debugging
  console.log('ProtectedRoute evaluation:');
  console.log('- Path:', location.pathname);
  console.log('- Is authenticated:', isAuthenticated);
  console.log('- Current user role:', currentUser?.role);
  console.log('- Allowed roles:', allowedRoles);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated at all - go to login
  if (!isAuthenticated || !currentUser) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.log(`Role ${currentUser.role} not allowed for this route`);
    
    // Redirect based on actual role
    if (currentUser.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;