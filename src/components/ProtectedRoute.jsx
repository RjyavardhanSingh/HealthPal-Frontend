import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    // Redirect based on role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/doctor-verification" replace />;
    } else if (currentUser.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;