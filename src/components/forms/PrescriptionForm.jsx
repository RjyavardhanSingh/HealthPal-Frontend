import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const PrescriptionForm = ({ consultationId, patientId, doctorId, onSuccess }) => {
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updatedMedications = medications.filter((_, i) => i !== index);
      setMedications(updatedMedications);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = medications.every(med => 
      med.name.trim() !== '' && 
      med.dosage.trim() !== '' && 
      med.frequency.trim() !== '' && 
      med.duration.trim() !== ''
    );
    
    if (!isValid) {
      toast.error('Please fill all required medication fields (name, dosage, frequency, duration)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate expiry date based on days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(expiryDays));
      
      const prescriptionData = {
        consultationId,
        patientId,
        doctorId,
        medications,
        notes,
        expiryDate
      };
      
      const response = await api.prescriptions.create(prescriptionData);
      
      toast.success('Prescription created successfully');
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      // Reset form
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setNotes('');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Create Prescription</h3>
        <p className="mt-1 text-sm text-gray-600">Add medications for the patient</p>
      </div>
      
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Medications</h4>
          
          {medications.map((medication, index) => (
            <div key={index} className="p-4 border rounded-md mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium">Medication #{index + 1}</h5>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`med-name-${index}`} className="block text-sm font-medium text-gray-700">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    id={`med-name-${index}`}
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`med-dosage-${index}`} className="block text-sm font-medium text-gray-700">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    id={`med-dosage-${index}`}
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`med-frequency-${index}`} className="block text-sm font-medium text-gray-700">
                    Frequency *
                  </label>
                  <input
                    type="text"
                    id={`med-frequency-${index}`}
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`med-duration-${index}`} className="block text-sm font-medium text-gray-700">
                    Duration *
                  </label>
                  <input
                    type="text"
                    id={`med-duration-${index}`}
                    value={medication.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor={`med-instructions-${index}`} className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    id={`med-instructions-${index}`}
                    value={medication.instructions}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    placeholder="e.g., Take after meals with water"
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addMedication}
            className="mt-2 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another Medication
          </button>
        </div>
        
        <div className="mb-6">
          <label htmlFor="prescription-notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="prescription-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Any additional instructions or notes for the patient"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="expiry-days" className="block text-sm font-medium text-gray-700">
            Valid for (days)
          </label>
          <select
            id="expiry-days"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;