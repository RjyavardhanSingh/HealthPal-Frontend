import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CalendarDatePicker = ({ doctorId, selectedDate, onDateChange, appointmentType }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available dates for this doctor
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!doctorId) return;
      
      try {
        setLoading(true);
        const response = await api.doctors.getAvailableDates(doctorId);
        setAvailableDates(response.data.dates || []);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast.error('Could not load available appointment dates');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [doctorId]);

  // Check if a date has available slots
  const isDateAvailable = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return availableDates.includes(formattedDate);
  };

  // Handles date selection
  const handleDateChange = (date) => {
    onDateChange(date);
  };

  // Custom day rendering to show availability indicators
  const renderCustomDay = (day, selectedDate, dayInCurrentMonth, dayComponent) => {
    const isAvailable = isDateAvailable(day);
    
    return (
      <div className={`
        ${isAvailable ? 'bg-primary-50 border border-primary-200' : ''}
        ${day.getTime() === (selectedDate?.getTime() || 0) ? 'bg-primary-100' : ''}
        hover:bg-primary-50 rounded-full
      `}>
        {dayComponent}
        {isAvailable && (
          <div className="w-1 h-1 bg-primary-500 rounded-full mx-auto mt-0.5"></div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-4"><LoadingSpinner size="md" /></div>;
  }

  return (
    <div className="calendar-picker">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        inline
        minDate={new Date()}
        filterDate={isDateAvailable}
        dayClassName={date => isDateAvailable(date) ? "available-day" : undefined}
        renderDayContents={(day, date) => renderCustomDay(
          date, 
          selectedDate, 
          date.getMonth() === selectedDate?.getMonth(), 
          <span>{day}</span>
        )}
      />
      <div className="mt-3 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
        <span className="text-xs text-gray-500">Dates with available slots</span>
      </div>
    </div>
  );
};

export default CalendarDatePicker;