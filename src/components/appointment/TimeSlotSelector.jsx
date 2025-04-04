import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const TimeSlotSelector = ({ 
  slots, 
  selectedSlot, 
  onSelectSlot, 
  loading,
  appointmentType
}) => {
  // Group slots by time of day
  const morningSlots = slots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 5 && hour < 12;
  });

  const afternoonSlots = slots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = slots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 17 && hour < 22;
  });

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Render time slot groups
  const renderTimeSlotGroup = (groupSlots, title, icon) => {
    if (groupSlots.length === 0) return null;
    
    return (
      <div className="mb-5">
        <h3 className="text-xs font-medium text-gray-500 mb-3 flex items-center">
          {icon}
          {title}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {groupSlots.map((slot, index) => (
            <button
              key={`${slot.startTime}-${slot.endTime}`}
              onClick={() => onSelectSlot(slot)}
              className={`
                py-2 text-center rounded-md text-sm font-medium 
                transition-colors duration-150 ease-in-out
                ${selectedSlot && selectedSlot.startTime === slot.startTime && selectedSlot.endTime === slot.endTime
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {formatTime(slot.startTime)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-600 mb-1">No slots available for this date</p>
        <p className="text-xs text-gray-500">Please select another date</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-700">Available Times</div>
        {appointmentType === 'video' && (
          <span className="text-xs text-primary-600 font-medium">
            Video appointments available 24/7
          </span>
        )}
      </div>

      {renderTimeSlotGroup(
        morningSlots,
        "MORNING",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )}

      {renderTimeSlotGroup(
        afternoonSlots,
        "AFTERNOON",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06z" />
        </svg>
      )}

      {renderTimeSlotGroup(
        eveningSlots,
        "EVENING",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </div>
  );
};

export default TimeSlotSelector;