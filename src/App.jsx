import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import MainLayout from './components/layout/MainLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import DoctorRoute from './components/auth/DoctorRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Notifications from './pages/Notifications';

// Import pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import FindDoctor from './pages/patient/FindDoctor';
import DoctorDetails from './pages/DoctorDetails';
import BookAppointment from './pages/appointment/BookAppointment';
import AppointmentList from './pages/appointment/AppointmentList';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PatientDetails from './pages/doctor/PatientDetails';
import AppointmentManagement from './pages/doctor/AppointmentManagement';
import AvailabilityManagement from './pages/doctor/AvailabilityManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MedicalRecords from './pages/medical-record/MedicalRecordList';
import Prescriptions from './pages/prescription/Prescriptions';
import AppointmentDetails from './pages/appointment/AppointmentDetails';
import PrescriptionDetails from './pages/prescription/PrescriptionDetails';
import MedicalRecordDetail from './pages/medical-record/MedicalRecordDetail';
import VideoPreparation from './pages/VideoPreparation';
import VideoConsultation from './pages/VideoConsultation';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorSettings from './pages/Settings';
import ConsultationDetails from './pages/doctor/ConsultationDetails';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorPrescriptionDetails from './pages/doctor/DoctorPrescriptionDetails';
import VerificationStatus from './pages/doctor/VerificationStatus';
import AdminLayout from './components/layout/AdminLayout';
import DoctorVerification from './pages/admin/DoctorVerification';

const App = () => {
  const [validatingToken, setValidatingToken] = useState(true);
  
  // Validate token on app launch
  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidatingToken(true);
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (!token || !savedUser) {
          // No token or user data, clear any partial auth state
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setValidatingToken(false);
          return;
        }
        
        // Set API auth header
        api.setAuthToken(token);
        
        try {
          // Use the API service instead of raw fetch, and the proper URL from env vars
          const response = await api.auth.verifyToken();
          
          if (response.data && response.data.success) {
            console.log('Token validated successfully');
            // Don't need to do anything - auth context will load from localStorage
          } else {
            console.warn('Token validation failed with response:', response);
            // Only clear if we get an explicit invalid token response
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          
          // Only clear auth state for auth-specific errors
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Auth error, clearing credentials');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
          } else {
            // For network errors or other issues, keep credentials
            console.log('Non-auth error, preserving credentials');
          }
        }
      } finally {
        setValidatingToken(false);
      }
    };
    
    validateToken();
  }, []);
  
  if (validatingToken) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
          <ToastContainer position="top-right" autoClose={5000} />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

const AppContent = () => {
  const auth = useAuth();
  const [forceLoaded, setForceLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!auth) {
    return <LoadingSpinner />;
  }

  const { isAuthenticated, currentUser, isLoading } = auth;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setForceLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Log auth state on changes
  useEffect(() => {
    if (currentUser) {
      console.log('Auth state initialized. User role:', currentUser.role);
    } else if (!isLoading) {
      console.log('No authenticated user found');
      
      // Don't redirect to login if already on login or public pages
      const publicPaths = ['/login', '/register', '/landing', '/forgot-password'];
      if (!publicPaths.some(path => location.pathname.startsWith(path))) {
        console.log('Redirecting to login from:', location.pathname);
      }
    }
  }, [currentUser, isLoading, location.pathname]);

  if (isLoading && !forceLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            currentUser?.role === 'doctor' ? 
              <Navigate to="/doctor/dashboard" replace /> : 
              <Navigate to="/home" replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          !isAuthenticated ? <Register /> : (
            currentUser?.role === 'doctor' ? 
              <Navigate to="/doctor/dashboard" replace /> : 
              <Navigate to="/home" replace />
          )
        } 
      />
      <Route path="/" element={
        isLoading ? <LoadingSpinner /> : (
          isAuthenticated ? (
            currentUser?.role === 'doctor' ? 
              <Navigate to="/doctor/dashboard" replace /> : 
              currentUser?.role === 'admin' ?
                <Navigate to="/admin/doctor-verification" replace /> :
                <Navigate to="/home" replace />
          ) : (
            <Navigate to="/landing" replace />
          )
        )
      } />

      {/* Patient routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/find-doctor" element={
          <PrivateRoute>
            <FindDoctor />
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute>
            <AppointmentList />
          </PrivateRoute>
        } />
        <Route path="/appointments/:id" element={
          <PrivateRoute>
            <AppointmentDetails />
          </PrivateRoute>
        } />
        <Route path="/prescriptions" element={
          <PrivateRoute>
            <Prescriptions />
          </PrivateRoute>
        } />
        <Route path="/prescriptions/:id" element={
          <PrivateRoute>
            <PrescriptionDetails />
          </PrivateRoute>
        } />
        <Route path="/medical-records" element={
          <PrivateRoute>
            <MedicalRecords />
          </PrivateRoute>
        } />
        <Route path="/medical-records/:id" element={
          <PrivateRoute>
            <MedicalRecordDetail />
          </PrivateRoute>
        } />
        <Route path="doctors/:id" element={<DoctorDetails />} />
        <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="/video-preparation/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <VideoPreparation userType="patient" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-consultation/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <VideoConsultation userType="patient" />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
      </Route>

      {/* Doctor routes with DoctorLayout */}
      <Route path="/doctor" element={
        <DoctorRoute>
          <DoctorLayout />
        </DoctorRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="appointments/:id" element={<AppointmentDetails />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="consultations/:id" element={<ConsultationDetails />} />
        <Route path="availability" element={<AvailabilityManagement />} />
        <Route path="verification-pending" element={<VerificationStatus />} />
        
        {/* Add these new prescription routes */}
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="prescriptions/:id" element={<DoctorPrescriptionDetails />} />
        
        {/* Existing routes */}
        <Route path="profile" element={<DoctorProfile />} /> 
        <Route path="settings" element={<DoctorSettings />} />
        
        {/* Video consultation routes */}
        <Route path="video-preparation/:appointmentId" element={<VideoPreparation userType="doctor" />} />
        <Route path="video-consultation/:appointmentId" element={<VideoConsultation userType="doctor" />} />
      </Route>

      {/* Admin routes with AdminLayout */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/doctor-verification" replace />} />
        <Route path="doctor-verification" element={<DoctorVerification />} />
        {/* Add other admin routes as needed */}
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
    </Routes>
  );
};

export default App;