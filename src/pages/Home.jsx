"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { auth } from "../config/firebase"
import api from "../services/api"
import { fetchNYTimesArticles, mockHealthArticles } from "../utils/externalApi"
import NotificationPrompt from "../components/notifications/NotificationPrompt"

// SVG icons as components
const calendarIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

// Add missing medication icon
const medicationIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
)

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
  .stagger-6 { animation-delay: 0.6s; }
  
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
  
  /* Layout styles */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 2fr 1fr;
    }
  }
  
  /* Custom button styles */
  .btn-glow {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .btn-glow::after {
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
  
  .btn-glow:hover::after {
    transform: rotate(45deg) translateX(100%);
  }
`

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, userToken, currentUser, isLoading, refreshToken } = useAuth()

  const [userData, setUserData] = useState(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentDoctors, setRecentDoctors] = useState([])
  const [medicalReminders, setMedicalReminders] = useState([])
  const [healthArticles, setHealthArticles] = useState([])

  const [loading, setLoading] = useState(true)
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState(null)

  const [healthTip, setHealthTip] = useState({
    title: "Stay Hydrated",
    content:
      "Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly.",
  })

  // Animation states
  const [contentLoaded, setContentLoaded] = useState(false)

  // Add state to track if notification permissions have been requested
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false)

  // Add authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pattern">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    console.log("User not authenticated, redirecting to login")
    return <Navigate to="/login" />
  }

  // Debugging auth status
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Current auth status:")
      console.log("- User token available:", userToken ? "Yes" : "No")
      if (userToken) {
        console.log("- Token preview:", userToken.substring(0, 10) + "...")
      }
      console.log("- Current user:", auth.currentUser?.email || "None")
      console.log("- LocalStorage token:", localStorage.getItem("authToken") ? "Present" : "None")
    }

    checkAuth()
  }, [userToken])

  // Fetch user data, appointments, doctors, reminders
  useEffect(() => {
    let isMounted = true // Add a flag to track component mount status

    const fetchData = async () => {
      try {
        setLoading(true)

        // Make sure token is set properly before any requests
        const token = localStorage.getItem("authToken")
        if (token) {
          api.setAuthToken(token)
        }

        // Get the authenticated user's MongoDB ID
        const userResponse = await api.auth.getMe()

        if (userResponse?.data?.data?._id) {
          const patientId = userResponse.data.data._id
          console.log("Using patient MongoDB ID:", patientId)

          // Process user profile data
          if (isMounted) {
            setUserData({
              name: userResponse.data.data.name || currentUser?.displayName || "User",
              email: userResponse.data.data.email || currentUser?.email || "user@example.com",
              profileImage: userResponse.data.data.profileImage,
            })
          }

          // Fetch appointments with proper patient ID and status filter
          const appointmentsResponse = await api.appointments.getAll({
            status: "scheduled",
            patientId: patientId,
          })

          console.log("Appointments response:", appointmentsResponse)

          if (appointmentsResponse?.data?.data) {
            const allAppointments = appointmentsResponse.data.data

            // Filter for only future appointments
            const now = new Date()
            const futureAppointments = allAppointments
              .filter((appointment) => {
                const appointmentDate = new Date(appointment.date)
                return appointmentDate >= now
              })
              .sort((a, b) => {
                // Sort by date, earliest first
                return new Date(a.date) - new Date(b.date)
              })

            console.log(`Found ${futureAppointments.length} upcoming appointments`)
            if (isMounted) {
              setUpcomingAppointments(futureAppointments.slice(0, 3)) // Show 3 most recent
            }
          }

          // Fetch medication reminders
          try {
            const medicationResponse = await api.medications.getReminders()
            console.log("Medication reminders response:", medicationResponse)

            if (medicationResponse?.data?.data) {
              if (isMounted) {
                setMedicalReminders(medicationResponse.data.data)
              }
            }
          } catch (medicationError) {
            console.error("Error fetching medication reminders:", medicationError)
            if (isMounted) {
              setMedicalReminders([])
            }
          }
        } else {
          console.error("Could not retrieve user MongoDB ID")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
          // Trigger animations after data is loaded
          setTimeout(() => {
            setContentLoaded(true)
          }, 300)
        }
      }
    }

    if (currentUser && userToken) {
      fetchData()
    }

    return () => {
      isMounted = false // Set the flag to false when the component unmounts
    }
  }, [currentUser, userToken])

  // Fetch health articles
  useEffect(() => {
    let isMounted = true

    const fetchHealthArticles = async () => {
      try {
        setArticlesLoading(true)
        setArticlesError(null)

        // Get API key
        const nytKey = import.meta.env.VITE_NYT_API_KEY

        if (!nytKey) {
          console.log("No NYT API key found, using mock data")
          if (isMounted) {
            setHealthArticles(mockHealthArticles)
          }
          return
        }

        try {
          // Use the utility function
          const articles = await fetchNYTimesArticles(nytKey)
          if (isMounted) {
            setHealthArticles(articles.slice(0, 3))
          }
        } catch (apiError) {
          console.error("Error fetching health articles:", apiError)
          if (isMounted) {
            setArticlesError("Unable to load latest health articles. Displaying sample content.")
            setHealthArticles(mockHealthArticles)
          }
        }
      } catch (error) {
        console.error("Error in fetchHealthArticles:", error)
        if (isMounted) {
          setArticlesError("Failed to load health articles. Please try again later.")
          setHealthArticles(mockHealthArticles)
        }
      } finally {
        if (isMounted) {
          setArticlesLoading(false)
        }
      }
    }

    fetchHealthArticles()

    return () => {
      isMounted = false
    }
  }, [])

  // Ensure we have fallback data for health articles
  useEffect(() => {
    let isMounted = true

    const fetchHealthArticles = async () => {
      try {
        setArticlesLoading(true)
        const response = await fetch(
          `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=health+medicine+wellness&fq=section_name:("Health")&api-key=pBkZ8LFmZkRgzl1oTp9aPntl0lUhuo2d`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === "OK" && data.response && data.response.docs) {
          const articles = data.response.docs.map((article) => ({
            id: article._id,
            title: article.headline.main,
            abstract: article.abstract,
            url: article.web_url,
            publishDate: article.pub_date,
            category: article.news_desk || "Health",
            image:
              article.multimedia && article.multimedia.length > 0
                ? `https://www.nytimes.com/${article.multimedia.find((m) => m.subtype === "xlarge")?.url || article.multimedia[0].url}`
                : "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          }))

          if (isMounted) {
            setHealthArticles(articles.slice(0, 4))
          }
        }
      } catch (error) {
        console.error("Error fetching health articles:", error)
        // Add fallback articles
        const fallbackArticles = [
          {
            id: "fallback-1",
            title: "The Importance of Regular Exercise",
            abstract:
              "Regular physical activity can improve your muscle strength and boost your endurance. Exercise delivers oxygen and nutrients to your tissues and helps your cardiovascular system work more efficiently.",
            url: "https://www.health.harvard.edu/topics/exercise-and-fitness",
            publishDate: new Date().toISOString(),
            category: "Health & Fitness",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          },
          {
            id: "fallback-2",
            title: "Nutrition Basics: Understanding Macros and Micros",
            abstract:
              "Learn about the essential nutrients your body needs and how to ensure you're getting enough of each through your diet.",
            url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/basics/nutrition-basics/hlv-20049477",
            publishDate: new Date().toISOString(),
            category: "Nutrition",
            image:
              "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          },
          {
            id: "fallback-3",
            title: "Mental Health: Self-Care Practices for Daily Life",
            abstract:
              "Incorporating simple self-care practices into your daily routine can significantly improve your mental wellbeing.",
            url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
            publishDate: new Date().toISOString(),
            category: "Mental Health",
            image:
              "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          },
          {
            id: "fallback-4",
            title: "Sleep Hygiene: Tips for Better Rest",
            abstract:
              "Quality sleep is essential for overall health. Learn proven techniques to improve your sleep habits.",
            url: "https://www.sleepfoundation.org/sleep-hygiene",
            publishDate: new Date().toISOString(),
            category: "Wellness",
            image:
              "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          },
        ]
        if (isMounted) {
          setHealthArticles(fallbackArticles)
          setArticlesError(null) // Clear error to show fallback content instead of error message
        }
      } finally {
        if (isMounted) {
          setArticlesLoading(false)
        }
      }
    }

    fetchHealthArticles()

    return () => {
      isMounted = false
    }
  }, [])

  // Ensure we have health tips (even if API fails)
  useEffect(() => {
    let isMounted = true

    // Add some variety to health tips
    const healthTips = [
      {
        title: "Stay Hydrated",
        content:
          "Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly.",
      },
      {
        title: "Get Enough Sleep",
        content:
          "Adults need 7-9 hours of quality sleep each night. Sleep helps maintain your immune system, reduces stress, improves mood, and is essential for memory consolidation and learning.",
      },
      {
        title: "Eat More Plants",
        content:
          "Plant-based foods are rich in vitamins, minerals, fiber and antioxidants. Try to fill half your plate with fruits and vegetables at each meal.",
      },
      {
        title: "Practice Mindfulness",
        content:
          "Taking just a few minutes each day to practice mindfulness meditation can reduce stress, anxiety, and depression while improving focus and emotional regulation.",
      },
    ]

    // Set a random health tip
    if (isMounted) {
      setHealthTip(healthTips[Math.floor(Math.random() * healthTips.length)])
    }

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Test navigation access
    const checkRouteAccess = async () => {
      try {
        // Instead of using non-existent getUpcoming, use getAll with parameters
        await api.appointments.getAll({ status: "scheduled", limit: 1 })
        return true
      } catch (error) {
        console.error("Error testing API endpoints:", error)
        return false
      }
    }

    // Only run this in development
    if (process.env.NODE_ENV !== "production") {
      checkRouteAccess()
    }
  }, [])

  // Add this function to your component before the return statement
  const getNextDoseTime = (reminder) => {
    if (!reminder?.time) {
      return null // Handle missing time data
    }

    try {
      const now = new Date()

      // Parse time string with better error handling
      const [hours, minutes] = (reminder.time || "08:00").split(":").map(Number)

      // Create next dose time
      const nextDose = new Date()
      nextDose.setHours(hours || 0, minutes || 0, 0, 0)

      // If time already passed today, set to tomorrow
      if (nextDose < now) {
        nextDose.setDate(nextDose.getDate() + 1)
      }

      return nextDose
    } catch (err) {
      console.error("Error calculating next dose time:", err)
      return null
    }
  }

  // Add this function to handle permission changes
  const handlePermissionChange = (granted) => {
    setNotificationPermissionRequested(true)
    localStorage.setItem("notificationPermissionRequested", "true")
  }

  // Add this useEffect to check if permissions have been requested before
  useEffect(() => {
    const permissionRequested = localStorage.getItem("notificationPermissionRequested") === "true"
    setNotificationPermissionRequested(permissionRequested)
  }, [])

  // Format date for appointments
  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for appointments
  const formatAppointmentTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    if (auth.currentUser && currentUser?.role === 'admin') {
      navigate('/admin/doctor-verification');
    }
  }, [currentUser, navigate]);

  // Note: We're not wrapping in MainLayout, as that's done in App.jsx
  return (
    <div className="min-h-screen pb-12">
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
        {/* Top Bar with Profile */}
        <div className={`flex justify-between items-center mb-8 ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Your Health Dashboard</h1>
            <p className="text-blue-600 mt-1">Personalized care at your fingertips</p>
          </div>

          <Link to="/profile" className="flex items-center gap-3 hover:bg-blue-50 p-2 rounded-full transition-colors duration-300">
            {userData?.profileImage ? (
              <img
                src={userData.profileImage || "/placeholder.svg"}
                alt={userData.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-lg font-medium text-white">{userData?.name?.charAt(0) || "U"}</span>
              </div>
            )}
            <div className="hidden md:block">
              <p className="font-medium text-gray-800">{userData?.name || "User"}</p>
              <p className="text-sm text-blue-600">{userData?.email || "user@example.com"}</p>
            </div>
          </Link>
        </div>

        {/* Welcome Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl mb-8 ${contentLoaded ? "animate-slide-up stagger-1" : "opacity-0"}`}
        >
          <div className="gradient-primary text-white p-8 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">Hello, {userData?.name?.split(" ")[0] || "there"}!</h2>
                <p className="text-blue-100 text-lg mb-6">How are you feeling today?</p>

                <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
                  <button
                    onClick={() => navigate("/find-doctor")}
                    className="btn-glow bg-white bg-opacity-20 hover:bg-opacity-30 py-3 px-5 rounded-lg flex items-center text-white font-medium transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Find Doctor
                  </button>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="btn-glow bg-white bg-opacity-20 hover:bg-opacity-30 py-3 px-5 rounded-lg flex items-center text-white font-medium transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="hidden md:block animate-pulse-slow">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.96997 22H15.03C19.4 22 19.99 19.29 20.24 17.15L21.02 9.99C21.33 7.38 20.76 5 16 5H8C3.23997 5 2.66997 7.38 2.97997 9.99L3.75997 17.15C4.00997 19.29 4.59997 22 8.96997 22Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5V4.2C8 2.43 8 1 11.2 1H12.8C16 1 16 2.43 16 4.2V5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 14V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M14 12L12 14L10 12"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.65 11C19.34 12.68 16.7 13.68 14 14"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.62 11.27C4.87 12.81 7.41 13.74 10 14.23"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className={`glass-card rounded-2xl p-6 shadow-lg border border-blue-100 ${contentLoaded ? "animate-slide-up stagger-2" : "opacity-0"}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                <Link to="/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-24"></div>
                  ))}
                </div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={appointment._id} className="bg-white hover:bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md mb-2">
                            {formatAppointmentDate(appointment.date)}
                          </span>
                          <h3 className="font-medium text-gray-800 text-lg">{appointment.doctorName || "Dr. Unknown"}</h3>
                          <p className="text-blue-600 text-sm">{appointment.specialization || "General Checkup"}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 text-sm">{formatAppointmentTime(appointment.date)}</span>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                appointment.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appointment.status || "Scheduled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">{calendarIcon}</div>
                  <h3 className="text-lg font-medium mb-1">No appointments</h3>
                  <p className="text-gray-500 mb-4">You don't have any upcoming appointments.</p>
                  <Link
                    to="/find-doctor"
                    className="inline-block gradient-primary text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Book an Appointment
                  </Link>
                </div>
              )}
            </div>

            {/* Health Articles */}
            <div className={`glass-card rounded-2xl p-6 shadow-lg border border-blue-100 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Health Articles</h2>
                <a
                  href="https://www.nytimes.com/section/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  See All
                </a>
              </div>

              {articlesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="bg-gray-200 rounded-lg h-24 w-24 flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : articlesError ? (
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-700">{articlesError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {healthArticles.slice(0, 2).map((article, index) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover-lift"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={article.image || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md mb-2">
                            {article.category}
                          </span>
                          <h3 className="font-medium text-lg mb-1">{article.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2">{article.abstract}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Health Tips */}
            <div className={`glass-card rounded-2xl p-6 shadow-lg border border-blue-100 ${contentLoaded ? "animate-slide-up stagger-5" : "opacity-0"}`}>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full gradient-success flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Daily Health Tip</h2>
              </div>

              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-2">{healthTip.title}</h3>
                <p className="text-gray-700">{healthTip.content}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Medication Reminders */}
            <div className={`glass-card rounded-2xl p-6 shadow-lg border border-blue-100 ${contentLoaded ? "animate-slide-up stagger-3" : "opacity-0"}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Medication Reminders</h2>
                <Link to="/prescriptions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              ) : medicalReminders && medicalReminders.length > 0 ? (
                <div className="space-y-3 custom-scrollbar max-h-80 overflow-y-auto pr-1">
                  {medicalReminders.map((reminder, index) => (
                    <div
                      key={reminder._id}
                      className="bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all duration-300 hover-lift"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{reminder.medicineName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{reminder.dosage}</p>
                          <p className="text-xs text-gray-500 mt-1">{reminder.frequency.replace(/_/g, " ")}</p>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium">
                          {reminder.time
                            ? getNextDoseTime(reminder)?.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) || reminder.time
                            : "Not set"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-block p-3 bg-purple-50 rounded-full mb-4">{medicationIcon}</div>
                  <h3 className="text-lg font-medium mb-1">No medication reminders</h3>
                  <p className="text-gray-500 mb-4">You don't have any medication reminders set up.</p>
                  <Link
                    to="/prescriptions"
                    className="inline-block gradient-purple text-white py-2 px-4 rounded-lg font-medium"
                  >
                    View Prescriptions
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Access */}
            <div className={`glass-card rounded-2xl p-6 shadow-lg border border-blue-100 ${contentLoaded ? "animate-slide-up stagger-4" : "opacity-0"}`}>
              <h2 className="text-xl font-bold text-gray-800 mb-5">Quick Access</h2>

              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/medical-records"
                  className="block bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-blue-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">Medical Records</h3>
                      <p className="text-sm text-gray-500 mt-1">Access your health history</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/prescriptions"
                  className="block bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-purple-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">Prescriptions</h3>
                      <p className="text-sm text-gray-500 mt-1">View your medications</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="block bg-amber-50 rounded-xl p-4 hover:bg-amber-100 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-amber-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage your account</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="block bg-teal-50 rounded-xl p-4 hover:bg-teal-100 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center">
                    <div className="mr-4 p-3 bg-teal-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-teal-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">Profile</h3>
                      <p className="text-sm text-gray-500 mt-1">View your information</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default Home

