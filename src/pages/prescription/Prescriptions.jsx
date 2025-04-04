import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { motion } from 'framer-motion';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser) {
          setError('User authentication required');
          setLoading(false);
          return;
        }
        
        // First get the authenticated user's MongoDB ID
        const userResponse = await api.auth.getMe();
        if (!userResponse?.data?.data?._id) {
          throw new Error('Could not retrieve user ID');
        }
        
        const patientId = userResponse.data.data._id;
        
        // Now fetch prescriptions with the correct MongoDB ID
        const response = await api.prescriptions.getByPatient(patientId);
        setPrescriptions(response.data.data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.response?.data?.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    // Only fetch if we have a currentUser
    if (currentUser) {
      fetchPrescriptions();
    }
  }, [currentUser]);
  
  // Custom styles to match landing page aesthetics
  const customStyles = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(59, 130, 246, 0.1);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }
    
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
    }
    
    .active-badge {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    
    .expired-badge {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }
  `;
  
  // Helper function to check if prescription is active
  const isPrescriptionActive = (prescription) => {
    return new Date(prescription.expiryDate) >= new Date();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-blue-600 font-medium">Loading your prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className={`mb-6 flex items-center ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">My Prescriptions</h1>
            <p className="text-blue-600">View and manage your medications</p>
          </div>
        </div>
        
        {error ? (
          <div className="glass-card rounded-xl p-6 mb-6">
            <ErrorDisplay message={error} />
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((prescription, index) => (
              <motion.div
                key={prescription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-card rounded-xl overflow-hidden hover-lift ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {prescription.medications[0]?.name || 'Prescription'} 
                      {prescription.medications && prescription.medications.length > 1 && (
                        <span className="text-sm text-blue-600 ml-1">
                          + {prescription.medications.length - 1} more
                        </span>
                      )}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      isPrescriptionActive(prescription) 
                        ? 'active-badge' 
                        : 'expired-badge'
                    }`}>
                      {isPrescriptionActive(prescription) ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {prescription.doctor?.profileImage ? (
                      <img 
                        src={prescription.doctor.profileImage} 
                        alt={prescription.doctor.name} 
                        className="h-8 w-8 rounded-full object-cover mr-2"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-semibold">{prescription.doctor?.name?.charAt(0) || 'D'}</span>
                      </div>
                    )}
                    <p className="text-gray-700">
                      Dr. {prescription.doctor?.name || 'Unknown'}
                      {prescription.doctor?.specialization && (
                        <span className="text-gray-500 text-xs block">
                          {prescription.doctor.specialization}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Prescribed: {formatDate(prescription.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Expires: {formatDate(prescription.expiryDate)}</span>
                    </div>
                  </div>
                  
                  {prescription.medications && prescription.medications.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <h4 className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-2">Medications</h4>
                      <ul className="space-y-1">
                        {prescription.medications.slice(0, 2).map((med, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            • {med.name} ({med.dosage})
                          </li>
                        ))}
                        {prescription.medications.length > 2 && (
                          <li className="text-sm text-blue-600">
                            + {prescription.medications.length - 2} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <Link 
                    to={`/prescriptions/${prescription._id}`}
                    className="block w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-center text-white font-medium rounded-lg shadow-sm transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-8 text-center max-w-2xl mx-auto"
          >
            <div className="mb-4 bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No prescriptions found</h3>
            <p className="text-gray-500 mb-6">
              You don't have any prescriptions yet. Your doctor will add prescriptions after consultations.
            </p>
            <Link 
              to="/appointments/book"
              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              Book an Appointment
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;