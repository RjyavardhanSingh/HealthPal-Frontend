import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import RatingStars from "../components/common/RatingStars";
import { motion } from 'framer-motion';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Redirect doctors away from this page
    if (currentUser?.role === 'doctor') {
      navigate('/doctor/dashboard');
      return;
    }
    
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getById(id);
        setDoctor(response.data.data);
        
        // Additionally check if doctor is accepting appointments
        try {
          const availResponse = await api.doctors.getAvailableDates(id);
          setDoctor(prev => ({
            ...prev,
            isAcceptingAppointments: availResponse.data.isAcceptingAppointments !== false
          }));
        } catch (e) {
          console.error("Error checking doctor availability:", e);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setError('Failed to load doctor information');
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    fetchDoctorDetails();
  }, [id, currentUser, navigate]);
  
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
    
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
    }
    
    .info-circle {
      background: rgba(219, 234, 254, 0.4);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    
    .feature-icon {
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover .feature-icon {
      transform: translateY(-3px);
    }
  `;

  if (loading) {
    return (
      <div className="bg-pattern min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center heartbeat mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-blue-600 font-medium">Loading doctor's profile...</p>
        </div>
      </div>
    );
  }

  if (error) return <ErrorDisplay message={error} />;
  if (!doctor) return <ErrorDisplay message="Doctor not found" />;

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-white/50 ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Doctors
        </button>
        
        <div className={`glass-card rounded-xl overflow-hidden shadow-lg ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          {/* Hero section with doctor's photo and name */}
          <div className="relative overflow-hidden w-full h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute inset-0 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm112 376c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-88h-96v88c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V136c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v88h96v-88c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v240z"/>
              </svg>
            </div>
            <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-8">
              {doctor.profileImage ? (
                <img 
                  src={doctor.profileImage} 
                  alt={doctor.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mx-auto md:mx-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-xl border-4 border-white mx-auto md:mx-0">
                  <span className="text-3xl font-bold">{doctor.name.charAt(0)}</span>
                </div>
              )}
              
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center">
                  <h1 className="text-2xl font-bold text-gray-800">Dr. {doctor.name}</h1>
                  {doctor.isAcceptingAppointments === false ? (
                    <span className="mt-1 md:mt-0 md:ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      On Leave
                    </span>
                  ) : (
                    <span className="mt-1 md:mt-0 md:ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Available for Appointments
                    </span>
                  )}
                </div>
                <p className="text-blue-600 font-medium mt-1">{doctor.specialization}</p>
                <div className="flex items-center mt-2 justify-center md:justify-start">
                  <RatingStars rating={doctor.rating || 4.5} />
                  <span className="ml-2 text-sm text-gray-500">({doctor.reviews?.length || 0} reviews)</span>
                </div>
              </div>
            </div>
            
            {/* Doctor info grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}>
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50 feature-card">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Professional Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-800">{doctor.experience || '5+'} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium text-gray-800">${doctor.consultationFee}</p>
                    </div>
                  </div>
                  
                  {doctor.licenseNumber && (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium text-gray-800">{doctor.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50 feature-card">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Practice Information
                </h2>
                <div className="space-y-4">
                  {doctor.hospital && (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hospital</p>
                        <p className="font-medium text-gray-800">{doctor.hospital.name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-800">{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full info-circle flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium text-gray-800">
                        {doctor.isAcceptingAppointments !== false ? (
                          <span className="text-green-600">Available for appointments</span>
                        ) : (
                          <span className="text-amber-600">Currently on leave</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* About section */}
            {doctor.bio && (
              <div className={`bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50 mb-8 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Dr. {doctor.name}
                </h2>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
            )}
            
            {/* Warning if doctor is on leave */}
            {doctor.isAcceptingAppointments === false && (
              <div className={`mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
                <h3 className="font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Currently On Leave
                </h3>
                <p className="text-sm mt-1">This doctor is temporarily not accepting appointments. Please check back later or choose another healthcare provider.</p>
              </div>
            )}
            
            {/* Book appointment button */}
            <div className={`flex justify-center ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
              <button
                onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                className={`px-8 py-4 rounded-xl font-medium text-center shadow-lg ${
                  doctor.isAcceptingAppointments !== false
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={doctor.isAcceptingAppointments === false}
              >
                {doctor.isAcceptingAppointments !== false ? (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </span>
                ) : (
                  'Doctor Currently On Leave'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;