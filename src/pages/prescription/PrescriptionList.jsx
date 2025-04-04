import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Add this import
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // Add this line to get currentUser

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        
        let response;
        if (currentUser.role === 'patient') {
          response = await api.prescriptions.getByPatient(currentUser._id);
        } else {
          response = await api.prescriptions.getAll();
        }
        
        setPrescriptions(response.data.data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchPrescriptions();
    }
  }, [currentUser]);

  if (loading) return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>
      
      {prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">
                      {prescription.medications && prescription.medications.length > 0 
                        ? prescription.medications[0].name
                        : 'Prescription'} 
                      {prescription.medications && prescription.medications.length > 1 && 
                        ` + ${prescription.medications.length - 1} more`}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      By Dr. {prescription.doctor?.name || 'Unknown'}
                    </p>
                  </div>
                  <Link 
                    to={`/prescriptions/${prescription._id}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    new Date(prescription.expiryDate) < new Date() 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {new Date(prescription.expiryDate) < new Date() 
                      ? 'Expired' 
                      : 'Valid until ' + new Date(prescription.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any prescriptions yet.</p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;