import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if video consultation can be joined
  const isVideoAppointment = appointment.type === 'video';
  const isScheduled = appointment.status === 'scheduled';
  
  // Create a proper date object with time component
  const appointmentDate = new Date(appointment.date);
  const currentDate = new Date();
  
  // Add the time component from appointment.time.start
  if (appointment.time && appointment.time.start) {
    const [hours, minutes] = appointment.time.start.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
  }
  
  // Debug information 
  console.log(`Appointment ${appointment._id}:`, {
    type: appointment.type,
    status: appointment.status,
    appointmentTime: appointmentDate.toISOString(),
    currentTime: currentDate.toISOString(),
    timeDiffMinutes: Math.abs((appointmentDate - currentDate) / (1000 * 60))
  });

  // Always show join button for video appointments that are scheduled
  const canJoinVideoCall = isVideoAppointment && isScheduled;

  const handleJoinVideo = (e) => {
    e.preventDefault();
    navigate(`/video-preparation/${appointment._id}`);
  };

  return (
    <div className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link to={`/appointments/${appointment._id}`} className="block">
            <p className="font-medium text-gray-900">Dr. {appointment.doctor?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-500">{appointment.doctor?.specialization || 'Specialist'}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>{formatDate(appointment.date || new Date())}</span>
              <span className="mx-1">•</span>
              <span>{appointment.time?.start || '00:00'} - {appointment.time?.end || '00:00'}</span>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            appointment.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {appointment.type === 'video' ? 'Video' : 'In-person'}
          </span>
          
          {canJoinVideoCall && (
            <button
              onClick={handleJoinVideo}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Join Video Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;