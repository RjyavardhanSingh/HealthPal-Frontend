import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';  // Import api client directly

const Profile = () => {
  const { currentUser, userToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use api client instead of direct fetch
        const userResponse = await api.auth.getMe();
        setUserData(userResponse.data.data);

        // Fetch appointments using api client
        const appointmentsResponse = await api.appointments.getAll();
        setAppointments(appointmentsResponse.data.data || []);

        // Fetch prescriptions
        try {
          let prescriptionsData;
          
          if (userResponse.data.data.role === 'patient') {
            // For patient, fetch their prescriptions
            const prescriptionsResponse = await api.prescriptions.getByPatient(userResponse.data.data._id);
            prescriptionsData = prescriptionsResponse.data.data || [];
          } else if (userResponse.data.data.role === 'doctor') {
            // For doctors, fetch prescriptions they created
            const prescriptionsResponse = await api.prescriptions.getByDoctor(userResponse.data.data._id);
            prescriptionsData = prescriptionsResponse.data.data || [];
          } else {
            // Default fallback
            prescriptionsData = [];
          }
          
          setPrescriptions(prescriptionsData);
        } catch (prescriptionError) {
          console.error("Error fetching prescriptions:", prescriptionError);
          setPrescriptions([]);
        }

        // Fetch medical records
        try {
          const medicalRecordsResponse = await api.medicalRecords.getByPatient(userResponse.data.data._id);
          setMedicalRecords(medicalRecordsResponse.data.data || []);
        } catch (medicalRecordsError) {
          console.error("Error fetching medical records:", medicalRecordsError);
          setMedicalRecords([]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Patient Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and account settings.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.email}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.phone || 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Gender
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.gender || 'N/A'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Date of Birth
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.dateOfBirth ? formatDate(userData.dateOfBirth) : 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                About
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.bio || 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Health Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointments */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Appointments
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your upcoming and past appointments.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Appointments
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointments.length}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Upcoming Appointments
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointments.filter(appointment => appointment.status === 'scheduled').length}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Completed Appointments
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointments.filter(appointment => appointment.status === 'completed').length}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => navigate('/appointments')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View All Appointments
              </button>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Prescriptions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your current and past prescriptions.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Prescriptions
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {prescriptions.length}
                  </dd>
                </div>
                {/* Add more prescription-related stats here if needed */}
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => navigate('/prescriptions')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View All Prescriptions
              </button>
            </div>
          </div>

          {/* Medical Records */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Medical Records
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your medical history and records.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Records
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {medicalRecords.length}
                  </dd>
                </div>
                {/* Add more medical record-related stats here if needed */}
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => navigate('/medical-records')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View All Medical Records
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;