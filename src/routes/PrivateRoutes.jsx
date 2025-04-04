import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Update protected routes that should be inaccessible to doctors
export const DoctorRestrictedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser?.role === 'doctor') {
    // Redirect doctors away from find-doctor or book-appointment pages
    return <Navigate to="/doctor/dashboard" />;
  }
  
  return children;
};

// Then wrap routes in your main router:
// <DoctorRestrictedRoute>
//   <Route path="/find-doctor" element={<FindDoctor />} />
//   <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
// </DoctorRestrictedRoute>