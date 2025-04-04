import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const PrescriptionForm = ({ consultationId, patientId, doctorId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    diagnosis: '',
    notes: '',
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Default 30 days
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({ ...prev, medications: updatedMedications }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    setFormData(prev => ({ ...prev, medications: updatedMedications }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required medication fields
    if (formData.medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      toast.error('Please fill in all required medication details (name, dosage, frequency, and duration)');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.prescriptions.create({
        consultationId: consultationId, // CHANGE THIS LINE: consultation → consultationId
        patient: patientId,
        doctor: doctorId,
        medications: formData.medications,
        notes: formData.notes,
        expiryDate: formData.expiryDate
      });
      
      toast.success('Prescription created successfully');
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Create Prescription</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
        <input
          type="text"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Patient diagnosis"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
        {formData.medications.map((med, index) => (
          <div key={index} className="p-3 border rounded-md mb-2 bg-gray-50">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-gray-500">
                  Medication Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  className={`w-full border ${!med.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                  placeholder="Medication name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  className={`w-full border ${!med.dosage ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                  placeholder="Dosage (e.g., 500mg)"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={med.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  className={`w-full border ${!med.frequency ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                  placeholder="Frequency (e.g., Twice daily)"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={med.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  className={`w-full border ${!med.duration ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                  placeholder="Duration (e.g., 7 days)"
                  required
                />
              </div>
            </div>
            {formData.medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="mt-2 text-red-600 text-xs"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMedication}
          className="text-primary-600 text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Another Medication
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
          placeholder="Special instructions for the patient"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="2"
          placeholder="Additional notes (only visible to healthcare professionals)"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm hover:bg-primary-700"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Create Prescription'}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;