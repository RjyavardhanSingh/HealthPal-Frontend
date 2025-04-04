import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';

// Custom animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DoctorProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualifications: [],
    licenseNumber: '',
    consultationFee: '',
    bio: '',
    hospital: {
      name: '',
      address: ''
    },
    phone: '',
    profileImage: '',
    rating: 0,
    reviews: []
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getProfile();
        
        if (response.data.success) {
          setProfile({
            ...response.data.data,
            qualifications: response.data.data.qualifications || [],
            hospital: response.data.data.hospital || { name: '', address: '' },
            reviews: response.data.data.reviews || []
          });
        } else {
          toast.error('Could not load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(error.response?.data?.message || 'Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctorProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('hospital.')) {
      const field = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        hospital: {
          ...prev.hospital,
          [field]: value
        }
      }));
    } else if (name.includes('qualifications')) {
      const index = parseInt(name.split('[')[1].split(']')[0]);
      const field = name.split('.')[1];
      
      setProfile(prev => {
        const qualifications = [...prev.qualifications];
        qualifications[index] = {
          ...qualifications[index],
          [field]: value
        };
        return {
          ...prev,
          qualifications
        };
      });
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileImageUpdate = (imageUrl) => {
    setProfile(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
    toast.success('Profile image updated successfully');
  };
  
  const addQualification = () => {
    setProfile(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { degree: '', institution: '', year: '' }
      ]
    }));
  };
  
  const removeQualification = (index) => {
    setProfile(prev => {
      const qualifications = [...prev.qualifications];
      qualifications.splice(index, 1);
      return {
        ...prev,
        qualifications
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await api.doctors.updateProfile(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const calculateAverageRating = () => {
    if (!profile.reviews || profile.reviews.length === 0) return 0;
    const sum = profile.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / profile.reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse-slow">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Top Banner with Profile Summary */}
      <motion.div 
        className="glass-card rounded-2xl mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start relative z-10">
            <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-8">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
                />
              ) : (
                <div className="w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-4xl font-medium text-white">
                    {profile.name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="mt-4 p-1 px-3 bg-white/20 backdrop-blur-sm rounded-full">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${star <= calculateAverageRating() ? 'text-yellow-300' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-white font-medium">{calculateAverageRating()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-3xl font-bold mb-1">Dr. {profile.name}</h1>
              <p className="text-xl font-medium text-blue-100 mb-3">{profile.specialization}</p>
              
              <div className="mt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-100">Experience</span>
                  <p className="font-medium">{profile.experience} Years</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-100">Consultation Fee</span>
                  <p className="font-medium">${profile.consultationFee}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-100">Reviews</span>
                  <p className="font-medium">{profile.reviews?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <FileUpload 
              type="image" 
              onUploadSuccess={handleProfileImageUpdate}
              buttonText="Update Photo"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg"
            />
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white px-4 py-2 border-b">
          <nav className="flex space-x-4 overflow-x-auto custom-scrollbar">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === 'overview' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === 'personal' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Personal Info
            </button>
            <button 
              onClick={() => setActiveTab('qualifications')}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === 'qualifications' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Qualifications
            </button>
            <button 
              onClick={() => setActiveTab('hospital')}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === 'hospital' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Hospital Info
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === 'reviews' ? 'text-primary-600 border-b-2 border-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Reviews ({profile.reviews?.length || 0})
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.form 
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Doctor Profile</h2>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows="5"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your professional experience, specialties, and approach to patient care..."
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                This description appears on your public profile and helps patients learn about your practice.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee ($)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={profile.consultationFee}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={profile.licenseNumber}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full border-gray-300 rounded-lg bg-gray-100 shadow-sm"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Qualifications Tab */}
        {activeTab === 'qualifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Qualifications</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={addQualification}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Qualification
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
            
            {profile.qualifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 21l9-5-9-5-9 5 9 5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-700">No qualifications added</h3>
                <p className="text-gray-500 mt-2 mb-6">Add your academic and professional qualifications</p>
                <button
                  type="button"
                  onClick={addQualification}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                  Add Your First Qualification
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {profile.qualifications.map((qual, index) => (
                  <motion.div 
                    key={index}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative hover-lift"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={() => removeQualification(index)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 p-1.5 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          name={`qualifications[${index}].degree`}
                          value={qual.degree}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          name={`qualifications[${index}].institution`}
                          value={qual.institution}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          name={`qualifications[${index}].year`}
                          value={qual.year}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Hospital Info Tab */}
        {activeTab === 'hospital' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Hospital Information</h2>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  name="hospital.name"
                  value={profile.hospital?.name || ''}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic Address
                </label>
                <textarea
                  name="hospital.address"
                  value={profile.hospital?.address || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Patient Reviews</h2>
              <p className="text-gray-500">Reviews and ratings from your patients</p>
            </div>
            
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-4 md:mb-0 md:mr-8 text-center">
                  <div className="text-5xl font-bold text-primary-600">{calculateAverageRating()}</div>
                  <div className="flex items-center justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star}
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${star <= calculateAverageRating() ? 'text-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-500 mt-1">Based on {profile.reviews?.length || 0} reviews</p>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = profile.reviews?.filter(review => review.rating === rating).length || 0;
                    const percentage = profile.reviews?.length ? Math.round((count / profile.reviews.length) * 100) : 0;
                    
                    return (
                      <div key={rating} className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 w-6">{rating}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 ml-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {profile.reviews?.map((review, index) => (
                <motion.div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{review.rating} / 5</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-1">- {review.patientName}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
};

export default DoctorProfile;