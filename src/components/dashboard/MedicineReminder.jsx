import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';

const MedicineReminder = ({ onRefresh }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'once_daily',
    time: '08:00',
    notes: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      
      // Get the user's MongoDB ID from auth/me if needed
      const userResponse = await api.auth.getMe();
      const patientId = userResponse.data.data._id;
      
      console.log('Fetching medication reminders for patient:', patientId);
      const response = await api.medications.getReminders();
      
      console.log('Medication reminders response:', response);
      setReminders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
      toast.error('Failed to load medication reminders');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      await api.medications.createReminder(newReminder);
      toast.success('Medication reminder added');
      setShowAddForm(false);
      setNewReminder({
        medicineName: '',
        dosage: '',
        frequency: 'once_daily',
        time: '08:00',
        notes: ''
      });
      fetchReminders();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  const handleMarkTaken = async (id) => {
    try {
      await api.medications.markTaken(id);
      toast.success('Marked as taken');
      fetchReminders();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error marking as taken:', error);
      toast.error('Failed to update status');
    }
  };

  const getNextDoseTime = (reminder) => {
    if (!reminder?.time) {
      return null; // Handle missing time data
    }
    
    try {
      const now = new Date();
      
      // Parse time string with better error handling
      const [hours, minutes] = (reminder.time || "08:00").split(':').map(Number);
      
      // Create next dose time
      const nextDose = new Date();
      nextDose.setHours(hours || 0, minutes || 0, 0, 0);
      
      // If time already passed today, set to tomorrow
      if (nextDose < now) {
        nextDose.setDate(nextDose.getDate() + 1);
      }
      
      return nextDose;
    } catch (err) {
      console.error('Error calculating next dose time:', err);
      return null; // Return null instead of potentially invalid date
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Medicine Reminders</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-md hover:bg-primary-100"
        >
          {showAddForm ? 'Cancel' : '+ Add Reminder'}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddReminder} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newReminder.medicineName}
              onChange={(e) => setNewReminder({...newReminder, medicineName: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newReminder.dosage}
                onChange={(e) => setNewReminder({...newReminder, dosage: e.target.value})}
                placeholder="e.g. 1 tablet"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newReminder.time}
                onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newReminder.frequency}
              onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
              required
            >
              <option value="once_daily">Once Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="three_times_daily">Three Times Daily</option>
              <option value="every_other_day">Every Other Day</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newReminder.notes}
              onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
              rows="2"
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
          >
            Save Reminder
          </button>
        </form>
      )}
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder._id} className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-medium">{reminder.medicineName}</h3>
                <p className="text-sm text-gray-600">{reminder.dosage}</p>
                <p className="text-xs text-gray-500">
                  {reminder.time ? (
                    <>Next dose: {getNextDoseTime(reminder) ? 
                      format(getNextDoseTime(reminder), 'h:mm a') : 
                      'Time not set'}
                    </>
                  ) : 'No schedule set'}
                </p>
              </div>
              <button
                onClick={() => handleMarkTaken(reminder._id)}
                className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-md hover:bg-green-100"
              >
                Mark as Taken
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No medication reminders set</p>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-primary-600 underline"
            >
              Add your first reminder
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineReminder;