import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import FileUpload from '../common/FileUpload';

const VerificationStatus = () => {
  const { currentUser } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        const response = await api.verification.getStatus();
        setVerificationData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to load verification status');
        toast.error('Could not load verification status');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser?.role === 'doctor') {
      fetchVerificationStatus();
    }
  }, [currentUser]);
  
  const handleDocumentChange = (index, field, value) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index][field] = value;
    setDocuments(updatedDocuments);
  };
  
  const addDocument = () => {
    setDocuments([...documents, { title: '', description: '', fileUrl: '' }]);
  };
  
  const removeDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };
  
  const handleFileUpload = (index, fileUrl) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].fileUrl = fileUrl;
    setDocuments(updatedDocuments);
  };
  
  const handleSubmit = async () => {
    try {
      // Validate
      const isValid = documents.every(doc => 
        doc.title.trim() !== '' && 
        doc.description.trim() !== '' && 
        doc.fileUrl.trim() !== ''
      );
      
      if (!isValid) {
        toast.error('Please complete all document fields and upload files');
        return;
      }
      
      setUploading(true);
      
      const response = await api.verification.submitDocuments({ documents });
      
      toast.success('Documents submitted successfully');
      setShowUploadForm(false);
      setDocuments([]);
      
      // Refresh verification data
      const statusResponse = await api.verification.getStatus();
      setVerificationData(statusResponse.data.data);
      
    } catch (err) {
      console.error('Error submitting documents:', err);
      toast.error('Failed to submit documents');
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!verificationData) {
    return null;
  }
  
  const { status, rejectionReason, request } = verificationData;
  
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending Verification
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Verification Rejected
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Verification Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your healthcare provider verification details
          </p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your account is pending verification. Our team will review your credentials and license information. This process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {status === 'rejected' && rejectionReason && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Verification rejected:</span> {rejectionReason}
                </p>
                <p className="mt-2 text-sm text-red-700">
                  Please update your information or provide additional documentation to complete the verification process.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {status === 'approved' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Verification successful!</span> Your account has been verified and you can now accept patient appointments.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {request && request.status === 'additional_info_requested' && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-5">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 100 2h.01a1 1 0 100-2H10zm-3 2a1 1 0 102 0v-.5a.5.5 0 00-.5-.5H7a1 1 0 100 2h2.5a.5.5 0 00.5-.5V12a1 1 0 10-2 0v.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">Additional information required</span>
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  {request.adminNotes || 'Please provide the following documents to complete your verification:'}
                </p>
                
                {request.additionalDocumentsRequested && request.additionalDocumentsRequested.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-amber-700">
                    {request.additionalDocumentsRequested.map((doc, index) => (
                      <li key={index}>
                        {doc.documentType} {doc.isRequired && <span className="font-medium">(Required)</span>}
                        {doc.description && <p className="text-xs mt-1">{doc.description}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
        
        {(status === 'pending' || status === 'rejected' || (request && request.status === 'additional_info_requested')) && (
          <div className="mt-6">
            {!showUploadForm ? (
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload Verification Documents
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-md font-medium text-gray-900 mb-3">Upload Verification Documents</h4>
                
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="p-4 bg-white rounded-md shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-sm font-medium">Document {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Document Title
                          </label>
                          <input
                            type="text"
                            value={doc.title}
                            onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Medical License"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            value={doc.description}
                            onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Brief description of the document"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Document File
                          </label>
                          <FileUpload
                            onFileUpload={(fileUrl) => handleFileUpload(index, fileUrl)}
                            fileTypes=".pdf,.jpg,.jpeg,.png"
                            placeholder="Upload document (PDF, JPG, PNG)"
                          />
                          {doc.fileUrl && (
                            <p className="mt-1 text-sm text-green-600">
                              File uploaded successfully
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addDocument}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Another Document
                  </button>
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setDocuments([]);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={uploading || documents.length === 0}
                  >
                    {uploading ? 'Submitting...' : 'Submit Documents'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {verificationData.documents && verificationData.documents.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Submitted Documents</h4>
            <div className="bg-gray-50 rounded-md">
              <ul className="divide-y divide-gray-200">
                {verificationData.documents.map((doc, index) => (
                  <li key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;