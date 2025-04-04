import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorPatients = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getPatients();
        setPatients(response.data.data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  // Filter patients based on search query
  const filteredPatients = searchQuery 
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Patients</h1>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search patients"
            className="pl-10 py-2 px-4 block w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Patient grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div 
              key={patient._id}
              onClick={() => navigate(`/doctor/patients/${patient._id}`)}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center">
                {patient.profileImage ? (
                  <img src={patient.profileImage} alt={patient.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-medium">{patient.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                  {patient.lastVisit && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No patients found</p>
          <p className="text-sm text-gray-500">You haven't interacted with any patients yet.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;