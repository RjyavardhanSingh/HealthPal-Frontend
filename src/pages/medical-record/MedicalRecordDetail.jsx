import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';
import { toast } from 'react-toastify';

const MedicalRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper function to safely format fields
  const formatField = (value, formatter = (v) => v) => {
    if (value === undefined || value === null) return 'Not specified';
    try {
      return formatter(value);
    } catch (error) {
      console.error('Error formatting field:', error);
      return 'Error displaying value';
    }
  };
  
  // Format the record type for display
  const formatRecordType = (type) => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await api.medicalRecords.getById(id);
        console.log("Medical record data:", response.data.data);
        setRecord(response.data.data);
      } catch (err) {
        console.error('Error fetching medical record:', err);
        setError(err.message || 'Failed to load medical record');
        toast.error('Failed to load medical record');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRecord();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.medicalRecords.delete(id);
      toast.success('Medical record deleted successfully');
      navigate('/medical-records', { replace: true });
    } catch (err) {
      console.error('Error deleting record:', err);
      setError(err.message || 'Failed to delete record');
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => navigate('/medical-records')}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Back to Records
          </button>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">Record not found</p>
          <button 
            onClick={() => navigate('/medical-records')}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Back to Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/medical-records')}
            className="mr-3 text-primary-600 hover:text-primary-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{record.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            to={`/medical-records/edit/${id}`}
            className="inline-flex items-center px-3 py-1.5 border border-primary-600 text-sm font-medium rounded-md text-primary-600 hover:bg-primary-50"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatRecordType(record.recordType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatField(record.date, (date) => new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {record.doctor?.name ? `Dr. ${record.doctor.name}` : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Facility</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.facility || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="prose max-w-none">
                <p className="text-sm text-gray-700">{record.description || 'No notes provided.'}</p>
              </div>
            </div>
          </div>

          {/* Document section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            
            {record.files && record.files.length > 0 ? (
              <div className="space-y-4">
                {record.files.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name || `Document ${index + 1}`}</span>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View
                      </a>
                    </div>
                    
                    {file.fileType && file.fileType.includes('pdf') ? (
                      <div className="p-4 flex justify-center">
                        <div className="bg-gray-100 p-8 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    ) : file.fileType && file.fileType.includes('image') ? (
                      <img
                        src={file.url}
                        alt={file.name || "Medical record image"}
                        className="w-full object-contain max-h-80"
                      />
                    ) : (
                      <div className="p-4 flex justify-center">
                        <div className="bg-gray-100 p-8 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-gray-500 mb-4">No documents attached to this record.</p>
                <FileUpload 
                  type="document"
                  onUploadSuccess={(url, metadata) => {
                    const file = {
                      url,
                      name: metadata?.name || 'Uploaded file',
                      fileType: metadata?.type || 'application/pdf'
                    };
                    setRecord(prev => ({
                      ...prev,
                      files: [...(prev.files || []), file]
                    }));
                    
                    // Update the record on the server
                    api.medicalRecords.update(record._id, {
                      files: [...(record.files || []), file]
                    }).catch(err => {
                      console.error("Error updating record with new file:", err);
                      toast.error("Failed to attach file");
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowDeleteConfirm(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Medical Record
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this medical record? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordDetail;