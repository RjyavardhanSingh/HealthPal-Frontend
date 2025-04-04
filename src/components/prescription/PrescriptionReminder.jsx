import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const PrescriptionReminder = ({ prescription }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reminderTimes, setReminderTimes] = useState(
    prescription.medications.map(med => ({
      medicationId: med._id || `med-${Math.random().toString(36).substring(2, 9)}`,
      time: '08:00'
    }))
  );

  const handleTimeChange = (index, time) => {
    const updatedTimes = [...reminderTimes];
    updatedTimes[index].time = time;
    setReminderTimes(updatedTimes);
  };

  const createReminders = async () => {
    setLoading(true);
    try {
      const promises = prescription.medications.map((medication, index) => {
        // Get frequency for the reminder based on medication instructions
        let frequency = 'once_daily';
        if (medication.frequency.toLowerCase().includes('twice') || 
            medication.frequency.toLowerCase().includes('2 times')) {
          frequency = 'twice_daily';
        } else if (medication.frequency.toLowerCase().includes('three') || 
                  medication.frequency.toLowerCase().includes('3 times')) {
          frequency = 'three_times_daily';
        } else if (medication.frequency.toLowerCase().includes('every other')) {
          frequency = 'every_other_day';
        } else if (medication.frequency.toLowerCase().includes('week')) {
          frequency = 'weekly';
        }
        
        return api.medications.createReminder({
          medicineName: medication.name,
          dosage: medication.dosage,
          frequency: frequency,
          time: reminderTimes[index].time,
          notes: `${medication.frequency}. ${prescription.notes || ''}`,
          prescriptionId: prescription._id
        });
      });
      
      await Promise.all(promises);
      toast.success('Medication reminders created successfully');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating medication reminders:', error);
      toast.error('Failed to create reminders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-primary-600 text-sm flex items-center hover:text-primary-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          Set Medication Reminders
        </button>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3">Set Reminder Times</h4>
          {prescription.medications.map((medication, index) => (
            <div key={index} className="mb-3 flex items-center">
              <div className="flex-grow">
                <p className="font-medium text-sm">{medication.name}</p>
                <p className="text-xs text-gray-500">{medication.dosage} - {medication.frequency}</p>
              </div>
              <div className="ml-4">
                <input
                  type="time"
                  value={reminderTimes[index].time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="border border-gray-300 rounded p-1 text-sm"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-3 space-x-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={createReminders}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Reminders'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionReminder;