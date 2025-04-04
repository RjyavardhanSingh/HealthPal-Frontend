import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import PrescriptionReminder from '../../components/prescription/PrescriptionReminder';
import { motion } from 'framer-motion';

const PrescriptionDetails = () => {
  const { id } = useParams();
  const { currentUser, userToken } = useAuth();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShared, setShowShared] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        
        if (!userToken) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await api.prescriptions.getById(id);
        setPrescription(response.data.data);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError('Failed to load prescription details');
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    if (id && userToken) {
      fetchPrescription();
    }
  }, [id, userToken]);

  // Helper functions
  const isPrescriptionActive = () => {
    if (!prescription) return false;
    return new Date(prescription.expiryDate) >= new Date();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  const handleShareClick = () => {
    // Simulate copying to clipboard
    navigator.clipboard.writeText(window.location.href).catch(err => console.error('Failed to copy:', err));
    setShowShared(true);
    setTimeout(() => setShowShared(false), 3000);
  };

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
    
    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    
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
    
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
    }
    
    .active-badge {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    
    .expired-badge {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-out forwards;
    }
  `;

  // Loading and error states
  if (loading) {
    return (
      <div className="bg-pattern min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center heartbeat mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-blue-600 font-medium">Loading prescription details...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto glass-card rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Unable to display prescription</h3>
              <p className="mt-1 text-sm text-red-700">{error || 'Prescription not found'}</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/prescriptions')}
            className="mt-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Prescriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pattern min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      {/* Share confirmation message */}
      {showShared && (
        <div className="fixed inset-x-0 top-20 flex justify-center z-50 animate-fade-in-down">
          <div className="glass-card rounded-xl p-4 border-l-4 border-green-500 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Prescription link copied to clipboard!</p>
                <p className="text-xs text-green-700 mt-1">You can now share it via messaging apps or email.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/prescriptions')} 
          className={`flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-white/50 ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Prescriptions
        </button>

        {/* Main Prescription Card */}
        <div className={`glass-card rounded-xl overflow-hidden shadow-lg mb-6 ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div className="relative overflow-hidden w-full h-24 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute inset-0 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm112 376c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-88h-96v88c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V136c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v88h96v-88c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v240z"/>
              </svg>
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-800">Prescription Details</h2>
                <p className="text-blue-600">{formatDate(prescription.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                isPrescriptionActive() ? 'active-badge' : 'expired-badge'
              }`}>
                {isPrescriptionActive() ? 'Active' : 'Expired'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-blue-100">
            <div className="p-6">
              {/* Doctor info */}
              <div className={`mb-6 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}>
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Medical Provider
                </h3>
                <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-50">
                  <div className="flex items-center">
                    {prescription.doctor.profileImage ? (
                      <img 
                        src={prescription.doctor.profileImage} 
                        alt={prescription.doctor.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <span className="text-xl font-bold">{prescription.doctor.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">Dr. {prescription.doctor.name}</h4>
                      <p className="text-sm text-blue-600">{prescription.doctor.specialization}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Medications list */}
              <div className={`mb-6 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M9 20h6" />
                  </svg>
                  Prescribed Medications
                </h3>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div 
                      key={index} 
                      className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-50 hover-lift"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-blue-800 text-lg">{medication.name}</h4>
                          <p className="text-blue-600 text-sm mt-1">{medication.dosage}</p>
                        </div>
                        <span className="text-sm text-gray-700 bg-blue-50 px-2 py-1 rounded">{medication.duration}</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{medication.frequency}</span>
                        </div>
                        
                        {medication.instructions && (
                          <div className="flex items-start mt-2 text-sm text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{medication.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Additional notes if available */}
              {prescription.notes && (
                <div className={`mb-6 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Additional Notes
                  </h3>
                  <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-50">
                    <p className="text-gray-700">{prescription.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Prescription validity period */}
              <div className={`mb-6 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Validity Period
                </h3>
                <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Valid From</div>
                      <div className="font-medium text-gray-800">{formatDate(prescription.createdAt)}</div>
                    </div>
                    <div className="mx-4 text-gray-300">|</div>
                    <div>
                      <div className="text-sm text-gray-500">Valid Until</div>
                      <div className={`font-medium ${isPrescriptionActive() ? 'text-green-600' : 'text-red-600'}`}>
                        {formatDate(prescription.expiryDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className={`px-6 py-4 border-t border-blue-100 flex flex-col sm:flex-row justify-between gap-3 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Prescription
            </button>
            
            <button
              onClick={handleShareClick}
              className="btn-primary inline-flex items-center justify-center px-4 py-2 shadow-sm text-sm font-medium rounded-lg"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Prescription
            </button>
          </div>
        </div>
        
        {/* Related consultation card if available */}
        {prescription.consultation && (
          <div className={`glass-card rounded-xl overflow-hidden shadow-lg mb-6 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Related Consultation
              </h3>
            </div>
            
            <div className="border-t border-blue-100 px-6 py-4">
              <Link 
                to={`/consultations/${prescription.consultation._id}`}
                className="block hover:bg-blue-50 rounded-xl p-4 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Consultation on {formatDate(prescription.consultation.date)}
                    </h4>
                    <p className="text-sm text-blue-600 mt-1">
                      {prescription.consultation.diagnosis || 'General consultation'}
                    </p>
                  </div>
                  <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
        
        {/* Medication Reminder section for patients */}
        {currentUser.role === 'patient' && (
          <div className={`glass-card rounded-xl overflow-hidden shadow-lg mb-6 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Medication Reminders
              </h3>
              <p className="mt-1 text-sm text-gray-500">Set up reminders to help you remember to take your medications</p>
            </div>
            
            <div className="border-t border-blue-100 px-6 py-4">
              <PrescriptionReminder prescription={prescription} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetails;