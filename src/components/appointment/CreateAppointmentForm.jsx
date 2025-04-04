import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CreateAppointmentForm = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch patients for the dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.patients.getAll();
        setPatients(response.data.data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  // Auto-calculate end time (30 min after start time)
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let newHours = hours;
      let newMinutes = minutes + 30;
      
      if (newMinutes >= 60) {
        newHours = (newHours + 1) % 24;
        newMinutes = newMinutes - 60;
      }
      
      const newEndTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  }, [startTime]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedDate || !startTime || !endTime || !reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      await api.appointments.createByStaff({
        patientId: selectedPatient,
        date: selectedDate,
        time: {
          start: startTime,
          end: endTime
        },
        type: appointmentType,
        reason,
        notes
      });
      
      toast.success('Appointment created successfully');
      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter patients by search term
  const filteredPatients = searchTerm
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : patients;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Schedule Appointment for Patient</h3>
        <p className="text-sm text-gray-500">Create an appointment on behalf of a patient</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Search Patient
        </label>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Patient <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a patient</option>
          {filteredPatients.map(patient => (
            <option key={patient._id} value={patient._id}>
              {patient.name} ({patient.email})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Appointment Type <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="in-person"
              checked={appointmentType === 'in-person'}
              onChange={() => setAppointmentType('in-person')}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">In-person</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="video"
              checked={appointmentType === 'video'}
              onChange={() => setAppointmentType('video')}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Video Call</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="phone"
              checked={appointmentType === 'phone'}
              onChange={() => setAppointmentType('phone')}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Phone Call</span>
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reason <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Annual checkup, Follow-up visit"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          placeholder="Any additional information or special instructions"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/appointments')}
          className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
        >
          {loading ? 'Creating...' : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
};

export default CreateAppointmentForm;