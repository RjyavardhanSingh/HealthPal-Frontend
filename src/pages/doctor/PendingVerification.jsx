import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PendingVerification = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Add safety check to redirect if user is not logged in or not a doctor
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (currentUser.role !== 'doctor') {
      navigate('/');
      return;
    }
    
    if (currentUser.verificationStatus === 'approved') {
      navigate('/doctor/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Return a simple, static UI with no API calls
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Verification Pending
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account is currently under review by our administrators.
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your account is pending verification. Our team will review your credentials and license information. This process typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                You'll be notified when your verification is complete. In the meantime, you can check your verification status or logout.
              </p>
              
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => navigate('/doctor/verification-status')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Check Verification Status
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;