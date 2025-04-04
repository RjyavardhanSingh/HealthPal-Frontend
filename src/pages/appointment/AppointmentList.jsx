import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [contentLoaded, setContentLoaded] = useState(false);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch all appointments first
        console.log('Fetching all appointments for appointment list');
        const response = await api.appointments.getAll();
        console.log('Appointments response:', response);
        
        if (response.data.success) {
          setAppointments(response.data.data || []);
        } else {
          setError('Failed to load appointments');
          setAppointments([]);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments: ' + (err.response?.data?.message || err.message));
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    switch (activeTab) {
      case 'upcoming':
        return appointment.status === 'scheduled';
      case 'completed':
        return appointment.status === 'completed';
      case 'missed':
        return appointment.status === 'no-show' || appointment.status === 'cancelled';
      default:
        return true;
    }
  });

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
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }
    
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 20px rgba(59, 130, 246, 0.15);
    }
    
    .gradient-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
  `;

  // Helper function to format appointment time
  const formatAppointmentTime = (date, time) => {
    if (!date || !time) return "";
    const timeString = time.start;
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Update the isAppointmentSoon function

  // Modify this function to always return true for video appointments
  const isAppointmentSoon = (appointment) => {
    // Always show join button for video appointments
    return appointment.type === 'video' && appointment.status === 'scheduled';
  };

  if (loading) {
    return (
      <div className="bg-pattern min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center heartbeat mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-blue-600 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pattern min-h-screen p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      <div className="max-w-4xl mx-auto">
        <div className={contentLoaded ? "animate-slide-up" : "opacity-0"}>
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-800">My Appointments</h1>
          </div>
          
          {/* Tab navigation */}
          <div className={`glass-card rounded-xl mb-6 overflow-hidden shadow-lg ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}>
            <nav className="flex divide-x divide-blue-100">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-3 px-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'upcoming'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${activeTab === 'upcoming' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upcoming
                </div>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-3 px-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'completed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${activeTab === 'completed' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed
                </div>
              </button>
              <button
                onClick={() => setActiveTab('missed')}
                className={`flex-1 py-3 px-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'missed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${activeTab === 'missed' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelled/No-show
                </div>
              </button>
            </nav>
          </div>
          
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div 
                  key={appointment._id} 
                  className={`glass-card gradient-border hover-lift rounded-xl overflow-hidden ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                >
                  <div className={`p-5 ${appointment.type === 'video' ? 'border-l-4 border-blue-500' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {appointment.doctor?.profileImage ? (
                          <img 
                            src={appointment.doctor.profileImage} 
                            alt={appointment.doctor.name} 
                            className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mr-4 border-2 border-white shadow-md">
                            {appointment.doctor?.name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'Your Healthcare Provider'}
                          </h3>
                          <p className="text-blue-600 text-sm">{appointment.doctor?.specialization || 'Medical Professional'}</p>
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</span>
                            <span className="mx-1 text-gray-300">•</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              {formatAppointmentTime(appointment.date, appointment.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            appointment.type === 'video' ? 'bg-blue-100 text-blue-800' : 
                            appointment.type === 'phone' ? 'bg-amber-100 text-amber-800' : 
                            'bg-teal-100 text-teal-800'
                          }`}>
                            {appointment.type === 'video' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {appointment.type === 'phone' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            )}
                            {appointment.type === 'in-person' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            )}
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          </div>
                        </div>
                        <div>
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Link 
                            to={`/appointments/${appointment._id}`} 
                            className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center justify-end"
                          >
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show reason for visit */}
                    {appointment.reason && (
                      <div className="mt-3 pt-3 border-t border-blue-50">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      </div>
                    )}
                    
                    {/* Show Join Call button for video appointments within time window */}
                    {isAppointmentSoon(appointment) && (
                      <div className="mt-3 pt-3 border-t border-blue-50">
                        <Link
                          to={`/video-preparation/${appointment._id}`}
                          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium gradient-primary text-white hover:opacity-90 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Video Call
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="glass-card rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No {activeTab} appointments found</h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming appointments scheduled." 
                    : activeTab === 'completed'
                      ? "You haven't completed any appointments yet."
                      : "You don't have any cancelled or missed appointments."}
                </p>
                {activeTab === 'upcoming' && (
                  <Link 
                    to="/find-doctor" 
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium gradient-primary text-white hover:opacity-90 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find a Doctor
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;