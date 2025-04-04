import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import Button from '../common/Button';

const localizer = momentLocalizer(moment);

const AppointmentCalendar = ({ userRole }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.appointments.getAll();
        
        // Transform appointments for calendar display
        const formattedAppointments = response.data.data.map(apt => {
          // Parse date and time strings to create proper Date objects
          const [aptYear, aptMonth, aptDay] = apt.date.split('T')[0].split('-');
          const [startHour, startMin] = apt.time.start.split(':');
          const [endHour, endMin] = apt.time.end.split(':');
          
          const startDate = new Date(aptYear, aptMonth - 1, aptDay, startHour, startMin);
          const endDate = new Date(aptYear, aptMonth - 1, aptDay, endHour, endMin);
          
          return {
            id: apt._id,
            title: userRole === 'doctor' 
              ? `${apt.patient.name} (${apt.reason.substring(0, 20)}${apt.reason.length > 20 ? '...' : ''})`
              : `Dr. ${apt.doctor.name} - ${apt.reason.substring(0, 20)}${apt.reason.length > 20 ? '...' : ''}`,
            start: startDate,
            end: endDate,
            status: apt.status,
            type: apt.type,
            resource: apt
          };
        });
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
    
    // Set up automatic refresh every 5 minutes
    const intervalId = setInterval(fetchAppointments, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [userRole]);
  
  const handleSelectSlot = (slotInfo) => {
    // Only doctors can create new appointments from calendar
    if (userRole === 'doctor') {
      const roundedStartMinutes = Math.round(slotInfo.start.getMinutes() / 15) * 15;
      const roundedStart = new Date(slotInfo.start);
      roundedStart.setMinutes(roundedStartMinutes, 0, 0);
      
      const roundedEnd = new Date(roundedStart);
      roundedEnd.setMinutes(roundedStart.getMinutes() + 30);
      
      setSelectedSlot({
        start: roundedStart,
        end: roundedEnd
      });
      setShowModal(true);
    }
  };
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  const handleNavigateToAppointment = () => {
    if (selectedEvent && selectedEvent.id) {
      navigate(`/appointments/${selectedEvent.id}`);
      setShowEventModal(false);
    }
  };
  
  const handleCreateAppointment = () => {
    // Navigate to the appointment creation form with the selected slot pre-filled
    navigate('/appointment-management', { 
      state: { 
        activeTab: 'create',
        preSelectedDate: selectedSlot.start.toISOString().split('T')[0],
        preSelectedTime: {
          start: `${selectedSlot.start.getHours().toString().padStart(2, '0')}:${selectedSlot.start.getMinutes().toString().padStart(2, '0')}`,
          end: `${selectedSlot.end.getHours().toString().padStart(2, '0')}:${selectedSlot.end.getMinutes().toString().padStart(2, '0')}`
        }
      }
    });
    setShowModal(false);
  };
  
  // Calendar event styling based on appointment status and type
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    
    // Set color based on status
    switch (event.status) {
      case 'scheduled':
        style.backgroundColor = '#3182ce'; // blue
        break;
      case 'completed':
        style.backgroundColor = '#38a169'; // green
        break;
      case 'cancelled':
        style.backgroundColor = '#e53e3e'; // red
        break;
      case 'no-show':
        style.backgroundColor = '#d69e2e'; // yellow
        break;
      default:
        style.backgroundColor = '#3182ce'; // default blue
    }
    
    // Add border for different appointment types
    switch (event.type) {
      case 'video':
        style.borderLeft = '4px solid #805AD5'; // purple
        break;
      case 'phone':
        style.borderLeft = '4px solid #DD6B20'; // orange
        break;
      default:
        style.borderLeft = '4px solid #2C7A7B'; // teal for in-person
    }
    
    return { style };
  };

  return (
    <div className="h-[700px] bg-white rounded-lg">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable={userRole === 'doctor'} // Only doctors can select time slots
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            defaultView="week"
            views={['day', 'week', 'month', 'agenda']}
            step={15}
            timeslots={4}
            min={new Date(new Date().setHours(8, 0, 0))} // Start day at 8 AM
            max={new Date(new Date().setHours(18, 0, 0))} // End day at 6 PM
            tooltipAccessor={(event) => {
              const resource = event.resource;
              return `
                ${userRole === 'doctor' ? 'Patient' : 'Doctor'}: ${userRole === 'doctor' ? resource.patient.name : resource.doctor.name}
                Type: ${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                Status: ${resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                Date: ${new Date(resource.date).toLocaleDateString()}
                Time: ${resource.time.start} - ${resource.time.end}
                Reason: ${resource.reason}
              `;
            }}
          />

          {/* Modal for selected appointment */}
          <Modal 
            isOpen={showEventModal} 
            onClose={() => setShowEventModal(false)}
            title="Appointment Details"
          >
            {selectedEvent && (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {userRole === 'doctor' ? 'Patient' : 'Doctor'}
                  </h3>
                  <p>{userRole === 'doctor' 
                    ? selectedEvent.resource.patient.name 
                    : `Dr. ${selectedEvent.resource.doctor.name}`}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
                  <p>
                    {new Date(selectedEvent.resource.date).toLocaleDateString()} 
                    <span className="ml-2">
                      {selectedEvent.resource.time.start} - {selectedEvent.resource.time.end}
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Type</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${selectedEvent.type === 'video' 
                      ? 'bg-purple-100 text-purple-800' 
                      : selectedEvent.type === 'phone' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Status</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${selectedEvent.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-800' 
                      : selectedEvent.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedEvent.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Reason</h3>
                  <p>{selectedEvent.resource.reason}</p>
                </div>

                {selectedEvent.resource.notes && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Notes</h3>
                    <p>{selectedEvent.resource.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleNavigateToAppointment}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal for creating new appointment */}
          <Modal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)}
            title="Create New Appointment"
          >
            <div className="p-4">
              <p className="mb-4">
                Would you like to schedule an appointment for:
              </p>
              <p className="font-semibold mb-4">
                {selectedSlot && (
                  <>
                    Date: {selectedSlot.start.toLocaleDateString()}
                    <br />
                    Time: {selectedSlot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {selectedSlot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </>
                )}
              </p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Appointment
                </button>
              </div>
            </div>
          </Modal>

          {/* Legend for appointment types and statuses */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-sm mb-2 text-gray-700">Legend</h3>
            <div className="flex flex-wrap gap-4">
              {/* Status legends */}
              <div>
                <h4 className="text-xs text-gray-500 mb-1">Status:</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs text-gray-700">Scheduled</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-xs text-gray-700">Cancelled</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-gray-700">No-show</span>
                  </div>
                </div>
              </div>

              {/* Type legends */}
              <div>
                <h4 className="text-xs text-gray-500 mb-1">Type:</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1" style={{ backgroundColor: '#2C7A7B' }}></div>
                    <span className="text-xs text-gray-700">In-person</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1" style={{ backgroundColor: '#805AD5' }}></div>
                    <span className="text-xs text-gray-700">Video</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1" style={{ backgroundColor: '#DD6B20' }}></div>
                    <span className="text-xs text-gray-700">Phone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentCalendar;