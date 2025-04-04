import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments'); // Default to appointments tab
  
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Make sure to use the correct doctorPatientById endpoint with correct parameter
        const patientResponse = await api.doctors.getPatientById(id);
        setPatient(patientResponse.data.data);
        
        // Get appointments
        const appointmentsResponse = await api.appointments.getAll({ 
          patientId: id,
          doctorId: currentUser._id
        });
        setAppointments(appointmentsResponse.data.data || []);
        
        // Continue with the rest of your data fetching...
        try {
          const consultationsResponse = await api.consultations.getByPatient(id);
          setConsultations(consultationsResponse.data.data || []);
        } catch (err) {
          console.warn('Error fetching consultations:', err);
          setConsultations([]);
        }
        
        try {
          const prescriptionsResponse = await api.prescriptions.getByPatient(id);
          setPrescriptions(prescriptionsResponse.data.data || []);
        } catch (err) {
          console.warn('Error fetching prescriptions:', err);
          setPrescriptions([]);
        }
        
        try {
          const recordsResponse = await api.medicalRecords.getByPatient(id);
          setMedicalRecords(recordsResponse.data.data || []);
        } catch (err) {
          console.warn('Error fetching medical records:', err);
          setMedicalRecords([]);
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient information');
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUser) {
      fetchPatientData();
    }
  }, [id, currentUser]);

  if (loading) {
    return <div className="p-4 flex justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !patient) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error || 'Patient not found'}</p>
          <button 
            onClick={() => navigate('/doctor/patients')}
            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          >
            Back to Patients List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate('/doctor/patients')}
          className="mr-3 text-gray-500 hover:text-gray-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-bold">Patient Details</h1>
      </div>
      
      {/* Patient card */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-start">
          {patient.profileImage ? (
            <img 
              src={patient.profileImage} 
              alt={patient.name} 
              className="w-16 h-16 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <span className="text-primary-700 text-xl font-medium">{patient.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{patient.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {patient.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {patient.phone || 'Not provided'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Gender:</span> {patient.gender || 'Not provided'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">DOB:</span> {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Total Visits:</span> {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-4 border-b">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-2 ${activeTab === 'appointments' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-2 ${activeTab === 'consultations' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-2 ${activeTab === 'prescriptions' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('medical-records')}
            className={`pb-2 ${activeTab === 'medical-records' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Medical Records
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Appointments tab - now shown as default */}
        {activeTab === 'appointments' && (
          <div>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(appointment => (
                  <div key={appointment._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{new Date(appointment.date).toLocaleDateString()}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Time:</span> {appointment.time?.start} - {appointment.time?.end}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {appointment.type}
                    </p>
                    <p className="text-gray-600 mb-3 text-sm">
                      <span className="font-medium">Reason:</span> {appointment.reason || 'No reason provided'}
                    </p>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/doctor/appointments/${appointment._id}`}
                        className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded hover:bg-primary-100"
                      >
                        View Details
                      </Link>
                      {appointment.status === 'scheduled' && (
                        appointment.type === 'video' ? (
                          <Link 
                            to={`/doctor/video-preparation/${appointment._id}`}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100"
                          >
                            Start Consultation
                          </Link>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await api.appointments.updateStatus(appointment._id, 'completed');
                                toast.success('Marked as visited');
                                // Refresh data
                                const appointmentsResponse = await api.appointments.getAll({ patientId: id });
                                setAppointments(appointmentsResponse.data.data || []);
                              } catch (err) {
                                toast.error('Failed to update status');
                              }
                            }}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100"
                          >
                            Mark as Visited
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">No appointment history found for this patient</p>
            )}
          </div>
        )}
        
        {/* Other tabs remain unchanged */}
        {activeTab === 'consultations' && (
          <div>
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map(consultation => (
                  <div key={consultation._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{new Date(consultation.date).toLocaleDateString()}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${consultation.type === 'in-person' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {consultation.type === 'in-person' ? 'In-person' : 'Video'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Diagnosis:</span> {consultation.diagnosis || 'None'}
                    </p>
                    <p className="text-gray-600 mb-3 text-sm">{consultation.notes || 'No notes provided'}</p>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/consultations/${consultation._id}`}
                        className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded hover:bg-primary-100"
                      >
                        View Details
                      </Link>
                      {consultation.hasPrescription && (
                        <Link 
                          to={`/doctor/prescriptions?consultation=${consultation._id}`} // CORRECT ROUTE
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
                        >
                          View Prescription
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">No consultation history found for this patient</p>
            )}
          </div>
        )}
        
        {activeTab === 'prescriptions' && (
          <div>
            {prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">
                        {prescription.medications[0].name}
                        {prescription.medications.length > 1 && ` + ${prescription.medications.length - 1} more`}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${new Date(prescription.expiryDate) > new Date() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {new Date(prescription.expiryDate) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Prescribed on {new Date(prescription.createdAt).toLocaleDateString()} • 
                      Expires on {new Date(prescription.expiryDate).toLocaleDateString()}
                    </p>
                    <Link 
                      to={`/prescriptions/${prescription._id}`}
                      className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded hover:bg-primary-100"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">No prescriptions found for this patient</p>
            )}
          </div>
        )}
        
        {activeTab === 'medical-records' && (
          <div>
            {medicalRecords.length > 0 ? (
              <div className="space-y-4">
                {medicalRecords.map(record => (
                  <div key={record._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{record.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {record.recordType}
                    </p>
                    <p className="text-gray-600 mb-3 text-sm">{record.description || 'No description provided'}</p>
                    {record.fileUrl && (
                      <a 
                        href={record.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded hover:bg-primary-100"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">No medical records found for this patient</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;