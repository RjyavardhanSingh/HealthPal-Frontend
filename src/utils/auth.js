import api from '../services/api';

// Simple utility functions for token management
export const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    api.setAuthToken(token);
    return true;
  }
  return false;
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  delete api.defaults?.headers?.common?.['Authorization'];
};