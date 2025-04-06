import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update the AuthProvider component's useEffect
  useEffect(() => {
    const loadSavedAuthState = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        const savedUserJson = localStorage.getItem('currentUser');
        
        if (!token || !savedUserJson) {
          setLoading(false);
          return;
        }
        
        // Set the API token
        api.setAuthToken(token);
        
        // Parse and validate saved user data
        try {
          const savedUser = JSON.parse(savedUserJson);
          
          if (!savedUser || !savedUser.role) {
            console.error('Saved user data is invalid', savedUser);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            setLoading(false);
            return;
          }
          
          console.log('Restoring auth state for user role:', savedUser.role);
          
          // Set the auth context state
          setUserToken(token);
          setCurrentUser(savedUser);
        } catch (parseError) {
          console.error('Failed to parse saved user data', parseError);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedAuthState();
  }, []);

  // Add the signup function
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Firebase signup error:", error);
      throw error;
    }
  };

  // Update the login function in AuthContext to handle toast notifications
  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      console.log('Attempting login with:', email);
      
      // Clear any existing auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      api.setAuthToken(null);
      
      // Make the login request
      const response = await api.auth.login(email, password);
      
      console.log('Login response status:', response.status);
      
      if (response.data.success) {
        // Special case: Account created with social login
        if (response.data.useSocialLogin) {
          // We'll return a special object to indicate social login required
          return {
            success: false,
            useSocialLogin: true,
            message: response.data.message
          };
        }
        
        // Normal login success
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        // Set auth header for API requests
        api.setAuthToken(response.data.token);
        
        // Update context
        setUserToken(response.data.token);
        setCurrentUser(response.data.user);
        
        // Check if doctor is pending verification
        const isPending = 
          response.data.user.role === 'doctor' && 
          response.data.user.verificationStatus !== 'approved';
        
        setIsPendingVerification(isPending);
        
        // Show success toast here
        toast.success('Login successful!');
        
        return {
          success: true,
          pendingVerification: isPending
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserToken(null);
      setCurrentUser(null);
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Clear auth header
      api.setAuthToken(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };
  
  // Add the clearAuthState function that was missing
  const clearAuthState = () => {
    setUserToken(null);
    setCurrentUser(null);
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Clear auth header
    api.setAuthToken(null);
  };

  const value = {
    currentUser,
    userToken,
    isAuthenticated: !!userToken,
    isPendingVerification,
    login,
    logout,
    signup,
    clearAuthState,
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    authError,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);