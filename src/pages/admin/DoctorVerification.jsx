import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorVerification = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [requestedDocuments, setRequestedDocuments] = useState([
    { documentType: '', description: '', isRequired: true }
  ]);
  const [adminNotes, setAdminNotes] = useState('');
  
  useEffect(() => {
    // Redirect if not admin
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/dashboard');
      toast.error('You do not have permission to access this page');
    }
    
    fetchVerificationRequests();
  }, [currentUser, navigate]);
  
  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.verification.getRequests();
      setRequests(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests');
      toast.error('Could not load verification requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (requestId) => {
    try {
      await api.verification.approveRequest(requestId);
      toast.success('Doctor verified successfully');
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error approving doctor:', err);
      toast.error('Failed to verify doctor');
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await api.verification.rejectRequest(selectedRequest._id, { rejectionReason });
      toast.success('Verification request rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error rejecting verification:', err);
      toast.error('Failed to reject verification');
    }
  };
  
  const handleRequestDocuments = async () => {
    // Validate documents
    const validDocuments = requestedDocuments.filter(doc => doc.documentType.trim() !== '');
    if (validDocuments.length === 0) {
      toast.error('Please add at least one document request');
      return;
    }
    
    try {
      await api.verification.requestDocuments(selectedRequest._id, {
        documents: validDocuments,
        adminNotes
      });
      
      toast.success('Document request sent to doctor');
      setShowDocumentsModal(false);
      setRequestedDocuments([{ documentType: '', description: '', isRequired: true }]);
      setAdminNotes('');
      setSelectedRequest(null);
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error requesting documents:', err);
      toast.error('Failed to send document request');
    }
  };
  
  const addDocumentRequest = () => {
    setRequestedDocuments([
      ...requestedDocuments,
      { documentType: '', description: '', isRequired: true }
    ]);
  };
  
  const removeDocumentRequest = (index) => {
    if (requestedDocuments.length > 1) {
      setRequestedDocuments(requestedDocuments.filter((_, i) => i !== index));
    }
  };
  
  const handleDocumentChange = (index, field, value) => {
    const updated = [...requestedDocuments];
    updated[index][field] = value;
    setRequestedDocuments(updated);
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Verification Requests</h1>
        
        {requests.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            No pending verification requests
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {request.doctor.profileImage ? (
                          <img 
                            src={request.doctor.profileImage} 
                            alt={request.doctor.name} 
                            className="h-10 w-10 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-medium">{request.doctor.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Dr. {request.doctor.name}</h3>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm text-gray-500 mr-4">
                              {request.doctor.specialization}
                            </span>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {request.status === 'pending' ? 'Pending' :
                               request.status === 'approved' ? 'Approved' :
                               request.status === 'rejected' ? 'Rejected' :
                               'Additional Info Requested'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request._id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDocumentsModal(true);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Request Documents
                            </button>
                          </>
                        )}
                        
                        {request.status === 'additional_info_requested' && (
                          <>
                            <button
                              onClick={() => handleApprove(request._id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p>{request.doctor.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">License Number</p>
                        <p>{request.doctor.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Consultation Fee</p>
                        <p>${request.doctor.consultationFee}</p>
                      </div>
                    </div>
                    
                    {request.doctor.verificationDocuments && request.doctor.verificationDocuments.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {request.doctor.verificationDocuments.map((doc, index) => (
                            <div key={index} className="border border-gray-200 rounded-md p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{doc.title}</p>
                                  <p className="text-sm text-gray-500">{doc.description}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {request.adminNotes && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Reject Verification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting Dr. {selectedRequest.doctor.name}'s verification request. This will be visible to the doctor.
                      </p>
                      <div className="mt-3">
                        <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                          Rejection Reason
                        </label>
                        <textarea
                          id="rejection-reason"
                          rows={4}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., License number could not be verified. Please provide a clearer image of your medical license."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReject}
                >
                  Reject
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Request Documents Modal - Fixed and completed */}
      {showDocumentsModal && selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Request Additional Documents
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Request additional verification documents from Dr. {selectedRequest.doctor.name}. The doctor will be notified and needs to submit these documents before being verified.
                      </p>
                      
                      <div className="space-y-4">
                        {requestedDocuments.map((doc, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-gray-900">Document Request #{index + 1}</h4>
                              {requestedDocuments.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDocumentRequest(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 gap-y-3">
                              <div>
                                <label htmlFor={`document-type-${index}`} className="block text-sm font-medium text-gray-700">
                                  Document Type*
                                </label>
                                <input
                                  type="text"
                                  id={`document-type-${index}`}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="e.g., Medical License, Board Certification"
                                  value={doc.documentType}
                                  onChange={(e) => handleDocumentChange(index, 'documentType', e.target.value)}
                                  required
                                />
                              </div>
                              
                              <div>
                                <label htmlFor={`document-description-${index}`} className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <textarea
                                  id={`document-description-${index}`}
                                  rows={2}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Please provide specific instructions about what document is needed."
                                  value={doc.description}
                                  onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                                ></textarea>
                              </div>
                              
                              <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id={`required-${index}`}
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    checked={doc.isRequired}
                                    onChange={(e) => handleDocumentChange(index, 'isRequired', e.target.checked)}
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor={`required-${index}`} className="font-medium text-gray-700">
                                    Required
                                  </label>
                                  <p className="text-gray-500">Mark this document as mandatory for verification</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={addDocumentRequest}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Another Document
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700">
                          Additional Notes
                        </label>
                        <textarea
                          id="admin-notes"
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Provide any additional context or instructions (visible to the doctor)"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleRequestDocuments}
                >
                  Send Request
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDocumentsModal(false);
                    setRequestedDocuments([{ documentType: '', description: '', isRequired: true }]);
                    setAdminNotes('');
                    setSelectedRequest(null);
                  }}
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

export default DoctorVerification;