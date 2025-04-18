import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import PrescriptionForm from '../../components/prescription/PrescriptionForm';

const AppointmentManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationId, setConsultationId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        if (!currentUser || !currentUser._id) {
          console.error('No authenticated user or missing ID');
          toast.error('Authentication error');
          return;
        }
        
        // Set query params based on filter
        let queryParams = {};
        
        switch(filter) {
          case 'upcoming':
            queryParams.status = 'scheduled';
            queryParams.before = 'false'; // Add this parameter
            break;
          case 'completed':
            queryParams.status = 'completed';
            break;
          case 'missed':
            queryParams.status = 'cancelled,no-show';
            break;
          case 'no-response':
            queryParams.status = 'scheduled';
            queryParams.before = 'true'; // Add this parameter
            break;
          default:
            break;
        }

        console.log('Fetching appointments with params:', queryParams);
        
        // Use the api object properly
        const response = await api.appointments.getAll(queryParams);
        
        console.log('Appointments response:', response);
        
        if (response?.data?.data) {
          setAppointments(response.data.data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser, filter]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'completed') {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        
        if (appointment && appointment.type === 'in-person') {
          setSelectedAppointment(appointment);
          
          try {
            const consultationData = {
              appointmentId: appointmentId,
              symptoms: appointment.reason || 'In-person visit',
              diagnosis: 'In-person consultation completed',
              notes: 'Visit completed at hospital/clinic',
              vitalSigns: {},
              followUpRequired: false
            };
            
            const response = await api.consultations.create(consultationData);
            setConsultationId(response.data.data._id);
            
            setShowPrescriptionModal(true);
            return;
          } catch (err) {
            console.error('Error creating consultation record:', err);
            toast.warning('There was an issue recording consultation details');
          }
        }
      }
      
      await api.appointments.updateStatus(appointmentId, newStatus);
      
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? {...apt, status: newStatus} : apt
      ));
      
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handlePrescriptionSuccess = async () => {
    try {
      if (!selectedAppointment) return;
      
      await api.appointments.updateStatus(selectedAppointment._id, 'completed');
      
      setAppointments(appointments.map(apt => 
        apt._id === selectedAppointment._id ? {...apt, status: 'completed'} : apt
      ));
      
      toast.success('Prescription issued and appointment completed');
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
      setConsultationId(null);
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}`);
    console.log(`Navigating to: /doctor/appointments/${appointmentId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Appointments</h1>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded ${
              filter === 'upcoming' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded ${
              filter === 'completed' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1 rounded ${
              filter === 'missed' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'
            }`}
          >
            Missed/No-show
          </button>
          <button
            onClick={() => setFilter('no-response')}
            className={`px-3 py-1 rounded ${
              filter === 'no-response' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'
            }`}
          >
            No Response
          </button>
        </div>
        
        {loading ? (
          <div className="py-8 text-center"><LoadingSpinner /></div>
        ) : appointments.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No appointments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Patient</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date & Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map(appointment => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          <span className="font-medium text-primary-700">
                            {appointment.patient?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <span>{appointment.patient?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(appointment.date).toLocaleDateString()}<br />
                      <span className="text-sm text-gray-500">
                        {appointment.time.start} - {appointment.time.end}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100">
                        {appointment.type}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button 
                        onClick={() => handleViewAppointment(appointment._id)}
                        className="text-primary-600 hover:underline mr-2"
                      >
                        View
                      </button>
                      {appointment.status === 'scheduled' && (
                        <>
                          {appointment.type === 'video' ? (
                            <button 
                              onClick={() => navigate(`/doctor/video-preparation/${appointment._id}`)}
                              className="text-green-600 hover:underline mr-2"
                            >
                              Start Consultation
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(appointment._id, 'completed')}
                              className="text-green-600 hover:underline mr-2"
                            >
                              Visited
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'no-show')}
                            className="text-red-600 hover:underline"
                          >
                            No-show
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showPrescriptionModal && selectedAppointment && consultationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Write Prescription</h2>
            <PrescriptionForm 
              consultationId={consultationId}
              patientId={selectedAppointment.patient._id}
              doctorId={currentUser._id}
              onSuccess={handlePrescriptionSuccess}
              onCancel={() => {
                setShowPrescriptionModal(false);
                setSelectedAppointment(null);
                setConsultationId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;