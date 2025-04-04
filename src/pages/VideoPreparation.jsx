import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { useAuth } from '../context/AuthContext';

const VideoPreparation = ({ userType }) => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const videoRef = useRef(null);
  const mediaStream = useRef(null);
  const countdownInterval = useRef(null);

  // Get user type from props or context
  const effectiveUserType = userType || currentUser?.role;

  console.log('VideoPreparation component:');
  console.log('- Appointment ID:', appointmentId);
  console.log('- User type:', effectiveUserType);
  console.log('- User role from context:', currentUser?.role);

  // Fetch appointment details when component loads
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);

        if (!appointmentId) {
          console.error('No appointment ID in URL parameters');
          setError('Missing appointment ID. Please return to appointments and try again.');
          setLoading(false);
          return;
        }

        console.log('Fetching appointment with ID:', appointmentId);
        const response = await api.appointments.getById(appointmentId);
        setAppointment(response.data.data);

        // Calculate countdown
        const appointmentTime = new Date(response.data.data.date);
        const timeParts = response.data.data.time.start.split(':');
        appointmentTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

        const currentTime = new Date();
        const timeUntilAppointment = Math.floor((appointmentTime - currentTime) / 1000);

        setCountdown(timeUntilAppointment > 0 ? timeUntilAppointment : 0);

        // Start countdown timer
        if (timeUntilAppointment > 0) {
          countdownInterval.current = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();

    // Cleanup on component unmount
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [appointmentId]);

  // Handle testing devices
  const handleTestDevices = async () => {
    try {
      if (mediaStream.current) {
        // Stop previous stream
        mediaStream.current.getTracks().forEach(track => track.stop());
      }

      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setCameraAccess(true);
      setMicrophoneAccess(true);

      // Display video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream.current;
      }

      toast.success('Camera and microphone access successful!');
    } catch (error) {
      console.error('Device access error:', error);
      toast.error('Failed to access camera or microphone. Please check your device permissions.');
    }
  };

  // Format countdown time
  const formatCountdown = (seconds) => {
    if (seconds === null) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Join video call
  const handleJoinCall = () => {
    if (!appointmentId) {
      toast.error('No appointment ID available');
      return;
    }

    // Stop any active media streams
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
    }

    // Use the current route pattern to determine the next route
    // This ensures doctor paths stay as doctor paths
    const currentPath = window.location.pathname;
    const isDoctor = currentPath.startsWith('/doctor/');
    
    console.log(`User is ${isDoctor ? 'doctor' : 'patient'}, navigating from ${currentPath}`);
    
    if (isDoctor) {
      navigate(`/doctor/video-consultation/${appointmentId}`);
    } else {
      navigate(`/video-consultation/${appointmentId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Prepare for Your Video Consultation</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Appointment with Dr. {appointment.doctor?.name || 'Doctor'}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })} at {appointment.time?.start}
                </p>
              </div>
            </div>

            {countdown !== null && countdown > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-blue-700">Your consultation starts in: {formatCountdown(countdown)}</span>
                </div>
              </div>
            )}

            {countdown !== null && countdown <= 0 && (
              <div className="mb-6 p-4 bg-green-50 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-green-700">Your consultation is ready to begin!</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Before You Begin:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet, well-lit private space</li>
                <li>Test your camera and microphone</li>
                <li>Have your medical history and any relevant documents ready</li>
                <li>Prepare a list of questions you want to ask the doctor</li>
              </ul>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium text-gray-900 mb-3">Test Your Devices</h3>
              <p className="text-sm text-gray-600 mb-4">
                We'll need access to your camera and microphone for the video consultation.
                Please test them now to ensure everything works properly.
              </p>

              <div className="space-y-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${cameraAccess ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.001 7.002V8.8l2.553-1.276a1 1 0 011.447.894v3.964a1 1 0 01-1.447.894L14.001 11V12.8" />
                  </svg>
                  <span className="text-sm text-gray-700">Camera: {cameraAccess ? 'Ready' : 'Not tested'}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${microphoneAccess ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Microphone: {microphoneAccess ? 'Ready' : 'Not tested'}</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleTestDevices}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Test Camera & Microphone
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/appointments')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Appointments
              </button>

              <button
                onClick={handleJoinCall}
                className="px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Join Video Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreparation;