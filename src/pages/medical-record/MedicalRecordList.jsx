import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import FileUpload from '../../components/common/FileUpload';
import { motion } from 'framer-motion';

const MedicalRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [recordTypesFilter, setRecordTypesFilter] = useState('all');
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    recordType: 'other',
    files: []
  });
  const navigate = useNavigate();

  // Custom styles to match landing page aesthetics
  const customStyles = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes heartbeat {
      0% { transform: scale(1); }
      15% { transform: scale(1.15); }
      30% { transform: scale(1); }
      45% { transform: scale(1.15); }
      60% { transform: scale(1); }
      100% { transform: scale(1); }
    }
    
    .heartbeat {
      animation: heartbeat 2s ease-in-out infinite;
    }
    
    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    
    .bg-pattern {
      background-color: #f0f9ff;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 30 L30 20 L20 20 L20 30 L10 30 L10 40 L20 40 L20 50 L30 50 L30 40 L40 40 L40 30 z' fill='%233b82f610'/%3E%3C/svg%3E");
      background-size: 60px 60px;
    }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(59, 130, 246, 0.1);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }
    
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
    }
    
    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .type-badge.lab {
      background-color: #dbeafe;
      color: #1e40af;
    }
    
    .type-badge.prescription {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    .type-badge.diagnosis {
      background-color: #f0fdf4;
      color: #166534;
    }
    
    .type-badge.imaging {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .type-badge.vaccination {
      background-color: #ede9fe;
      color: #5b21b6;
    }
    
    .type-badge.other {
      background-color: #f3f4f6;
      color: #4b5563;
    }
  `;

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
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    fetchMedicalRecords();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (fileUrl, fileName, fileType) => {
    setNewRecord(prev => ({
      ...prev,
      files: [...prev.files, {
        url: fileUrl,
        name: fileName || 'Uploaded file',
        fileType: fileType || 'application/pdf'
      }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.medicalRecords.create(newRecord);
      setRecords(prev => [response.data.data, ...prev]);
      setShowCreateModal(false);
      setNewRecord({
        title: '',
        description: '',
        recordType: 'other',
        files: []
      });
    } catch (err) {
      console.error('Error creating medical record:', err);
      setError('Failed to create medical record');
    }
  };

  // Helper function to return the formatted display name of record type
  const formatRecordType = (type) => {
    if (!type) return 'Unknown';
    const formatted = type.replace('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Get badge class based on record type
  const getRecordTypeBadgeClass = (type) => {
    switch(type) {
      case 'lab_result': return 'lab';
      case 'prescription': return 'prescription';
      case 'diagnosis': return 'diagnosis';
      case 'imaging': return 'imaging';
      case 'vaccination': return 'vaccination';
      default: return 'other';
    }
  };

  // Filter records based on selected type
  const filteredRecords = recordTypesFilter === 'all' 
    ? records 
    : records.filter(record => record.recordType === recordTypesFilter);

  // Loading state
  if (loading) {
    return (
      <div className="bg-pattern min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center heartbeat mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
            </svg>
          </div>
          <p className="text-blue-600 font-medium">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className={`mb-6 flex items-center ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">My Medical Records</h1>
            <p className="text-blue-600">View and manage your health information</p>
          </div>
        </div>
        
        {/* Filter and action buttons */}
        <div className={`mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div className="inline-flex items-center bg-white/70 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setRecordTypesFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                recordTypesFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              } transition-colors`}
            >
              All Records
            </button>
            <button
              onClick={() => setRecordTypesFilter('lab_result')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                recordTypesFilter === 'lab_result' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              } transition-colors`}
            >
              Lab Results
            </button>
            <button
              onClick={() => setRecordTypesFilter('imaging')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                recordTypesFilter === 'imaging' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              } transition-colors`}
            >
              Imaging
            </button>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Record
          </button>
        </div>
        
        {/* Records list */}
        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-card rounded-xl p-5 hover-lift ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="mb-3 flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{record.title}</h3>
                  <span className={`type-badge ${getRecordTypeBadgeClass(record.recordType)}`}>
                    {formatRecordType(record.recordType)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {record.description || 'No description provided'}
                </p>
                
                <div className="flex items-center mb-4 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(record.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                  
                  {record.doctor && (
                    <span className="flex items-center ml-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Dr. {record.doctor.name}
                    </span>
                  )}
                </div>
                
                {record.files && record.files.length > 0 && (
                  <div className="flex items-center px-3 py-2 bg-blue-50 rounded-lg mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">
                      {record.files.length} attachment{record.files.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                <Link 
                  to={`/medical-records/${record._id}`}
                  className="block w-full py-2.5 text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-8 text-center max-w-2xl mx-auto"
          >
            {recordTypesFilter !== 'all' ? (
              <>
                <div className="mb-4 bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No matching records found</h3>
                <p className="text-gray-500 mb-6">
                  You don't have any {formatRecordType(recordTypesFilter)} records. Try viewing all records or create a new one.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button 
                    onClick={() => setRecordTypesFilter('all')}
                    className="inline-block px-4 py-2 border border-blue-500 text-blue-500 font-medium rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    View All Records
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                  >
                    Create New Record
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No medical records found</h3>
                <p className="text-gray-500 mb-6">
                  You don't have any medical records yet. Create your first record to start tracking your health information.
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                >
                  Create Your First Record
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Create Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom glass-card rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-blue-800">Create New Medical Record</h3>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="e.g. Annual Blood Test Results"
                      value={newRecord.title}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
                      Record Type *
                    </label>
                    <select
                      id="recordType"
                      name="recordType"
                      value={newRecord.recordType}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      required
                    >
                      <option value="lab_result">Lab Result</option>
                      <option value="prescription">Prescription</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="imaging">Imaging</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Enter a detailed description of this medical record"
                      value={newRecord.description}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Files (Optional)
                    </label>
                    <FileUpload 
                      type="document"
                      onUploadSuccess={(url, metadata) => handleFileUpload(url, metadata?.name, metadata?.type)}
                    />
                  </div>
                  
                  {newRecord.files.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Uploaded Files
                      </label>
                      <ul className="border border-blue-100 rounded-lg divide-y divide-blue-100 overflow-hidden">
                        {newRecord.files.map((file, index) => (
                          <li key={index} className="p-3 flex justify-between items-center hover:bg-blue-50 transition-colors">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-700">{file.name || 'File ' + (index + 1)}</span>
                            </div>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              onClick={() => {
                                setNewRecord(prev => ({
                                  ...prev,
                                  files: prev.files.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50/80 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Record
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordList;