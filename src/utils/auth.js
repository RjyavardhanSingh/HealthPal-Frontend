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

// Add this function to check if the JWT token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if token has expiration
    if (!decodedPayload.exp) return false;
    
    // Compare expiration timestamp with current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
};