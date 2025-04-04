import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const MedicalRecordSelector = ({ selectedRecords, setSelectedRecords }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const response = await api.medicalRecords.getAll();
        setRecords(response.data.data || []);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const toggleRecordSelection = (record) => {
    if (selectedRecords.some(r => r._id === record._id)) {
      setSelectedRecords(selectedRecords.filter(r => r._id !== record._id));
    } else {
      setSelectedRecords([...selectedRecords, record]);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!records.length) return <div className="text-gray-500">No medical records available</div>;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Select relevant medical records (optional)</h3>
      <p className="text-sm text-gray-500 mb-3">Share relevant medical documents with your doctor</p>
      
      <div className="max-h-60 overflow-y-auto border rounded-md">
        {records.map(record => (
          <div 
            key={record._id} 
            className={`p-3 border-b flex items-center justify-between cursor-pointer ${
              selectedRecords.some(r => r._id === record._id) ? 'bg-blue-50' : ''
            }`}
            onClick={() => toggleRecordSelection(record)}
          >
            <div>
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(record.date).toLocaleDateString()} | {record.recordType.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectedRecords.some(r => r._id === record._id)}
                onChange={() => toggleRecordSelection(record)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        ))}
      </div>
      
      {selectedRecords.length > 0 && (
        <div className="mt-2 text-sm text-primary-600">
          {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default MedicalRecordSelector;