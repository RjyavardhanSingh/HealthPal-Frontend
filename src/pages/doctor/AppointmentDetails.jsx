import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import PrescriptionForm from '../../components/prescription/PrescriptionForm';
import { useAuth } from '../../context/AuthContext'; // Add this import

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Add this line to get the current user
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await api.appointments.getById(id);
        setAppointment(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
        toast.error('Could not load appointment details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAppointment();
    }
  }, [id]);
  
  const handleStartConsultation = () => {
    if (!appointment?._id) {
      toast.error('Appointment ID not found');
      return;
    }
    
    console.log('Doctor starting consultation for appointment:', appointment._id);
    
    // Use doctor-specific video preparation path with proper prefix
    const preparationPath = `/doctor/video-preparation/${appointment._id}`;
    console.log('Navigating to:', preparationPath);
    
    navigate(preparationPath);
  };
  
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'completed' && appointment.type === 'in-person') {
      try {
        // First create a consultation
        const consultationData = {
          appointmentId: id,
          symptoms: appointment.reason || 'In-person visit',
          diagnosis: 'Examination completed during in-person visit', // Required field - can't be empty
          notes: 'Visit completed at hospital/clinic',
          vitalSigns: {},
          followUpRequired: false
        };
        
        const response = await api.consultations.create(consultationData);
        setConsultationId(response.data.data._id);
        
        // Now show the prescription form
        setShowPrescriptionModal(true);
      } catch (error) {
        console.error('Error creating consultation:', error);
        toast.error('Failed to initialize prescription');
      }
      return;
    }
    
    // Existing code for other status updates
    try {
      await api.appointments.updateStatus(id, newStatus);
      toast.success(`Appointment ${newStatus}`);
      // Refresh appointment data
      const response = await api.appointments.getById(id);
      setAppointment(response.data.data);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handlePrescriptionSuccess = async (prescription) => {
    setShowPrescriptionModal(false);
    
    // Complete the appointment
    try {
      await api.appointments.updateStatus(id, 'completed');
      toast.success('Appointment completed and prescription issued');
      
      // Refresh appointment data
      const response = await api.appointments.getById(id);
      setAppointment(response.data.data);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getFileIdFromUrl = (url) => {
    if (!url) return null;
    
    try {
      // Handle Cloudinary URL format
      if (url.includes('cloudinary.com')) {
        // Extract just the file ID without extension
        // Example: https://res.cloudinary.com/ddbltls3c/image/upload/v1741670268/healthpal/documents/ufbopix9jfnm25blnpwa.pdf
        const matches = url.match(/\/([^\/]+)\.[^\.]+$/);
        return matches ? matches[1] : null;
      }
      
      // Fallback to just getting the file name
      return url.split('/').pop().split('.')[0];
    } catch (error) {
      console.error('Error extracting file ID:', error);
      return null;
    }
  };

  const getFullApiUrl = (fileId) => {
    // Get the base API URL from environment or construct it
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}/api/files/${fileId}`;
  };

  const getSignedUrl = async (fileId) => {
    try {
      const response = await api.files.getSignedUrl(fileId);
      return response.data.url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast.error('Failed to generate file access link');
      return null;
    }
  };

  const handleViewFile = async (fileUrl) => {
    try {
      console.log('Opening file URL:', fileUrl);
      
      // Check if this is a Cloudinary URL (they need auth)
      if (fileUrl && fileUrl.includes('cloudinary.com')) {
        // Always get a signed URL for Cloudinary files
        const fileId = getFileIdFromUrl(fileUrl);
        if (!fileId) {
          toast.error('Invalid file URL');
          return;
        }
        
        const signedUrl = await getSignedUrl(fileId);
        if (signedUrl) {
          window.open(signedUrl, '_blank');
        } else {
          toast.error('Failed to get secure access to file');
        }
      } else if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
        // For non-Cloudinary URLs that are complete URLs, try direct access
        window.open(fileUrl, '_blank');
      } else {
        toast.error('Invalid file URL format');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Failed to open file');
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!appointment) return <ErrorDisplay message="Appointment not found" />;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Appointment Details</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {appointment.status === 'scheduled' && (
            <>
              {appointment.type === 'video' ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleStartConsultation}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Start Consultation
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Create a consultation if not already created
                        const consultationData = {
                          appointmentId: id,
                          symptoms: appointment.reason || 'Video consultation',
                          diagnosis: '',
                          notes: 'Video consultation',
                          vitalSigns: {},
                          followUpRequired: false
                        };
                        
                        const response = await api.consultations.create(consultationData);
                        setConsultationId(response.data.data._id);
                        
                        // Show prescription form
                        setShowPrescriptionModal(true);
                      } catch (error) {
                        console.error('Error creating consultation:', error);
                        toast.error('Failed to initialize prescription');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Prescription
                  </button>
                </div>
              ) : null}
              
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
              >
                Mark Completed
              </button>
              
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium mb-2">Patient Information</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p><span className="font-medium">Name:</span> {appointment.patient?.name}</p>
            <p><span className="font-medium">Email:</span> {appointment.patient?.email}</p>
            <p><span className="font-medium">Phone:</span> {appointment.patient?.phone || 'Not provided'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Appointment Details</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p><span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {appointment.time?.start} - {appointment.time?.end}</p>
            <p><span className="font-medium">Type:</span> {appointment.type}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Reason for Visit</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p>{appointment.reason || 'No reason provided'}</p>
        </div>
      </div>

      {appointment.attachedRecords && appointment.attachedRecords.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Medical Records</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="space-y-2">
              {appointment.attachedRecords.map(record => (
                <div key={record._id} className="bg-gray-50 p-3 rounded-md border flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString()} | {record.recordType?.replace('_', ' ')}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleViewFile(record.fileUrl || (record.files && record.files[0]?.url))}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    View
                  </button>
                  {record.files && record.files.length > 0 && (
                    <div className="mt-2">
                      {record.files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center mt-1 p-1 bg-gray-100 rounded">
                          <span className="text-xs text-gray-600">{file.name || `File ${index+1}`}</span>
                          <button 
                            onClick={() => handleViewFile(file.url)}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {appointment.notes && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Notes</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p>{appointment.notes}</p>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Appointments
        </button>
      </div>

      {appointment.type === 'video' && appointment.status === 'scheduled' && (
        <button
          onClick={handleStartConsultation}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Start Video Consultation
        </button>
      )}

      {showPrescriptionModal && consultationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PrescriptionForm 
              consultationId={consultationId}
              patientId={appointment.patient._id}
              doctorId={currentUser._id}
              onSuccess={handlePrescriptionSuccess}
              onCancel={() => setShowPrescriptionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;