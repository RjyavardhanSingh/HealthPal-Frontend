import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PrescriptionForm from '../components/prescription/PrescriptionForm';
import ReviewDialog from '../components/review/ReviewDialog';

// Helper function to attempt video play with multiple approaches
const attemptVideoPlay = (videoElement) => {
  if (!videoElement) return false;

  console.log('Attempting to play video with multiple methods');

  // Try standard play
  videoElement.play().catch(err => {
    console.log('Standard play failed, trying alternatives', err);

    // Try with user interaction trigger
    document.addEventListener('click', function playOnClick() {
      videoElement.play().catch(e => console.error('Click play failed:', e));
      document.removeEventListener('click', playOnClick);
    }, { once: true });

    // Try with muted first (browsers are more permissive with muted videos)
    videoElement.muted = true;
    videoElement.play().then(() => {
      console.log('Play succeeded with mute, now attempting unmute');
      // If muted play works, try to unmute after user interaction
      document.addEventListener('click', function unmuteOnClick() {
        videoElement.muted = false;
        document.removeEventListener('click', unmuteOnClick);
      }, { once: true });
    }).catch(e => console.error('Even muted play failed:', e));
  });
};

const checkPermissions = async () => {
  try {
    // Check if permissions API is available
    if (navigator.permissions) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      console.log('Camera permission state:', cameraPermission.state);

      if (cameraPermission.state === 'denied') {
        toast.error('Camera access is blocked. Please update your browser settings.');
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      }
    }
  } catch (err) {
    console.log('Permission check not supported');
  }
};

const VideoConsultation = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const id = params.appointmentId || params.id;

  console.log('VideoConsultation rendering with ID:', id);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Media stream states
  const [localStream, setLocalStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // Refs
  const chatContainerRef = useRef(null);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const agoraServiceRef = useRef(null);

  // Fetch appointment and initialize video call
  useEffect(() => {
    let isMounted = true;
    let cleanupListener = null;

    const initializeVideoCall = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Initializing video call for appointment:', id);

        // First get appointment details
        const appointmentResponse = await api.appointments.getById(id);
        if (!isMounted) return;
        setAppointment(appointmentResponse.data.data);

        // Join socket room for chat
        socketService.joinConsultation(id);

        // Listen for messages with improved handler
        cleanupListener = socketService.listenForMessages(id, (message) => {
          if (isMounted) {
            console.log('Got message in component:', message);
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });

            // Auto-scroll chat to bottom
            setTimeout(() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }, 100);
          }
        });

        // Generate channel name consistently
        const channelName = `healthpal_${id}`;
        console.log('Using channel name:', channelName);

        try {
          // Request token from server
          const tokenResponse = await api.video.getToken({
            channelName,
            uid: 0,
            role: 'publisher'
          });

          if (!tokenResponse?.data?.token) {
            throw new Error('Failed to get token from server');
          }

          const { token } = tokenResponse.data;
          console.log('Received token successfully');

          // Initialize Agora client
          const { default: agoraService } = await import('../services/agoraService');
          agoraServiceRef.current = agoraService;

          // Reset client to ensure clean state
          await agoraService.resetClient();

          // Initialize client with event handlers
          await agoraService.initialize();

          // Join the channel with a slight delay to ensure initialization is complete
          setTimeout(async () => {
            if (!isMounted) return;

            try {
              // Join the channel
              const tracks = await agoraService.joinChannel(channelName, token);
              console.log('Successfully joined Agora channel with tracks:', tracks);

              // Set connected state
              setConnected(true);
            } catch (joinError) {
              console.error('Error joining Agora channel:', joinError);
              initializeMedia(); // Fall back to regular WebRTC
            }
          }, 1000);
        } catch (agoraError) {
          console.error('Error setting up Agora:', agoraError);
          initializeMedia(); // Fall back to regular WebRTC
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error setting up video call:', err);
          setError(`Failed to initialize video call: ${err.message}`);
          initializeMedia(); // Try fallback
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeVideoCall();

    return () => {
      isMounted = false;

      // Clean up message listener
      if (cleanupListener) {
        cleanupListener();
      }

      // Clean up socket connection
      socketService.disconnect();

      // Clean up Agora channel
      if (agoraServiceRef.current) {
        agoraServiceRef.current.leaveChannel().catch(err => {
          console.error('Error leaving Agora channel:', err);
        });
      }

      // Clean up media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, currentUser?.role]);

  // Initialize regular WebRTC media (fallback)
  const initializeMedia = async () => {
    try {
      console.log('Initializing WebRTC media fallback');

      // Define explicit constraints for better compatibility
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      // Request media access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got media stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label} (${t.readyState})`));

      // Store stream reference
      mediaStreamRef.current = stream;
      setLocalStream(stream);

      // Set local video element source
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        try {
          await localVideoRef.current.play();
          console.log('Local video playing successfully');
        } catch (playErr) {
          console.error('Error playing local video:', playErr);

          // Add a play button as fallback for autoplay restrictions
          const container = document.getElementById('local-video-container');
          if (container) {
            const playButton = document.createElement('button');
            playButton.textContent = 'Start Camera';
            playButton.className = 'absolute inset-0 w-full h-full bg-black bg-opacity-50 text-white flex items-center justify-center';
            playButton.onclick = () => {
              localVideoRef.current.play();
              playButton.remove();
            };
            container.appendChild(playButton);
          }
        }
      }

      setConnected(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(`Could not access camera/microphone: ${err.message}`);
      toast.error('Failed to access camera or microphone');
    }
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    // Try to toggle Agora video first
    if (agoraServiceRef.current && agoraServiceRef.current.localTracks) {
      try {
        const newState = agoraServiceRef.current.toggleVideo();
        console.log('Toggled camera to:', newState);
        setIsCameraOn(newState);
        return;
      } catch (err) {
        console.error('Error toggling Agora video:', err);
      }
    }

    // Fallback to WebRTC
    if (mediaStreamRef.current) {
      const newState = !isCameraOn;
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = newState;
      });
      setIsCameraOn(newState);
    }
  };

  // Toggle microphone on/off
  const toggleMic = () => {
    // Try to toggle Agora audio first
    if (agoraServiceRef.current && agoraServiceRef.current.localTracks) {
      try {
        const newState = agoraServiceRef.current.toggleAudio();
        console.log('Toggled microphone to:', newState);
        setIsMicOn(newState);
        return;
      } catch (err) {
        console.error('Error toggling Agora audio:', err);
      }
    }

    // Fallback to WebRTC
    if (mediaStreamRef.current) {
      const newState = !isMicOn;
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });
      setIsMicOn(newState);
    }
  };

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender: currentUser.role,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    const messageWithId = socketService.sendMessage(id, messageData);
    setMessages(prevMessages => [...prevMessages, messageWithId]);
    setNewMessage('');

    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // End consultation handler
  const handleEndConsultation = async () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      try {
        setLoading(true);

        // Clean up video/audio
        if (agoraServiceRef.current) {
          await agoraServiceRef.current.leaveChannel();
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // If doctor is ending the consultation, mark it as completed
        if (currentUser.role === 'doctor') {
          try {
            await api.appointments.update(id, { status: 'completed' });
            console.log('Appointment marked as completed');
            // Doctors don't need to review patients, so just navigate back
            navigate('/doctor/appointments');
            toast.success('Consultation completed successfully');
          } catch (updateErr) {
            console.error('Error updating appointment status:', updateErr);
            toast.error('There was an issue updating the appointment status');
            navigate('/doctor/appointments');
          }
        } else {
          // For patients, show the review dialog
          setShowReviewDialog(true);
        }

      } catch (error) {
        console.error('Error ending consultation:', error);
        toast.error('Failed to end consultation properly');
      } finally {
        setLoading(false);
      }
    }
  };

  // Review dialog closing handler
  const handleReviewClose = (reviewed) => {
    setShowReviewDialog(false);

    // Navigate back to appointments page
    navigate('/appointments');
    
    if (reviewed) {
      toast.success('Thank you for your feedback!');
    }
  };

  const handleReconnect = () => {
    setReconnecting(true);
    toast.info("Reconnecting to video call...");

    // Clean up existing connections
    if (agoraServiceRef.current) {
      agoraServiceRef.current.leaveChannel().catch(err => {
        console.error('Error leaving Agora channel during reconnect:', err);
      });
    }

    // Stop any existing media streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Force window reload to reinitialize everything
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Setting up your video consultation...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate(`/appointments/${id}`)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          >
            Back to Appointment
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-4">Appointment not found</div>;
  }

  const otherPerson = currentUser.role === 'doctor'
    ? appointment.patient
    : { name: `Dr. ${appointment.doctor.name}` };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Video Consultation</h1>
            <span className={`ml-4 rounded-full w-3 h-3 inline-block ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="ml-2 text-sm font-medium">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{appointment?.patient?.name || 'Patient'}</span>
            <span className="mx-2">•</span>
            <span>{new Date(appointment?.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {/* Video area */}
          <div className="md:col-span-2">
            {/* Remote video container */}
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
              {/* Status indicators */}
              <div className="absolute top-4 left-4 z-30 flex space-x-2">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${isCameraOn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {isCameraOn ? 'On' : 'Off'}
                </div>

                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${isMicOn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {isMicOn ? 'On' : 'Off'}
                </div>
              </div>

              <div id="remote-video-container" className="w-full h-full flex items-center justify-center">
                {!connected && (
                  <div className="text-gray-400 text-center flex flex-col items-center justify-center absolute inset-0 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg">Waiting for other participant...</p>
                  </div>
                )}
              </div>

              {/* Local video miniature */}
              <div className="absolute bottom-4 right-4 w-1/4 h-1/4 bg-gray-900 border-2 border-white rounded overflow-hidden z-20">
                <div id="local-video-container" className="w-full h-full">
                  {/* No video element here - Agora will create it */}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="font-medium text-gray-700 mb-2">Patient Information</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {appointment.patient?.name}</p>
                <p><span className="font-medium">Reason for visit:</span> {appointment.reason}</p>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="h-[500px] flex flex-col border rounded-lg">
            <div className="bg-gray-50 border-b px-4 py-2">
              <h2 className="font-medium">Chat with {otherPerson.name}</h2>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 p-4 space-y-4 overflow-y-auto"
            >
              {!connected ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Waiting for {currentUser.role === 'doctor' ? 'patient' : 'doctor'} to join...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Start your conversation here...</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.sender === currentUser.role ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'system'
                          ? 'bg-gray-200 text-gray-700 mx-auto text-center'
                          : msg.sender === currentUser.role
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-2 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center">
        <div className="bg-gray-800 bg-opacity-70 rounded-full px-6 py-3 flex space-x-4">
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full ${isCameraOn ? 'bg-primary-600 text-white' : 'bg-red-600 text-white'} transition-all duration-200 flex items-center justify-center`}
            title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isCameraOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </button>
          
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${isMicOn ? 'bg-primary-600 text-white' : 'bg-red-600 text-white'} transition-all duration-200 flex items-center justify-center`}
            title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isMicOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
          
          {currentUser.role === 'doctor' && (
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
              title="Write Prescription"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleEndConsultation}
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
            title="End Consultation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reconnect Button */}
      {!loading && (
        <div className="text-center my-4">
          <button
            onClick={handleReconnect}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={reconnecting}
          >
            {reconnecting ? 'Reconnecting...' : 'Reconnect Video'}
            {reconnecting ? (
              <span className="ml-2">
                <LoadingSpinner size="sm" />
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Reconnect Button in Video Area */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={handleReconnect}
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 flex items-center"
          title="Reconnect video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reconnect
        </button>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Write Prescription</h2>
            <PrescriptionForm
              consultationId={consultationId}
              patientId={appointment?.patient?._id}
              doctorId={currentUser?._id}
              onSuccess={() => {
                setShowPrescriptionModal(false);
                toast.success('Prescription added successfully');
              }}
              onCancel={() => setShowPrescriptionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {showReviewDialog && appointment && (
        <ReviewDialog
          doctorId={appointment.doctor._id}
          doctorName={appointment.doctor.name}
          appointmentId={id}
          onClose={handleReviewClose}
        />
      )}
    </div>
  );
};

export default VideoConsultation;