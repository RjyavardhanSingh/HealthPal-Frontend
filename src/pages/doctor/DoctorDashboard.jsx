"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import NotificationPrompt from "../../components/notifications/NotificationPrompt"
import { toast } from "react-toastify"

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
  .stagger-5 { animation-delay: 0.5s; }
  
  /* Custom UI elements */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .gradient-border {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .gradient-border::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(45deg, #3b82f6, #10b981, #8b5cf6);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
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
  
  .gradient-info {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  }
  
  .gradient-purple {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }
  
  /* Custom text styles */
  .text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
  }
  
  /* Dashboard grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 3fr 2fr;
    }
  }
  
  /* Status indicators */
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
  }
  
  .status-confirmed {
    background-color: #10b981;
  }
  
  .status-pending {
    background-color: #f59e0b;
  }
  
  .status-cancelled {
    background-color: #ef4444;
  }
  
  /* Appointment card */
  .appointment-card {
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
  }
  
  .appointment-card:hover {
    border-left-color: #3b82f6;
  }
  
  /* Patient card */
  .patient-card {
    transition: all 0.3s ease;
  }
  
  .patient-card:hover {
    background-color: #f8fafc;
    transform: translateY(-3px);
  }
  
  /* Stats card */
  .stats-card {
    position: relative;
    overflow: hidden;
  }
  
  .stats-card::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`

const DoctorDashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentPatients, setRecentPatients] = useState([])
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        if (!currentUser?._id) {
          console.error("No user ID available from any source")
          return
        }

        // Fetch upcoming appointments - don't pass doctorId as server uses authenticated user
        const appointmentsResponse = await api.appointments.getAll({
          status: "scheduled",
        })

        if (appointmentsResponse?.data?.data) {
          // Sort appointments by date and time
          const sortedAppointments = appointmentsResponse.data.data.sort((a, b) => {
            const dateA = new Date(a.date + "T" + a.time.start)
            const dateB = new Date(b.date + "T" + b.time.start)
            return dateA - dateB
          })
          setUpcomingAppointments(sortedAppointments)

          // Calculate stats
          const today = new Date().toISOString().split("T")[0]
          const todayAppointments = sortedAppointments.filter((app) => app.date === today).length

          // Get appointments for this week
          const now = new Date()
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)

          const endOfWeek = new Date(now)
          endOfWeek.setDate(now.getDate() + (6 - now.getDay()))
          endOfWeek.setHours(23, 59, 59, 999)

          const weekAppointments = sortedAppointments.filter((app) => {
            const appDate = new Date(app.date)
            return appDate >= startOfWeek && appDate <= endOfWeek
          }).length

          setStats((prev) => ({
            ...prev,
            todayAppointments,
            weekAppointments,
          }))
        }

        // Fetch recent patients
        const patientsResponse = await api.doctors.getRecentPatients()
        if (patientsResponse?.data?.data) {
          setRecentPatients(patientsResponse.data.data)
          setStats((prev) => ({
            ...prev,
            totalPatients: patientsResponse.data.data.length,
          }))
        }
      } catch (error) {
        console.error("Error fetching doctor dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true)
        }, 300)
      }
    }

    fetchDashboardData()
  }, [currentUser])

  useEffect(() => {
    const permissionRequested = localStorage.getItem("notificationPermissionRequested") === "true"
    setNotificationPermissionRequested(permissionRequested)
  }, [])

  const handlePermissionChange = (granted) => {
    setNotificationPermissionRequested(true)
    localStorage.setItem("notificationPermissionRequested", "true")
  }

  const formatAppointmentTime = (date, timeStart) => {
    if (!date || !timeStart) return "N/A";
    
    try {
      // Make sure we have a valid date and time format
      if (typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return timeStart;
      }
      
      // Use a more reliable way to create the date object
      const [hours, minutes] = timeStart.split(':');
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      // Check if the date is valid
      if (isNaN(appointmentDate.getTime())) {
        return timeStart;
      }
      
      return appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      console.log("Error formatting time:", error);
      return timeStart || "N/A";
    }
  };
  
  const formatAppointmentDate = (date) => {
    if (!date) return "N/A";
    
    try {
      // For date strings, ensure proper format
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        const appointmentDate = new Date(year, month - 1, day); // month is 0-indexed in JS
        
        if (isNaN(appointmentDate.getTime())) {
          return date;
        }
        
        return appointmentDate.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric"
        });
      }
      
      // For date objects
      const appointmentDate = new Date(date);
      if (isNaN(appointmentDate.getTime())) {
        return date;
      }
      
      return appointmentDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      console.log("Error formatting date:", error);
      return date;
    }
  };
  
  const getTimeFromNow = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "recently";
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "today";
      } else if (diffDays === 1) {
        return "yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      } else {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric"
        });
      }
    } catch (error) {
      console.log("Error calculating time from now:", error);
      return "recently";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed"
      case "cancelled":
        return "status-cancelled"
      default:
        return "status-pending"
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

      {/* Notification Prompt */}
      {!notificationPermissionRequested && (
        <div className="animate-slide-up">
          <NotificationPrompt onPermissionChange={handlePermissionChange} />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">Doctor Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Dr. {currentUser?.name?.split(" ")[0] || "User"}</p>
          </div>
          
          {/* Removed "+ New Appointment" button */}
        </div>

        {/* Stats Overview */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}
        >
          <div className="glass-card rounded-xl p-4 stats-card gradient-primary text-white">
            <div className="text-3xl font-bold">{stats.todayAppointments}</div>
            <div className="text-sm mt-1">Today's Appointments</div>
          </div>

          <div className="glass-card rounded-xl p-4 stats-card gradient-info text-white">
            <div className="text-3xl font-bold">{stats.weekAppointments}</div>
            <div className="text-sm mt-1">This Week</div>
          </div>

          <div className="glass-card rounded-xl p-4 stats-card gradient-success text-white">
            <div className="text-3xl font-bold">{stats.totalPatients}</div>
            <div className="text-sm mt-1">Total Patients</div>
          </div>

          <div className="glass-card rounded-xl p-4 stats-card gradient-warning text-white">
            <div className="text-3xl font-bold">{stats.pendingReports || 0}</div>
            <div className="text-sm mt-1">Pending Reports</div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column - Appointments */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className={`glass-card rounded-2xl p-6 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-4 custom-scrollbar max-h-[600px] overflow-y-auto pr-1">
                  {upcomingAppointments.slice(0, 8).map((appointment, index) => (
                    <div
                      key={appointment._id}
                      className="appointment-card bg-white rounded-xl p-4 shadow-sm hover-lift cursor-pointer"
                      onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          {appointment.patient?.profileImage ? (
                            <img
                              src={appointment.patient.profileImage || "/placeholder.svg"}
                              alt={appointment.patient?.name}
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-medium">
                                {appointment.patient?.name?.charAt(0) || "P"}
                              </span>
                            </div>
                          )}

                          <div>
                            <h3 className="font-medium text-lg">{appointment.patient?.name || "Unknown Patient"}</h3>
                            <div className="flex items-center mt-1">
                              <span className={`status-indicator ${getStatusClass(appointment.status)}`}></span>
                              <span className="text-sm text-gray-600">{appointment.type || "Consultation"}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {appointment.reason || "No reason provided"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {formatAppointmentDate(appointment.date)}
                          </div>
                          <p className="text-sm font-medium mt-2">
                            {formatAppointmentTime(appointment.date, appointment.time?.start)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="text-gray-500 mt-2 mb-4">You don't have any scheduled appointments.</p>
                  <button
                    onClick={() => navigate("/doctor/appointments/new")}
                    className="gradient-primary text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Patients & Quick Actions */}
          <div className="space-y-8">
            {/* Recent Patients */}
            <div className={`glass-card rounded-2xl p-6 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
                <button
                  onClick={() => navigate("/doctor/patients")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {recentPatients && recentPatients.length > 0 ? (
                <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto pr-1">
                  {recentPatients.slice(0, 6).map((patient, index) => (
                    <div
                      key={patient._id}
                      className="patient-card bg-white rounded-xl p-4 shadow-sm cursor-pointer"
                      onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                    >
                      <div className="flex items-center">
                        {patient.profileImage ? (
                          <img
                            src={patient.profileImage || "/placeholder.svg"}
                            alt={patient.name}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <span className="text-purple-600 font-medium">{patient.name?.charAt(0) || "P"}</span>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{patient.name}</h3>
                            <span className="text-xs text-gray-500">{getTimeFromNow(patient.lastVisit)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600">
                              {patient.age ? `${patient.age} years` : ""}
                              {patient.gender ? ` • ${patient.gender}` : ""}
                            </p>
                            <button
                              className="text-xs text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/doctor/medical-records/${patient._id}`)
                              }}
                            >
                              View Records
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">No recent patients</h3>
                  <p className="text-gray-500 mt-2">You haven't seen any patients recently.</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`glass-card rounded-2xl p-6 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
              <h2 className="text-xl font-bold text-gray-800 mb-5">Quick Actions</h2>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate("/doctor/patients")}
                  className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Manage Patients</h3>
                    <p className="text-sm text-gray-500">View and manage your patients</p>
                  </div>
                </button>

                {/* Changed to appointments since medical records route doesn't exist */}
                <button
                  onClick={() => navigate("/doctor/appointments")}
                  className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Appointments</h3>
                    <p className="text-sm text-gray-500">View patient appointments</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/doctor/appointments")} 
                  className="flex items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <div className="p-3 bg-amber-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Consultations</h3>
                    <p className="text-sm text-gray-500">Manage patient consultations</p>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate("/doctor/availability")}
                  className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Manage Availability</h3>
                    <p className="text-sm text-gray-500">Set your working hours</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Calendar Preview */}
            <div className={`glass-card rounded-2xl p-6 ${contentLoaded ? "animate-slide-up stagger-5" : "opacity-0"}`}>
              <h2 className="text-xl font-bold text-gray-800 mb-5">Today's Schedule</h2>

              {upcomingAppointments.filter((app) => app.date === new Date().toISOString().split("T")[0]).length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments
                    .filter((app) => app.date === new Date().toISOString().split("T")[0])
                    .map((appointment, index) => (
                      <div
                        key={appointment._id}
                        className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
                      >
                        <div className="w-16 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.time?.start ? appointment.time.start.substring(0, 5) : "N/A"}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium">{appointment.patient?.name || "Unknown Patient"}</p>
                          <p className="text-xs text-gray-500">{appointment.type || "Consultation"}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusClass(appointment.status)}`}></div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/doctor/availability")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard

