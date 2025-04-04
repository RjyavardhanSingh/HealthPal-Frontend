import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrescriptionForm from '../../components/forms/PrescriptionForm';

const ConsultationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setLoading(true);
        const response = await api.consultations.getById(id);
        setConsultation(response.data.data);
      } catch (err) {
        console.error('Error fetching consultation:', err);
        setError('Failed to load consultation details');
        toast.error('Failed to load consultation details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConsultation();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => navigate('/doctor/appointments')}
            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">Consultation not found</p>
          <button 
            onClick={() => navigate('/doctor/appointments')}
            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Consultation Details</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
              <div className="flex items-center mb-4">
                {consultation.patient?.profileImage ? (
                  <img src={consultation.patient.profileImage} alt={consultation.patient.name} className="h-12 w-12 rounded-full mr-4" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-medium">{consultation.patient?.name?.charAt(0) || 'P'}</span>
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{consultation.patient?.name}</h4>
                  <p className="text-sm text-gray-500">{consultation.patient?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Appointment Date:</span> {new Date(consultation.appointment?.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Consultation Type:</span> {consultation.appointment?.type}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis & Notes</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700">Reported Symptoms</h4>
                  <p className="mt-1">{consultation.symptoms}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Diagnosis</h4>
                  <p className="mt-1">{consultation.diagnosis}</p>
                </div>
                
                {consultation.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700">Additional Notes</h4>
                    <p className="mt-1">{consultation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {consultation.vitalSigns && Object.values(consultation.vitalSigns).some(val => val) && (
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {consultation.vitalSigns.temperature && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="text-xs text-blue-500 font-medium">Temperature</h4>
                    <p className="text-lg font-medium">{consultation.vitalSigns.temperature}</p>
                  </div>
                )}
                
                {consultation.vitalSigns.bloodPressure && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <h4 className="text-xs text-green-500 font-medium">Blood Pressure</h4>
                    <p className="text-lg font-medium">{consultation.vitalSigns.bloodPressure}</p>
                  </div>
                )}
                
                {consultation.vitalSigns.heartRate && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h4 className="text-xs text-red-500 font-medium">Heart Rate</h4>
                    <p className="text-lg font-medium">{consultation.vitalSigns.heartRate} bpm</p>
                  </div>
                )}
                
                {consultation.vitalSigns.respiratoryRate && (
                  <div className="bg-purple-50 p-3 rounded-md">
                    <h4 className="text-xs text-purple-500 font-medium">Respiratory Rate</h4>
                    <p className="text-lg font-medium">{consultation.vitalSigns.respiratoryRate} bpm</p>
                  </div>
                )}
                
                {consultation.vitalSigns.oxygenSaturation && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <h4 className="text-xs text-yellow-600 font-medium">O2 Saturation</h4>
                    <p className="text-lg font-medium">{consultation.vitalSigns.oxygenSaturation}%</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {consultation.followUpRequired && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-up</h3>
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Follow-up recommended on:</span>{' '}
                  {new Date(consultation.followUpDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Section */}
      {consultation.status === 'completed' && (
        <div className="mt-8">
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Prescriptions</h2>
            
            {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
              <div className="space-y-4">
                {consultation.prescriptions.map(prescription => (
                  <div key={prescription._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">
                        {prescription.medications[0].name}
                        {prescription.medications.length > 1 && ` + ${prescription.medications.length - 1} more`}
                      </h3>
                      <Link
                        to={`/doctor/prescriptions/${prescription._id}`}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View Details
                      </Link>
                    </div>
                    <p className="text-sm text-gray-600">
                      Prescribed on {new Date(prescription.createdAt).toLocaleDateString()} • 
                      Valid until {new Date(prescription.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6">
                <PrescriptionForm 
                  consultationId={consultation._id}
                  patientId={consultation.patient._id}
                  doctorId={currentUser._id}
                  onSuccess={(newPrescription) => {
                    // Update the consultation state to include the new prescription
                    setConsultation(prev => ({
                      ...prev,
                      prescriptions: [...(prev.prescriptions || []), newPrescription]
                    }));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDetails;