import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorPatients = async () => {
      try {
        setLoading(true);
        console.log('Fetching doctor patients...');
        const response = await api.doctors.getPatients();
        console.log("Doctor's patients response:", response);
        setPatients(response.data.data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Show more specific error message based on status code
        if (error.response?.status === 403) {
          toast.error('You do not have permission to view patient data');
        } else {
          toast.error('Failed to load patient data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorPatients();
  }, []);

  // Filter patients by search term
  const filteredPatients = searchTerm
    ? patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    : patients;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Patients</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Patient List</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredPatients.map(patient => (
              <div 
                key={patient._id} 
                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/doctor/patients/${patient._id}`)}
              >
                <div className="flex items-center">
                  {patient.profileImage ? (
                    <img 
                      src={patient.profileImage} 
                      alt={patient.name} 
                      className="w-12 h-12 rounded-full object-cover mr-3" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <span className="text-primary-700 font-medium">{patient.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                      {patient.appointmentCount > 1 && (
                        <p className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {patient.appointmentCount} visits
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;