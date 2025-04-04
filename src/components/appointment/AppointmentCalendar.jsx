import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AppointmentCalendar = ({ doctorId, onSlotSelect }) => {
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        const response = await api.appointments.getAvailableDates(doctorId);
        setAvailableDates(response.data.dates || []);
        
        // Set the first available date as selected
        if (response.data.dates && response.data.dates.length > 0) {
          const firstDate = new Date(response.data.dates[0]);
          setSelectedDate(firstDate);
          fetchTimeSlots(firstDate);
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableDates();
  }, [doctorId]);
  
  const fetchTimeSlots = async (date) => {
    if (!date) return;
    
    try {
      setLoadingSlots(true);
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.appointments.getAvailableTimeSlots(doctorId, formattedDate);
      
      // Group slots by period (morning, afternoon, evening)
      const slots = response.data.slots || [];
      setTimeSlots(slots);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchTimeSlots(date);
  };
  
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect({
      date: selectedDate,
      slot: slot
    });
  };
  
  // Group time slots by period
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.period]) {
      acc[slot.period] = [];
    }
    acc[slot.period].push(slot);
    return acc;
  }, {});
  
  // Function to highlight dates with availability
  const highlightAvailableDates = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return availableDates.includes(formattedDate);
  };
  
  if (loading) {
    return <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>;
  }
  
  if (availableDates.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This doctor has no available appointment slots. Please check back later or contact the clinic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div>
        <h3 className="text-lg font-medium mb-3">Select Date</h3>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            inline
            highlightDates={[
              {
                dates: availableDates.map(date => new Date(date)),
                className: 'bg-primary-100 text-primary-800 rounded-full'
              }
            ]}
            dayClassName={date => {
              return highlightAvailableDates(date) 
                ? "bg-primary-100 text-primary-800 rounded-full" 
                : undefined;
            }}
            filterDate={highlightAvailableDates}
          />
        </div>
      </div>
      
      {/* Time slots */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-medium mb-3">Select Time</h3>
          {loadingSlots ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
          ) : timeSlots.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-sm text-yellow-700">No available slots for this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Morning */}
              {groupedSlots.morning && groupedSlots.morning.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-1v1a1 1 0 11-2 0v-3z" clipRule="evenodd" />
                    </svg>
                    Morning
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedSlots.morning.map((slot, index) => (
                      <button
                        key={`morning-${index}`}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-2 py-3 text-xs font-medium rounded-md text-center transition ${
                          selectedSlot && selectedSlot.start === slot.start 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {slot.start.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Afternoon */}
              {groupedSlots.afternoon && groupedSlots.afternoon.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12A6 6 0 0010 4z" clipRule="evenodd" />
                    </svg>
                    Afternoon
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedSlots.afternoon.map((slot, index) => (
                      <button
                        key={`afternoon-${index}`}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-2 py-3 text-xs font-medium rounded-md text-center transition ${
                          selectedSlot && selectedSlot.start === slot.start 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                      >
                        {slot.start.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Evening */}
              {groupedSlots.evening && groupedSlots.evening.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-indigo-700 mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    Evening
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {groupedSlots.evening.map((slot, index) => (
                      <button
                        key={`evening-${index}`}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-2 py-3 text-xs font-medium rounded-md text-center transition ${
                          selectedSlot && selectedSlot.start === slot.start 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {slot.start.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;