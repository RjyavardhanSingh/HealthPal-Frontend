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

  // Update the login function
  const login = async (email, password) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      console.log('Attempting login with:', email);
      const response = await api.auth.login(email, password);
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.success) {
        // IMPORTANT FIX: Store with consistent key names
        localStorage.setItem('authToken', response.data.token); // Use authToken not token
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        // Update API authorization header
        api.setAuthToken(response.data.token);
        
        // Update context state
        setUserToken(response.data.token);
        setCurrentUser(response.data.user);
        
        // Check verification status for doctors
        const isPending = response.data.user.role === 'doctor' && 
                          response.data.user.verificationStatus !== 'approved';
        setIsPendingVerification(isPending);
        
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