import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SpecialtySelection = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getSpecialties();
        setSpecialties(response.data.data || []);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const handleSpecialtySelect = (specialty) => {
    navigate(`/find-doctor`, { state: { specialty } });
  };

  const filteredSpecialties = searchTerm
    ? specialties.filter(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase()))
    : specialties;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Find a Specialist</h1>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by specialty or health concern"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="absolute top-0 left-0 h-full flex items-center pl-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSpecialties.map((specialty, index) => (
            <button
              key={index}
              onClick={() => handleSpecialtySelect(specialty)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col items-center justify-center aspect-square"
            >
              <div className="rounded-full bg-primary-100 p-3 mb-3">
                <img 
                  src={`/assets/specialties/${specialty.toLowerCase().replace(/\s+/g, '-')}.svg`} 
                  alt={specialty}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.src = '/assets/specialties/default.svg';
                  }}
                />
              </div>
              <span className="text-center text-sm font-medium">{specialty}</span>
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-primary-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Common Health Concerns</h2>
        <div className="flex flex-wrap gap-2">
          {['Fever', 'Cough', 'Headache', 'Back Pain', 'Anxiety', 'Skin Issues'].map((concern) => (
            <button
              key={concern}
              onClick={() => navigate('/find-doctor', { state: { searchTerm: concern } })}
              className="bg-white px-3 py-1 rounded-full text-sm hover:bg-gray-50"
            >
              {concern}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelection;