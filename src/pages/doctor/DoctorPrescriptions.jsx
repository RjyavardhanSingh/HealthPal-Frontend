import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get prescriptions created by this doctor
        const response = await api.prescriptions.getByDoctor(currentUser._id);
        setPrescriptions(response.data.data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.response?.data?.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchPrescriptions();
    }
  }, [currentUser]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">
                      {prescription.medications?.[0]?.name || 'Prescription'}
                      {prescription.medications?.length > 1 && 
                        ` + ${prescription.medications.length - 1} more`}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      For patient: {prescription.patient?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Created on {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link 
                    to={`/doctor/prescriptions/${prescription._id}`}
                    className="text-primary-600 hover:text-primary-800 px-3 py-1 rounded"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-sm text-gray-500">
                    {prescription.consultation?.diagnosis || 'General consultation'}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    new Date(prescription.expiryDate) > new Date() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {new Date(prescription.expiryDate) > new Date() 
                      ? 'Active' 
                      : 'Expired'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-600 mb-4">No prescriptions created yet.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;