import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, userToken, loading } = useAuth();
  const location = useLocation();

  // Add debugging information
  console.log('PrivateRoute debug:');
  console.log('- Current path:', location.pathname);
  console.log('- Loading state:', loading);
  console.log('- User authenticated:', !!currentUser);
  console.log('- Token exists:', !!userToken);

  // If still checking authentication status, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser || !userToken) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authentication successful, render the protected route
  console.log('Authentication successful, rendering protected route');
  return children;
};

export default PrivateRoute;