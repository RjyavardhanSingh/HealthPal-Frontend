import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';

const VerificationStatus = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentTitles, setDocumentTitles] = useState([]);
  
  useEffect(() => {
    fetchVerificationStatus();
  }, []);
  
  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await api.verification.getStatus();
      setStatus(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError('Failed to load verification status');
      toast.error('Could not load verification status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (files) => {
    setSelectedFiles(files);
    // Initialize document titles for each file
    setDocumentTitles(files.map(() => ''));
  };
  
  const handleTitleChange = (index, value) => {
    const newTitles = [...documentTitles];
    newTitles[index] = value;
    setDocumentTitles(newTitles);
  };
  
  const handleUpload = async () => {
    // Validate titles
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    if (documentTitles.some(title => !title.trim())) {
      toast.error('Please provide a title for each document');
      return;
    }
    
    try {
      setUploadingDocuments(true);
      
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append('documents', file);
        formData.append('titles', documentTitles[index]);
      });
      
      await api.verification.uploadDocuments(formData);
      toast.success('Documents uploaded successfully');
      setSelectedFiles([]);
      setDocumentTitles([]);
      fetchVerificationStatus();
    } catch (err) {
      console.error('Error uploading documents:', err);
      toast.error('Failed to upload documents');
    } finally {
      setUploadingDocuments(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Verification Status</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Account Verification</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your verification status and requirements
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    status?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    status?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    status?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {status?.status === 'pending' ? 'Pending Review' :
                     status?.status === 'approved' ? 'Verified' :
                     status?.status === 'rejected' ? 'Rejected' :
                     status?.status === 'additional_info_requested' ? 'Additional Info Requested' :
                     'Unknown'}
                  </span>
                </dd>
              </div>
              
              {status?.rejectionReason && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 bg-red-50 p-3 rounded">
                    {status.rejectionReason}
                  </dd>
                </div>
              )}
              
              {status?.requestedDocuments && status.requestedDocuments.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Requested Documents</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {status.requestedDocuments.map((doc, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              {doc.documentType} {doc.isRequired && <span className="text-red-600">*</span>}
                            </span>
                          </div>
                          {doc.description && (
                            <div className="ml-4 flex-shrink-0 text-gray-500 text-xs italic">
                              {doc.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {status?.adminNotes && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Admin Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 bg-blue-50 p-3 rounded">
                    {status.adminNotes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        {/* Show document upload only if not approved */}
        {status?.status !== 'approved' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Upload Verification Documents</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Please provide the requested documents to verify your medical credentials
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <FileUpload
                multiple={true}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                label="Upload Documents"
                helpText="Upload your medical license, board certifications, and any other requested documents (PDF, JPG, PNG)"
              />
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Selected Documents</h3>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 truncate">{file.name}</p>
                        <input
                          type="text"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Document Title (e.g., Medical License, Board Certification)"
                          value={documentTitles[index] || ''}
                          onChange={(e) => handleTitleChange(index, e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleUpload}
                    disabled={uploadingDocuments}
                  >
                    {uploadingDocuments ? 'Uploading...' : 'Upload Documents'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show restricted access message if not approved */}
        {status?.status !== 'approved' && (
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your account has limited access until verification is complete. You won't be visible to patients and can't accept appointments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;