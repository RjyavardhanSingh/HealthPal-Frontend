import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/common/FileUpload';

const Profile = () => {
  const { currentUser, userToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userToken) {
      fetchProfile();
    }
  }, [userToken]);
  
  const handleProfileImageUpdate = (imageUrl) => {
    setProfile(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <p>Loading profile...</p>
    </div>;
  }
  
  if (error) {
    return <div className="bg-red-100 p-4 rounded-md">
      <p className="text-red-700">{error}</p>
    </div>;
  }
  
  return (
    <div className="p-4 pb-16">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and medical information</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Profile image upload */}
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col items-center">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="Profile"
                  className="rounded-full h-32 w-32 object-cover mb-4"
                />
              ) : (
                <div className="rounded-full h-32 w-32 bg-gray-200 flex items-center justify-center mb-4">
                  <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">{profile.name}</h3>
              
              <FileUpload 
                type="image"
                onUploadSuccess={handleProfileImageUpdate}
                className="max-w-xs"
              />
            </div>
          </div>
          
          {/* User details */}
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.phone || 'Not provided'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {profile.role === 'patient' ? 'Patient' : 
                 profile.role === 'doctor' ? 'Doctor' : 'Administrator'}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Medical document upload section (for patients only) */}
        {profile.role === 'patient' && (
          <div className="border-t border-gray-200 px-4 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Documents</h3>
            <FileUpload 
              type="document"
              className="max-w-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;