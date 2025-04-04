import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await api.appointments.getById(id);
        setAppointment(response.data.data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleCancelAppointment = async () => {
    try {
      await api.appointments.cancel(id, cancellationReason);
      toast.success('Appointment canceled successfully');
      setShowCancelModal(false);
      
      // Refresh appointment data
      const response = await api.appointments.getById(id);
      setAppointment(response.data.data);
    } catch (err) {
      console.error('Error canceling appointment:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleJoinVideoCall = () => {
    if (!appointment._id) {
      toast.error('Appointment ID not found');
      return;
    }
    navigate(`/video-preparation/${appointment._id}`);
  };

  const isVideoAppointment = appointment && appointment.type === 'video';
  const isScheduled = appointment && appointment.status === 'scheduled';

  // Create appointment time with proper time component
  const appointmentTime = appointment ? new Date(appointment.date) : null;
  const currentTime = new Date();

  // Add the time component from appointment.time.start
  if (appointmentTime && appointment.time && appointment.time.start) {
    const [hours, minutes] = appointment.time.start.split(':').map(Number);
    appointmentTime.setHours(hours, minutes, 0, 0);
  }

  const timeDifference = appointmentTime ? (appointmentTime - currentTime) / (1000 * 60) : null;
  const isWithinTimeWindow = timeDifference !== null && Math.abs(timeDifference) < 30; // 30 min window

  const canJoinConsultation = isVideoAppointment && isScheduled;

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
    .stagger-4 { animation-delay: 0.4s; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
      border-radius: 12px;
    }
    
    .gradient-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
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
    
    .cancel-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      transition: all 0.3s ease;
    }
    
    .cancel-btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(220, 38, 38, 0.25);
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
          <p className="text-blue-600 font-medium">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pattern min-h-screen p-8">
        <div className="max-w-3xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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

  if (!appointment) {
    return (
      <div className="bg-pattern min-h-screen p-8">
        <div className="max-w-3xl mx-auto glass-card p-6 rounded-xl">
          <p className="text-center text-gray-600">Appointment not found</p>
        </div>
      </div>
    );
  }

  const isPastAppointment = new Date(appointment.date) < new Date();
  const canCancel = appointment.status === 'scheduled' && !isPastAppointment;

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-white/50 ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Appointments
        </button>
        
        <div className={`glass-card rounded-xl overflow-hidden shadow-lg ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-blue-800">Appointment Details</h1>
              </div>
              
              <div className="mt-4 md:mt-0">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  appointment.status === 'scheduled' ? 'bg-green-100 text-green-800 border border-green-200' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    appointment.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.isPaid ? 'Paid' : 'Payment Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}>
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Healthcare Provider
                </h2>
                <div className="flex items-center">
                  {appointment.doctor?.profileImage ? (
                    <img 
                      src={appointment.doctor.profileImage} 
                      alt={appointment.doctor.name} 
                      className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 border-2 border-white shadow-lg">
                      <span className="text-xl font-bold text-white">{appointment.doctor?.name?.charAt(0) || 'D'}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      {appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'Your Healthcare Provider'}
                    </h3>
                    <p className="text-blue-600 text-sm">{appointment.doctor?.specialization || 'Healthcare Professional'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Appointment Schedule
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{appointment.time?.start} - {appointment.time?.end}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {appointment.type === 'video' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      )}
                    </svg>
                    <span className="text-gray-700">
                      {appointment.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`mt-8 bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
              <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                </svg>
                Visit Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Reason for Visit</h3>
                  <p className="mt-1 text-gray-800">{appointment.reason || 'Not specified'}</p>
                </div>
                
                {appointment.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Doctor's Notes</h3>
                    <p className="mt-1 p-3 bg-blue-50 rounded-lg text-gray-800 border border-blue-100">{appointment.notes}</p>
                  </div>
                )}
                
                {appointment.status === 'cancelled' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Cancellation Reason</h3>
                    <p className="mt-1 p-3 bg-red-50 rounded-lg text-red-800 border border-red-100">{appointment.cancellationReason || 'No reason provided'}</p>
                  </div>
                )}
              </div>
            </div>
            
            {appointment.attachedRecords && appointment.attachedRecords.length > 0 && (
              <div className={`mt-8 bg-white/70 rounded-xl p-6 shadow-sm border border-blue-50 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                  </svg>
                  Attached Medical Records
                </h2>
                <div className="space-y-3">
                  {appointment.attachedRecords.map(record => (
                    <div key={record._id} className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                      <div>
                        <h3 className="font-medium text-blue-800">{record.title}</h3>
                        <p className="text-sm text-blue-600">
                          {new Date(record.date).toLocaleDateString()} | {record.recordType.replace('_', ' ')}
                        </p>
                      </div>
                      <Link 
                        to={`/medical-records/${record._id}`}
                        className="btn-primary px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Record
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`mt-8 flex flex-col md:flex-row justify-end gap-4 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
              {canCancel && (
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="cancel-btn px-6 py-3 rounded-xl shadow-md flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Appointment
                </button>
              )}
              
              {canJoinConsultation && (
                <button
                  onClick={handleJoinVideoCall}
                  className="btn-primary px-6 py-3 rounded-xl shadow-md flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Join Video Consultation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full m-4"
          >
            <h2 className="text-xl font-bold text-blue-800 mb-2">Cancel Appointment</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Please provide a reason for cancelling"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                className="cancel-btn px-6 py-2 rounded-lg shadow-md"
              >
                Cancel Appointment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;