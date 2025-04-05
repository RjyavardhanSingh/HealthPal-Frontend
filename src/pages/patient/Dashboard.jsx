import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ONLY scheduled appointments 
        console.log('Fetching scheduled appointments for patient dashboard');
        const appointmentsResponse = await api.appointments.getAll({
          status: 'scheduled'
        });
        
        console.log('Appointments response:', appointmentsResponse);
        
        if (!appointmentsResponse.data.data || appointmentsResponse.data.data.length === 0) {
          console.log('No scheduled appointments found');
          setAppointments([]);
        } else {
          // Sort appointments by date and time combined
          const sortedAppointments = [...appointmentsResponse.data.data].sort((a, b) => {
            // Create Date objects with both date and time components
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Add time component
            if (a.time && a.time.start) {
              const [hoursA, minutesA] = a.time.start.split(':').map(Number);
              dateA.setHours(hoursA, minutesA, 0, 0);
            }
            
            if (b.time && b.time.start) {
              const [hoursB, minutesB] = b.time.start.split(':').map(Number);
              dateB.setHours(hoursB, minutesB, 0, 0);
            }
            
            // Return comparison result (earliest first)
            return dateA - dateB;
          });
          
          console.log('Sorted appointments:', sortedAppointments);
          console.log('Taking only 2 most upcoming appointments');
          
          // Get only the 2 closest upcoming appointments
          setAppointments(sortedAppointments.slice(0, 2));
        }
        
        // Fetch prescriptions - keep this part unchanged
        try {
          const prescriptionsResponse = await api.prescriptions.getByPatient(currentUser._id);
          setPrescriptions(prescriptionsResponse.data.data || []);
        } catch (err) {
          console.error('Error fetching prescriptions:', err);
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && currentUser._id) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    // After fetching appointments
    const fetchData = async () => {
      try {
        const response = await api.appointments.getAll({ patientId: currentUser._id });
        const appointments = response.data.data || [];
        
        // Debug output
        console.log('Appointment types:', appointments.map(appt => ({
          id: appt._id,
          type: appt.type,
          status: appt.status,
          date: appt.date,
          time: appt.time
        })));
        
        setUpcomingAppointments(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser._id]);
  
  return (
    <div className="pb-12">
      {/* Hero section with user greeting */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Hello, {currentUser?.displayName || 'there'}!</h1>
        <p className="opacity-90">How are you feeling today?</p>
        
        {/* Quick action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/find-doctor')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition flex flex-col items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Find Doctor</span>
          </button>
          
          <button 
            onClick={() => navigate('/appointments/new')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition flex flex-col items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Schedule</span>
          </button>
        </div>
      </div>
      
      {/* Upcoming appointments section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
          <button 
            onClick={() => navigate('/appointments')}
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            View all
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map(appointment => (
              <div key={appointment._id} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  {appointment.doctor?.profileImage ? (
                    <img 
                      src={appointment.doctor.profileImage} 
                      alt={appointment.doctor.name || 'Doctor'} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {appointment.doctor?.name ? appointment.doctor.name.charAt(0) : 'D'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'Your Healthcare Provider'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appointment.doctor?.specialization || 'Medical Professional'}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      {/* Existing time/date display code */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming appointments</p>
            <button 
              onClick={() => navigate('/appointments/new')}
              className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Schedule Now
            </button>
          </div>
        )}
      </div>

      {/* Video Consultations Section */}
      {appointments.some(appt => appt.type === 'video') && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Your Video Consultations</h3>
          <div className="space-y-2">
            {appointments
              .filter(appt => appt.type === 'video' && appt.status === 'scheduled')
              .map(appointment => (
                <div key={appointment._id} className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                  <div>
                    <p className="font-medium">Dr. {appointment.doctor.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time.start}
                    </p>
                  </div>
                  <Link
                    to={`/video-preparation/${appointment._id}`}
                    className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700"
                  >
                    Join Video Call
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Recent prescriptions section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Prescriptions</h2>
          <button 
            onClick={() => navigate('/prescriptions')}
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            View all
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map(prescription => (
              <div 
                key={prescription._id} 
                className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition flex justify-between items-center"
                onClick={() => navigate(`/prescriptions/${prescription._id}`)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {prescription.medications[0].name} {prescription.medications.length > 1 && `+ ${prescription.medications.length - 1} more`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Prescribed by Dr. {prescription.doctor.name} • {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent prescriptions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;