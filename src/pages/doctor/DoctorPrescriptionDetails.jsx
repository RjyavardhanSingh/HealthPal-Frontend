import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorPrescriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        
        const response = await api.prescriptions.getById(id);
        setPrescription(response.data.data);
        
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrescription();
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-6"><LoadingSpinner /></div>;
  }

  if (error || !prescription) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error || 'Prescription not found'}</p>
        </div>
        <button
          onClick={() => navigate('/doctor/prescriptions')}
          className="text-primary-600 hover:text-primary-900 flex items-center"
        >
          ← Back to Prescriptions
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      <div className="mb-6">
        <button
          onClick={() => navigate('/doctor/prescriptions')}
          className="text-primary-600 hover:text-primary-900 flex items-center"
        >
          ← Back to Prescriptions
        </button>
      </div>

      {/* Main Prescription Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Prescription Details</h3>
            <p className="mt-1 text-sm text-gray-500">{formatDate(prescription.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            new Date(prescription.expiryDate) > new Date() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {new Date(prescription.expiryDate) > new Date() ? 'Active' : 'Expired'}
          </span>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {/* Patient info */}
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-3">Patient Information</h4>
              <div className="flex items-start">
                {prescription.patient.profileImage ? (
                  <img src={prescription.patient.profileImage} alt={prescription.patient.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="font-medium text-primary-700">{prescription.patient.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{prescription.patient.name}</p>
                  <p className="text-sm text-gray-500">{prescription.patient.email}</p>
                </div>
              </div>
            </div>
            
            {/* Medications list */}
            <div className="mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-3">Medications</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {prescription.medications.map((medication, index) => (
                    <li key={index} className={index > 0 ? 'pt-4 mt-4' : ''}>
                      <div className="flex justify-between">
                        <div>
                          <h5 className="text-base font-medium text-gray-900">{medication.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{medication.dosage} - {medication.frequency}</p>
                        </div>
                        {medication.duration && <span className="text-sm text-gray-500">{medication.duration}</span>}
                      </div>
                      {medication.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {medication.instructions}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Additional notes if available */}
            {prescription.notes && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-600">{prescription.notes}</p>
              </div>
            )}
            
            {/* Prescription validity period */}
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Valid Period</h4>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">
                  From {formatDate(prescription.createdAt)} to {formatDate(prescription.expiryDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptionDetails;