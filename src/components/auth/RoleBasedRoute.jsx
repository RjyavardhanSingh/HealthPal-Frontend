import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component to restrict routes based on user role
const RoleBasedRoute = ({ allowedRoles, redirectPath, children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(currentUser?.role)) {
    return <Navigate to={redirectPath || '/unauthorized'} />;
  }
  
  return children;
};

export default RoleBasedRoute;