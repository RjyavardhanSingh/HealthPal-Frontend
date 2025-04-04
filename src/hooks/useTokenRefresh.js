import { useEffect } from 'react';
import { auth } from '../config/firebase';
import api from '../services/api';

export const useTokenRefresh = (refreshInterval = 10 * 60 * 1000) => { // 10 minutes
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.log("No Firebase user for token refresh");
          return;
        }
        
        // Check if token is actually nearing expiration (to avoid unnecessary refreshes)
        try {
          const decodedToken = await firebaseUser.getIdTokenResult();
          const expirationTime = new Date(decodedToken.expirationTime).getTime();
          const now = Date.now();
          const timeToExpire = expirationTime - now;
          
          // Only refresh if token will expire within 15 minutes
          if (timeToExpire > 15 * 60 * 1000) {
            console.log("Token not close to expiry, skipping refresh");
            return;
          }
        } catch (decodeError) {
          console.log("Couldn't check token expiration, refreshing anyway");
        }
        
        console.log("Refreshing Firebase token");
        const idToken = await firebaseUser.getIdToken(true);
        
        // Update stored token
        localStorage.setItem('authToken', idToken);
        api.setAuthToken(idToken);
        
        console.log("Firebase token refreshed successfully");
      } catch (error) {
        console.error("Token refresh error:", error);
      }
    };

    // Initial refresh
    refreshToken();
    
    // Set up interval for token refresh
    const interval = setInterval(refreshToken, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
};

export default useTokenRefresh;

