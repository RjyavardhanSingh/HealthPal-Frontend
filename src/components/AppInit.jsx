import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import api from '../services/api';

const AppInit = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setCurrentUser, setUserToken, setIsPendingVerification } = useAuth();
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for saved auth state
        const token = localStorage.getItem('authToken');
        const savedUserJson = localStorage.getItem('currentUser');
        
        if (!token || !savedUserJson) {
          console.log('No saved auth state found');
          setIsInitialized(true);
          return;
        }
        
        // Parse saved user data
        const savedUser = JSON.parse(savedUserJson);
        
        // Set token in API client
        api.setAuthToken(token);
        
        try {
          // Verify token is still valid
          await api.auth.verify();
          
          // If verification passes, restore auth state
          setUserToken(token);
          setCurrentUser(savedUser);
          
          // For doctors, check verification status
          if (savedUser.role === 'doctor') {
            setIsPendingVerification(savedUser.verificationStatus !== 'approved');
          }
          
          console.log('Auth state restored successfully');
        } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          
          // Clear invalid auth state
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, [setCurrentUser, setUserToken, setIsPendingVerification]);
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600">Initializing app...</p>
      </div>
    );
  }
  
  return children;
};

export default AppInit;