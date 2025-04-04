import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from './DoctorSidebar';

const DoctorLayout = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Add a check to ensure the user is a doctor
  useEffect(() => {
    console.log('DoctorLayout - Current user role:', currentUser?.role);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (currentUser?.role !== 'doctor') {
      console.log('Non-doctor attempting to access doctor routes, redirecting to home');
      navigate('/');
    }
  }, [currentUser, isAuthenticated, navigate]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;