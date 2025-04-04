import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import MedicalRecordSelector from '../../components/medical-record/MedicalRecordSelector';
import StripeProvider from '../../components/payment/StripeProvider';
import PaymentForm from '../../components/payment/PaymentForm';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);
  const [appointmentFee, setAppointmentFee] = useState(0);

  // Block doctors from booking appointments
  useEffect(() => {
    if (currentUser?.role === 'doctor') {
      toast.error("Doctors cannot book appointments");
      navigate('/doctor/dashboard');
      return;
    }
    
    fetchDoctor();
  }, [currentUser, navigate]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await api.doctors.getById(doctorId);
      setDoctor(response.data.data);
      fetchAvailableDates();
    } catch (err) {
      setError("Failed to load doctor information");
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchAvailableDates function
  const fetchAvailableDates = async () => {
    try {
      console.log("Fetching available dates for doctor:", doctorId);
      const response = await api.doctors.getAvailableDates(doctorId);
      console.log("Available dates response:", response.data);
      
      // Store the doctor's appointment acceptance status
      const isAcceptingAppointments = response.data.isAcceptingAppointments !== false;
      setDoctor(prev => ({
        ...prev,
        isAcceptingAppointments
      }));
      
      // Only set available dates if doctor is accepting appointments
      if (isAcceptingAppointments) {
        const dates = response.data.dates || [];
        setAvailableDates(dates);
        
        // If there are available dates, select the first one
        if (dates.length > 0) {
          // Default to the first available future date
          const futureDates = dates.filter(dateStr => {
            const date = new Date(dateStr);
            const today = new Date();
            today.setHours(0,0,0,0);
            return date >= today;
          }).sort();
          
          if (futureDates.length > 0) {
            setSelectedDate(new Date(futureDates[0]));
          }
        }
      } else {
        // Doctor is on leave, clear available dates
        setAvailableDates([]);
        setSelectedDate(null);
      }
    } catch (err) {
      console.error("Error fetching available dates:", err);
    }
  };

  // Fetch slots when date changes
  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate, doctorId]);

  const handleDateChange = (date) => {
    console.log("Date selected:", date.toISOString().split('T')[0]);
    setSelectedDate(date);
    setSelectedSlot(null);
    
    // Always fetch available slots when date changes
    if (date && doctorId) {
      fetchAvailableSlots(date);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !reason) {
      setError('Please select a time slot and provide a reason for your visit');
      return;
    }

    setBookingInProgress(true);
    setError(null);

    try {
      const appointmentData = {
        doctorId,
        date: selectedDate.toISOString().split('T')[0],
        time: {
          start: selectedSlot.start,
          end: selectedSlot.end
        },
        type: appointmentType,
        reason,
        attachedRecords: selectedRecords.map(record => record._id),
      };

      // Create appointment but mark as unpaid
      const response = await api.appointments.create(appointmentData);
      
      // Set up payment
      setPendingAppointmentId(response.data.data._id);
      // Convert to cents for Stripe
      setAppointmentFee(doctor.consultationFee * 100);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      setBookingInProgress(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success('Appointment booked and payment completed successfully');
    navigate(`/appointments/${pendingAppointmentId}`);
    setBookingInProgress(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast.warning('Appointment created but payment not completed');
    navigate(`/appointments/${pendingAppointmentId}`);
    setBookingInProgress(false);
  };

  // Improved isDateAvailable function to handle date comparison correctly
  const isDateAvailable = (date) => {
    if (!date || !availableDates.length) return false;
    
    const formattedDate = date.toISOString().split('T')[0];
    const isAvailable = availableDates.includes(formattedDate);
    
    return isAvailable;
  };

  const fetchAvailableSlots = async (date = selectedDate) => {
    if (!date || !doctorId) return;
    
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      
      const formattedDate = date.toISOString().split('T')[0];
      console.log("Fetching slots for date:", formattedDate);
      
      const response = await api.doctors.getAvailableTimeSlots(doctorId, formattedDate);
      console.log("Slots received:", response.data);
      
      const slots = response.data.slots || [];
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        console.log("No available slots for this date");
      }
    } catch (err) {
      console.error("Error loading time slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500">{error}</div>;
  }

  if (!doctor) {
    return <div className="p-4">Doctor not found</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-primary-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Book Appointment with Dr. {doctor.name}</h1>
          
          {!doctor.isAcceptingAppointments && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-bold">Doctor is Currently On Leave</h3>
                  <p className="text-sm">Dr. {doctor.name} is not accepting appointments at the moment. Please check back again soon or choose another doctor.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doctor info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt={doctor.name} className="w-16 h-16 rounded-full mr-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 text-xl font-bold">{doctor.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">Dr. {doctor.name}</h2>
                  <p className="text-gray-600">{doctor.specialization}</p>
                  <p className="text-sm text-gray-500">${doctor.consultationFee} per visit</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="in-person"
                      checked={appointmentType === 'in-person'}
                      onChange={() => setAppointmentType('in-person')}
                      className="mr-2"
                    />
                    <span>In-person visit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="video"
                      checked={appointmentType === 'video'}
                      onChange={() => setAppointmentType('video')}
                      className="mr-2"
                    />
                    <span>Video consultation</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows="4"
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                ></textarea>
              </div>
            </div>
            
            {/* Calendar and slots */}
            <div className="lg:col-span-2">
              {doctor.isAcceptingAppointments ? (
                <>
                  {/* Date picker */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Select Date</h3>
                    {availableDates.length > 0 ? (
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        filterDate={isDateAvailable}  // Only allow selection of available dates
                        inline
                        dayClassName={date => {
                          return isDateAvailable(date) 
                            ? "bg-primary-100 text-primary-800" 
                            : undefined;
                        }}
                        className="w-full"
                      />
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-2">
                          {doctor?.isAcceptingAppointments === false 
                            ? "This doctor is currently on leave and not accepting appointments."
                            : "This doctor has no available time slots at the moment."}
                        </p>
                        <button
                          onClick={() => navigate('/find-doctor')}
                          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm"
                        >
                          Find Another Doctor
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Time slot selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-2 px-2 text-center text-sm rounded-md transition-colors ${
                              selectedSlot && selectedSlot.start === slot.start
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {slot.start.substring(0, 5)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        No available slots for the selected date
                      </p>
                    )}
                  </div>
                  
                  <MedicalRecordSelector 
                    selectedRecords={selectedRecords}
                    setSelectedRecords={setSelectedRecords}
                  />

                  <div className="mt-8">
                    <button
                      onClick={handleBookAppointment}
                      disabled={!selectedSlot || !reason || bookingInProgress}
                      className={`w-full py-3 px-4 rounded-md text-white font-medium 
                        ${(!selectedSlot || !reason || bookingInProgress) 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 hover:bg-primary-700'}`}
                    >
                      {bookingInProgress ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Doctor is On Leave</h3>
                  <p className="text-gray-600 mb-4">
                    Dr. {doctor.name} is currently unavailable for appointments. 
                    Please check back later or choose another doctor.
                  </p>
                  <button
                    onClick={() => navigate('/find-doctor')}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Find Another Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && pendingAppointmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-medium mb-4">Complete Payment</h2>
            <p className="mb-4 text-gray-600">
              Please complete the payment to confirm your appointment with Dr. {doctor.name}.
            </p>
            
            <StripeProvider>
              <PaymentForm
                appointmentId={pendingAppointmentId}
                amount={appointmentFee}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </StripeProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;