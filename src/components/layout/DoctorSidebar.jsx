"use client"

import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// Custom CSS for the redesigned UI
const customStyles = `
  /* Base animations */
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Animation classes */
  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  /* Staggered animations */
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.15s; }
  .stagger-3 { animation-delay: 0.2s; }
  .stagger-4 { animation-delay: 0.25s; }
  .stagger-5 { animation-delay: 0.3s; }
  .stagger-6 { animation-delay: 0.35s; }
  .stagger-7 { animation-delay: 0.4s; }
  .stagger-8 { animation-delay: 0.45s; }
  
  /* Custom UI elements */
  .sidebar-gradient {
    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%);
  }
  
  .nav-item {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  
  .nav-item:hover {
    transform: translateX(3px);
  }
  
  .nav-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
    transition: width 0.3s ease;
  }
  
  .nav-item:hover::after {
    width: 30%;
  }
  
  .nav-item-active {
    position: relative;
    font-weight: 500;
  }
  
  .nav-item-active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 0 4px 4px 0;
  }
  
  .profile-container {
    position: relative;
    overflow: hidden;
  }
  
  .profile-container::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(59, 130, 246, 0.3) 0%, 
      rgba(59, 130, 246, 0.7) 50%, 
      rgba(59, 130, 246, 0.3) 100%);
  }
  
  .avatar-gradient {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  
  .logout-btn {
    transition: all 0.2s ease;
  }
  
  .logout-btn:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
  
  .logout-btn:hover svg {
    color: #dc2626;
  }
`

const DoctorSidebar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isAnimated, setIsAnimated] = useState(false)

  // Trigger animations after component mounts
  React.useEffect(() => {
    setTimeout(() => {
      setIsAnimated(true)
    }, 100)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <div className="h-full flex flex-col sidebar-gradient border-r shadow-sm">
      {/* Add custom styles */}
      <style>{customStyles}</style>

      {/* Doctor profile summary */}
      <div className={`p-5 profile-container ${isAnimated ? "animate-fade-in" : "opacity-0"}`}>
        <div className="flex items-center">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL || "/placeholder.svg"}
              alt="Profile"
              className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full avatar-gradient flex items-center justify-center mr-3 shadow-md text-white border-2 border-white">
              <span className="text-lg font-medium">{currentUser?.displayName?.charAt(0) || "D"}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">Dr. {currentUser?.displayName}</p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <NavLink
            to="/doctor/dashboard"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-1" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-2" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>Patients</span>
          </NavLink>

          <NavLink
            to="/doctor/appointments"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-3" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Appointments</span>
          </NavLink>

          <NavLink
            to="/doctor/availability"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-4" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Time Slots</span>
          </NavLink>

          <NavLink
            to="/doctor/prescriptions"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-5" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span>Prescriptions</span>
          </NavLink>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-1">
          <NavLink
            to="/doctor/profile"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-6" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/doctor/settings"
            className={({ isActive }) => `
              nav-item flex items-center px-4 py-2.5 rounded-lg mb-1 
              ${isAnimated ? "animate-slide-in stagger-7" : "opacity-0"}
              ${isActive ? "bg-blue-50 text-blue-700 nav-item-active" : "text-gray-700 hover:bg-gray-50"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-2.5 rounded-lg text-gray-700 logout-btn
              ${isAnimated ? "animate-slide-in stagger-8" : "opacity-0"}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 11-2 0 1 1 0 012 0zm-8.707 3.293a1 1 0 111.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 11-1.414-1.414L7.586 11H4a1 1 0 110-2h3.586L5.293 6.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorSidebar

