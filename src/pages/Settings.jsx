import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import notificationService from '../services/notificationService';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  
  // Add this missing state variable
  const [userData, setUserData] = useState(null);
  
  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bio: ''
  });
  
  // Security form
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    medicationReminders: true,
    newsletterUpdates: false
  });

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.auth.getMe();
        
        if (response && response.data) {
          setUserData(response.data.data);
          
          // Also update the profile form with user data
          setProfile({
            name: response.data.data.name || '',
            email: response.data.data.email || '',
            phone: response.data.data.phone || '',
            gender: response.data.data.gender || '',
            dateOfBirth: response.data.data.dateOfBirth ? new Date(response.data.data.dateOfBirth).toISOString().split('T')[0] : '',
            bio: response.data.data.bio || ''
          });
          
          // Set preview if profile image exists
          if (response.data.data.profileImage) {
            setPreviewUrl(response.data.data.profileImage);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  // Handle profile update
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update profile data
      await api.auth.updateProfile(profile);
      
      // If there's a new profile image, upload it
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        await api.uploads.profileImage(formData);
      }
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle security update
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (security.newPassword !== security.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await api.auth.updatePassword(security.currentPassword, security.newPassword);
      
      setSuccess('Password updated successfully');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Error updating password:", err);
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Handle notifications update
  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Update notification settings in backend
      await api.auth.updateNotificationSettings(notificationSettings);
      
      // Request FCM permission if user enabled any notifications
      if (notificationSettings.appointmentReminders || notificationSettings.medicationReminders) {
        const granted = await notificationService.requestPermission();
        if (!granted) {
          toast.warning("Please enable browser notifications for the best experience");
        }
      }
      
      setSuccess('Notification settings updated successfully');
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setError(err.message || "Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/delete-account`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        // Delete user from Firebase
        await currentUser.delete();
        
        // Log out and redirect
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError(error.message || 'Failed to delete account. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-16">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {error && (
        <ErrorDisplay message={error} />
      )}

      {success && (
        <div className="p-4 mb-6 rounded-md bg-green-50 text-green-700 border-green-200" role="alert">
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Settings tabs">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'account' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'security' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'notifications' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit}>
              <div className="mb-6">
                <div className="flex justify-center">
                  <div className="relative">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      id="profileImage"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">Click to change profile picture</p>
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleProfileChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handleSecuritySubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={security.currentPassword}
                    onChange={handleSecurityChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={security.newPassword}
                    onChange={handleSecurityChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={security.confirmPassword}
                    onChange={handleSecurityChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSubmit}>
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                  <p className="text-sm text-gray-500 mb-4">Choose what types of email notifications you'd like to receive</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email Notifications</label>
                        <p className="text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="appointmentReminders"
                          name="appointmentReminders"
                          type="checkbox"
                          checked={notificationSettings.appointmentReminders}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="appointmentReminders" className="font-medium text-gray-700">Appointment Reminders</label>
                        <p className="text-gray-500">Get reminders about your upcoming appointments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="medicationReminders"
                          name="medicationReminders"
                          type="checkbox"
                          checked={notificationSettings.medicationReminders}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="medicationReminders" className="font-medium text-gray-700">Medication Reminders</label>
                        <p className="text-gray-500">Get reminders to take your medication</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="newsletterUpdates"
                          name="newsletterUpdates"
                          type="checkbox"
                          checked={notificationSettings.newsletterUpdates}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="newsletterUpdates" className="font-medium text-gray-700">Newsletter and Promotions</label>
                        <p className="text-gray-500">Get the latest news and special offers</p>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;