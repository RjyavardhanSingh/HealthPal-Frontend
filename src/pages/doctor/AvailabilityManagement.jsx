import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import Switch from "../../components/common/Switch"

// Custom CSS for the redesigned UI
const customStyles = `
  /* Base animations */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Animation classes */
  .animate-slide-up {
    animation: slideUp 0.6s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s infinite;
  }
  
  /* Staggered animations */
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  
  /* Custom UI elements */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  /* Custom background */
  .bg-pattern {
    background-color: #f8fafc;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  /* Custom gradients */
  .gradient-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  
  .gradient-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  
  .gradient-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  
  .gradient-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .gradient-info {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  }
  
  /* Custom text styles */
  .text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
  }
  
  /* Time slot styles */
  .time-slot {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  
  .time-slot:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  .time-slot-selected {
    position: relative;
  }
  
  .time-slot-selected::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border: 2px solid #3b82f6;
    border-radius: 0.375rem;
    pointer-events: none;
  }
  
  .time-slot-booked {
    position: relative;
  }
  
  .time-slot-booked::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 12px 12px 0;
    border-color: transparent #ef4444 transparent transparent;
  }
  
  /* Custom DatePicker styles */
  .custom-datepicker .react-datepicker {
    font-family: inherit;
    border-radius: 0.5rem;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .custom-datepicker .react-datepicker__header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    padding-top: 12px;
  }
  
  .custom-datepicker .react-datepicker__day--selected {
    background-color: #3b82f6;
    border-radius: 50%;
  }
  
  .custom-datepicker .react-datepicker__day:hover {
    background-color: #dbeafe;
    border-radius: 50%;
  }
  
  .custom-datepicker .react-datepicker__day--keyboard-selected {
    background-color: #bfdbfe;
    border-radius: 50%;
  }
  
  .custom-datepicker .react-datepicker__day--highlighted {
    background-color: #dbeafe;
    border-radius: 50%;
  }
  
  /* Button styles */
  .btn {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  
  .btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }
  
  .btn:hover::after {
    transform: rotate(45deg) translateX(100%);
  }
  
  /* Info card */
  .info-card {
    border-left: 4px solid #3b82f6;
    background-color: #eff6ff;
  }
`

const AvailabilityManagement = () => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingSlots, setSavingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAcceptingAppointments, setIsAcceptingAppointments] = useState(true)
  const [timeSlots, setTimeSlots] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [repeatFor, setRepeatFor] = useState(4)
  const [workingHours, setWorkingHours] = useState({
    start: "09:00",
    end: "17:00",
  })
  const [contentLoaded, setContentLoaded] = useState(false)

  // Generate slots based on working hours
  const generateTimeSlots = (start, end) => {
    const startHour = Number.parseInt(start.split(":")[0])
    const startMinute = Number.parseInt(start.split(":")[1])
    const endHour = Number.parseInt(end.split(":")[0])
    const endMinute = Number.parseInt(end.split(":")[1])

    const slots = []
    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      // Format current time
      const formattedHour = currentHour.toString().padStart(2, "0")
      const formattedMinute = currentMinute.toString().padStart(2, "0")
      const startTime = `${formattedHour}:${formattedMinute}`

      // Calculate end time (30 min later)
      let endTimeHour = currentHour
      let endTimeMinute = currentMinute + 30

      if (endTimeMinute >= 60) {
        endTimeHour += 1
        endTimeMinute -= 60
      }

      const formattedEndHour = endTimeHour.toString().padStart(2, "0")
      const formattedEndMinute = endTimeMinute.toString().padStart(2, "0")
      const endTime = `${formattedEndHour}:${formattedEndMinute}`

      // Only add slot if it's within working hours
      if (endTimeHour < endHour || (endTimeHour === endHour && endTimeMinute <= endMinute)) {
        slots.push({
          id: `slot-${formattedHour}${formattedMinute}`,
          start: startTime,
          end: endTime,
          selected: false,
          booked: false,
        })
      }

      // Move to next slot
      currentMinute += 30
      if (currentMinute >= 60) {
        currentHour += 1
        currentMinute -= 60
      }
    }

    return slots
  }

  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      try {
        setLoading(true)
        const profileResponse = await api.doctors.getProfile()
        setIsAcceptingAppointments(profileResponse.data.data.isAcceptingAppointments !== false)

        // Get saved working hours if available
        if (profileResponse.data.data.workingHours) {
          setWorkingHours(profileResponse.data.data.workingHours)
        }

        const availabilityResponse = await api.doctors.getAvailableDates()
        setAvailableDates(availabilityResponse.data.dates || [])

        fetchTimeSlotsForDate(selectedDate)
      } catch (error) {
        toast.error("Could not load availability settings")
      } finally {
        setLoading(false)
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true)
        }, 300)
      }
    }

    fetchDoctorAvailability()
  }, [])

  const fetchTimeSlotsForDate = async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0]
      const response = await api.doctors.getTimeSlots(formattedDate)

      const fetchedSlots = response.data.slots || []

      // Generate slots based on working hours
      const generatedSlots = generateTimeSlots(workingHours.start, workingHours.end)

      // Mark slots as selected/booked if they exist in fetchedSlots
      const transformedSlots = generatedSlots.map((slot) => ({
        ...slot,
        selected: fetchedSlots.some((fs) => fs.start === slot.start && fs.end === slot.end),
        booked: fetchedSlots.some((fs) => fs.start === slot.start && fs.end === slot.end && fs.booked),
      }))

      setTimeSlots(transformedSlots)
    } catch (error) {
      // If error, just show empty slots based on working hours
      const initialSlots = generateTimeSlots(workingHours.start, workingHours.end)
      setTimeSlots(initialSlots)
    }
  }

  const handleDateChange = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      toast.error("You can only set availability for current or future dates")
      return
    }

    setSelectedDate(date)
    fetchTimeSlotsForDate(date)
  }

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target
    setWorkingHours((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyWorkingHours = () => {
    // Validate working hours
    const start = workingHours.start.split(":").map(Number)
    const end = workingHours.end.split(":").map(Number)

    if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
      toast.error("End time must be after start time")
      return
    }

    // Generate new slots based on working hours
    const newSlots = generateTimeSlots(workingHours.start, workingHours.end)

    // Preserve booking status from existing slots
    const updatedSlots = newSlots.map((slot) => {
      const existingSlot = timeSlots.find((s) => s.start === slot.start && s.end === slot.end)
      return {
        ...slot,
        booked: existingSlot?.booked || false,
        selected: existingSlot?.selected || false,
      }
    })

    setTimeSlots(updatedSlots)
    toast.success("Working hours updated")

    // Save working hours to doctor profile
    api.doctors.updateProfile({ workingHours }).catch((err) => {
      console.error("Failed to save working hours", err)
    })
  }

  const handleSlotToggle = (slotId) => {
    const slot = timeSlots.find((s) => s.id === slotId)
    if (slot && slot.booked) {
      toast.warning("Cannot modify booked slots. Cancel the appointment first.")
      return
    }

    setTimeSlots(timeSlots.map((slot) => (slot.id === slotId ? { ...slot, selected: !slot.selected } : slot)))
  }

  const selectAllSlots = () => {
    setTimeSlots(
      timeSlots.map((slot) => ({
        ...slot,
        selected: !slot.booked,
      })),
    )
  }

  const clearAllSlots = () => {
    setTimeSlots(
      timeSlots.map((slot) => ({
        ...slot,
        selected: slot.booked ? true : false, // Keep booked slots selected
      })),
    )
  }

  const handleSaveAvailability = async () => {
    try {
      setSavingSlots(true)
      const formattedDate = selectedDate.toISOString().split("T")[0]
      const selectedSlots = timeSlots
        .filter((slot) => slot.selected || slot.booked)
        .map((slot) => ({
          start: slot.start,
          end: slot.end,
          booked: slot.booked || false,
        }))

      if (repeatWeekly && repeatFor > 0) {
        await api.doctors.saveRecurringTimeSlots(formattedDate, selectedSlots, repeatFor)
        toast.success(`Availability saved for ${repeatFor} weeks`)

        const newAvailableDates = [...availableDates]
        for (let i = 0; i < repeatFor; i++) {
          const futureDate = new Date(selectedDate)
          futureDate.setDate(futureDate.getDate() + i * 7)
          const futureDateStr = futureDate.toISOString().split("T")[0]
          if (!newAvailableDates.includes(futureDateStr)) {
            newAvailableDates.push(futureDateStr)
          }
        }
        setAvailableDates(newAvailableDates)
      } else {
        await api.doctors.saveTimeSlots(formattedDate, selectedSlots)
        toast.success("Availability saved successfully")

        if (!availableDates.includes(formattedDate)) {
          setAvailableDates([...availableDates, formattedDate])
        }
      }
    } catch (error) {
      toast.error("Failed to save availability settings")
    } finally {
      setSavingSlots(false)
    }
  }

  const deleteAvailability = async () => {
    try {
      setSavingSlots(true)
      const formattedDate = selectedDate.toISOString().split("T")[0]
      await api.doctors.deleteAvailability(formattedDate)
      setTimeSlots(timeSlots.map((slot) => ({ ...slot, selected: false })))
      setAvailableDates(availableDates.filter((d) => d !== formattedDate))
      toast.success("Availability removed")
    } catch (error) {
      toast.error("Failed to remove availability")
    } finally {
      setSavingSlots(false)
    }
  }

  const toggleAvailabilityStatus = async () => {
    try {
      setSavingStatus(true)
      const newStatus = !isAcceptingAppointments
      await api.doctors.updateAvailabilityStatus(newStatus)
      setIsAcceptingAppointments(newStatus)
      toast.success(newStatus ? "Now accepting appointments" : "Marked as on leave")
    } catch (error) {
      toast.error("Failed to update status")
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pattern">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-pattern min-h-screen pb-12">
      {/* Add custom styles */}
      <style>{customStyles}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <h1 className="text-3xl font-bold text-gradient">Manage Availability</h1>
        </div>

        {/* Availability Toggle */}
        <div className={`glass-card rounded-xl p-6 mb-6 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-800">Appointment Status</h2>
              <p className="text-gray-600 mt-1">Toggle to mark your overall availability for appointments</p>
            </div>
            <div className="flex items-center">
              {savingStatus ? (
                <div className="mr-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="flex items-center">
                  <span className={`mr-3 font-medium ${isAcceptingAppointments ? "text-green-600" : "text-amber-600"}`}>
                    {isAcceptingAppointments ? "Accepting Appointments" : "On Leave"}
                  </span>
                  <Switch enabled={isAcceptingAppointments} onChange={toggleAvailabilityStatus} />
                </div>
              )}
            </div>
          </div>

          {!isAcceptingAppointments && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-amber-700 font-medium">You are currently on leave</p>
                  <p className="text-amber-600 mt-1">
                    Patients cannot book new appointments with you until you change your status back to "Accepting
                    Appointments".
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Working Hours Selector */}
        <div className={`glass-card rounded-xl p-6 mb-6 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Set Working Hours</h2>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                name="start"
                value={workingHours.start}
                onChange={handleWorkingHoursChange}
                className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                name="end"
                value={workingHours.end}
                onChange={handleWorkingHoursChange}
                className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-2 md:mb-0">
              <button
                onClick={applyWorkingHours}
                className="btn gradient-primary text-white py-2.5 px-5 rounded-lg font-medium hover-lift"
              >
                Apply Hours
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Set your standard working hours. Time slots will be created in 30-minute increments within these hours.
          </p>
        </div>

        {/* Info Card */}
        <div className={`info-card rounded-xl p-5 mb-6 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-800">Setting Future Availability</h3>
              <p className="text-blue-700 mt-1">
                Make sure to set your availability for future dates to allow patients to book appointments in advance.
                Use the repeat weekly option to quickly set your schedule for multiple weeks.
              </p>
            </div>
          </div>
        </div>

        {/* Calendar and Time Slots */}
        <div className={`glass-card rounded-xl p-6 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:border-r pr-0 lg:pr-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Date</h2>

              <div className="custom-datepicker">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  inline
                  dayClassName={(date) => {
                    return availableDates.includes(date.toISOString().split("T")[0])
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : undefined
                  }}
                />
              </div>

              <div className="mt-4 flex items-center text-sm">
                <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
                <span className="text-gray-700">Has availability set</span>
              </div>

              {/* Recurring settings */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">Recurring Schedule</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="repeat-weekly"
                    checked={repeatWeekly}
                    onChange={() => setRepeatWeekly(!repeatWeekly)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="repeat-weekly" className="ml-2 text-gray-700">
                    Repeat weekly for
                  </label>
                  <select
                    disabled={!repeatWeekly}
                    value={repeatFor}
                    onChange={(e) => setRepeatFor(Number(e.target.value))}
                    className={`ml-2 text-sm w-16 rounded border ${repeatWeekly ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"} p-1`}
                  >
                    {[1, 2, 4, 8, 12].map((weeks) => (
                      <option key={weeks} value={weeks}>
                        {weeks}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-700 ml-1">weeks</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This will copy your selected time slots to the same day of the week for the specified number of weeks.
                </p>
              </div>
            </div>

            {/* Time slots */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAllSlots}
                    className="btn px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSlots}
                    className="btn px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleSaveAvailability}
                    disabled={savingSlots}
                    className="btn gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover-lift"
                  >
                    {savingSlots ? "Saving..." : "Save Availability"}
                  </button>
                  {availableDates.includes(selectedDate.toISOString().split("T")[0]) && (
                    <button
                      onClick={deleteAvailability}
                      disabled={savingSlots}
                      className="btn gradient-danger text-white px-4 py-2 rounded-lg text-sm font-medium hover-lift"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Time slot legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-1"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded mr-1"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-1 relative">
                    <div className="absolute top-0 right-0 w-0 h-0 border-style: solid; border-width: 0 4px 4px 0; border-color: transparent #ef4444 transparent transparent;"></div>
                  </div>
                  <span>Booked</span>
                </div>
              </div>

              {/* Time slot grid */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotToggle(slot.id)}
                        disabled={slot.booked}
                        className={`
                          time-slot px-2 py-3 text-sm rounded-md text-center 
                          ${
                            slot.booked
                              ? "bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed time-slot-booked"
                              : slot.selected
                                ? "bg-blue-50 border border-blue-200 text-blue-700 time-slot-selected"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        {slot.start.substring(0, 5)}
                        {slot.booked && <div className="text-xs mt-1 text-gray-500">Booked</div>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">No time slots available</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your working hours</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 text-sm text-gray-600">
                <p>• Click on a time slot to mark it as available for appointments</p>
                <p>• Booked slots cannot be modified (cancel the appointment first)</p>
                <p>• Don't forget to save your changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityManagement

