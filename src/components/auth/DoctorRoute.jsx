import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const DoctorRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return currentUser?.role === 'doctor' ? children : <Navigate to="/" />;
};

export default DoctorRoute;