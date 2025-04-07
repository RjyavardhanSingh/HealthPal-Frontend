import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import RotatingLogo from "../components/RotatingLogo";
import { useAuth } from "../context/AuthContext";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// Import 3D model images
import modelBrain from "../assets/images/3d-brain.png"; 
import modelHeart from "../assets/images/3d-heart.png";
import modelDNA from "../assets/images/3d-dna.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const { clearAuthState } = useAuth();
  const [activeSection, setActiveSection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesInit = useRef(null);
  const containerRef = useRef(null);
  
  // Handle mouse movement for subtle interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    // Auto-rotate through sections every 6 seconds
    const timer = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 4);
    }, 6000);
    
    // Reset scroll position when landing page loads
    window.scrollTo(0, 0);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(timer);
    };
  }, []);
  
  // Add this new effect to force scroll to top on initial render
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
  }, []);
  
  // Initialize particles for the background effect
  const initParticles = async (engine) => {
    particlesInit.current = engine;
    await loadFull(engine);
  };
  
  const handleGetStarted = () => {
    clearAuthState();
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Create a pulse effect
    document.body.classList.add('pulse-transition');
    
    setTimeout(() => {
      navigate("/login");
      document.body.classList.remove('pulse-transition');
    }, 800);
  };

  // Generate dynamic gradient based on mouse position
  const dynamicGradient = `radial-gradient(
    circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
    rgba(56, 189, 248, 0.4) 0%, 
    rgba(20, 184, 166, 0.3) 25%, 
    rgba(0, 0, 0, 0) 70%
  )`;

  const features = [
    {
      title: "Smart Appointment Booking",
      description: "Easily schedule consultations with qualified healthcare professionals based on availability and specialization.",
      color: "blue",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Video Consultations",
      description: "Connect with doctors from anywhere through secure, HD video calls without leaving the comfort of your home.",
      color: "green",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Medication Management",
      description: "Track prescriptions and receive timely medication reminders to ensure you never miss a dose.",
      color: "indigo",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      title: "Medical Records",
      description: "Securely store and access your complete health history in one convenient location.",
      color: "purple",
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 overflow-x-hidden" ref={containerRef}>
      {/* Custom CSS for healthcare-themed animations */}
      <style>{`
        @keyframes pulseTransition {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        
        .pulse-transition::after {
          content: "";
          position: fixed;
          top: 50%;
          left: 50%;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle, rgba(59,130,246,1) 0%, rgba(37,99,235,0.8) 50%, rgba(30,64,175,0) 100%);
          transform: translate(-50%, -50%);
          z-index: 9999;
          animation: pulseTransition 0.8s ease-out forwards;
          pointer-events: none;
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        
        .heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .health-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 30 L30 20 L20 20 L20 30 L10 30 L10 40 L20 40 L20 50 L30 50 L30 40 L40 40 L40 30 z' fill='%233b82f620'/%3E%3C/svg%3E");
          background-size: 60px 60px;
        }

        .card-shadow {
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05);
        }
        
        .ecg-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecgDraw 3s linear forwards infinite;
        }
        
        @keyframes ecgDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Gentle healthcare-themed particle background */}
      <Particles
        id="tsparticles"
        init={initParticles}
        options={{
          fullScreen: {
            enable: false, // Change from true to false
            zIndex: -1
          },
          container: {
            width: "100%",
            height: "100%",
            position: "absolute",
          },
          // Keep the rest of your options the same
          fpsLimit: 60,
          particles: {
            number: { value: 15, density: { enable: true, value_area: 1000 } },
            color: { value: ["#3b82f6", "#60a5fa", "#2563eb"] },
            shape: { type: "circle" },
            opacity: { value: 0.2, random: true },
            size: { value: 4, random: true, anim: { enable: true, speed: 1 } },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              outMode: "out"
            },
            links: {
              enable: true,
              distance: 150,
              color: "#60a5fa",
              opacity: 0.1,
              width: 1
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "bubble" },
              onclick: { enable: false }
            },
            modes: {
              bubble: { distance: 200, size: 6, duration: 2, opacity: 0.3 }
            }
          }
        }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}
      />

      {/* Medical cross pattern overlay */}
      <div className="absolute inset-0 health-pattern opacity-10 pointer-events-none"></div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 py-4 px-6 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center heartbeat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-blue-900">HealthPal</span>
            </div>
            <nav className="hidden md:flex gap-8 text-blue-800">
              <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
              <a href="#" className="hover:text-blue-500 transition-colors">About</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
            </nav>
            <button
              onClick={handleGetStarted}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-colors font-medium shadow-md"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero section */}
        <section className="w-full py-6 md:py-12"> {/* Reduced from py-12 md:py-20 */}
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              {/* Hero content */}
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
                <motion.div
                  initial={{ opacity: 0, y: -10 }} // Changed from -20 to -10
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 leading-tight">
                    Your Health Journey,<br />Simplified!!!
                  </h1>
                  
                  <p className="text-lg text-gray-700 mb-8 max-w-xl">
                    HealthPal brings all your healthcare needs together in one seamless experience. Connect with doctors, manage medications, and access your medical records anytime, anywhere.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGetStarted}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg shadow-blue-300/50 flex items-center justify-center gap-2"
                    >
                      <span>Get Started</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                    
                    <button className="border-2 border-blue-600 text-blue-700 font-medium px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </motion.div>
              </div>
              
              {/* Hero visual - Animated ECG/heartbeat visualization */}
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="bg-white rounded-2xl shadow-xl p-6 card-shadow"
                >
                  <div className="bg-blue-50 rounded-xl p-5 mb-4 relative">
                    <svg
                      viewBox="0 0 800 200"
                      className="w-full h-40 md:h-56"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="ecg-line"
                        d="M0,100 L100,100 L120,100 L140,20 L160,180 L180,100 L200,100 L220,100 L240,100 L260,120 L280,80 L300,100 L320,100 L340,100 L360,100 L380,20 L400,180 L420,100 L440,100 L460,100 L480,100 L500,120 L520,80 L540,100 L560,100 L580,100 L600,100 L620,20 L640,180 L660,100 L680,100 L700,100 L720,100 L740,120 L760,80 L780,100 L800,100"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                      />
                      <circle className="pulse" cx="400" cy="100" r="5" fill="#2563eb" />
                    </svg>
                    <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-blue-100">
                      <span className="text-blue-700 font-medium">Heart Rate: 78 BPM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">Blood Pressure</span>
                        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold text-blue-900">120/80 <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm">Oxygen Level</span>
                        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold text-blue-900">98% <span className="text-sm font-normal text-gray-500">SpO2</span></p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {[
                { value: '24/7', label: 'Care Access', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { value: '100%', label: 'Secure Data', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { value: 'Easy', label: 'Record Management', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { value: 'Instant', label: 'Consultations', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-50 rounded-xl p-6 text-center card-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">{stat.value}</h3>
                  <p className="text-gray-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.span 
                className="text-blue-600 font-semibold text-sm uppercase tracking-wider"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Why Choose HealthPal
              </motion.span>
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-blue-900 mt-2"
                initial={{ opacity: 0, y: 10 }} // Changed from 20 to 10
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Comprehensive Healthcare Solutions
              </motion.h2>
              <motion.p 
                className="text-gray-600 mt-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 10 }} // Changed from 20 to 10
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Our platform integrates all your healthcare needs into one seamless experience, 
                providing the tools you need to manage your health effectively.
              </motion.p>
            </div>
            
            <div className="relative rounded-xl overflow-hidden bg-white shadow-lg card-shadow mb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  className="grid grid-cols-1 md:grid-cols-2 gap-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className={`w-16 h-16 rounded-lg bg-${features[activeSection].color}-100 mb-6 flex items-center justify-center`}>
                      <div className={`text-${features[activeSection].color}-600`}>
                        {features[activeSection].icon}
                      </div>
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-4 text-${features[activeSection].color}-700`}>
                      {features[activeSection].title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      {features[activeSection].description}
                    </p>
                    
                    <button className={`self-start flex items-center gap-2 text-${features[activeSection].color}-600 font-medium`}>
                      <span>Learn more</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className={`bg-${features[activeSection].color}-500/10 p-8 md:p-12 flex items-center justify-center`}>
                    <div className="max-w-md">
                      {/* Feature-specific illustration */}
                      {activeSection === 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-md">
                          <div className="flex justify-between mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <h4 className="font-medium text-gray-800">Appointment Calendar</h4>
                              <p className="text-sm text-gray-500">October 2023</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-1 rounded hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button className="p-1 rounded hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-2 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                              <div key={i} className="text-center text-xs font-medium text-gray-500">{day}</div>
                            ))}
                            {[...Array(31)].map((_, i) => (
                              <button 
                                key={i} 
                                className={`text-center text-sm p-2 rounded-full 
                                  ${i === 14 ? 'bg-blue-500 text-white' : 
                                    i === 21 ? 'bg-green-100 text-green-800 border border-green-300' : 
                                    'hover:bg-gray-100'
                                  }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Dr. Smith - Checkup</p>
                                <p className="text-xs text-gray-500">2:30 PM - 3:00 PM</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Dr. Johnson - Follow-up</p>
                                <p className="text-xs text-gray-500">10:00 AM - 10:30 AM</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeSection === 1 && (
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="font-medium text-gray-800">Video Consultation</h4>
                                <p className="text-sm text-gray-500">Dr. Sarah Wilson</p>
                              </div>
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Live Now
                              </div>
                            </div>
                            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 flex justify-around">
                            <button className="p-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <button className="p-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {activeSection === 2 && (
                        <div className="bg-white rounded-xl p-6 shadow-md">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <h4 className="font-medium text-gray-800">Medication List</h4>
                              <p className="text-sm text-gray-500">October 2023</p>
                            </div>
                            <button className="p-1 rounded hover:bg-gray-100">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Aspirin</p>
                                <p className="text-xs text-gray-500">1 tablet - Morning</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Metformin</p>
                                <p className="text-xs text-gray-500">1 tablet - Evening</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeSection === 3 && (
                        <div className="bg-white rounded-xl p-6 shadow-md">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <h4 className="font-medium text-gray-800">Medical Records</h4>
                              <p className="text-sm text-gray-500">October 2023</p>
                            </div>
                            <button className="p-1 rounded hover:bg-gray-100">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">Blood Test</p>
                                <p className="text-xs text-gray-500">Result: Normal</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">X-Ray</p>
                                <p className="text-xs text-gray-500">Result: Normal</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Feature navigation dots */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeSection === index 
                        ? 'bg-cyan-400 w-8' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    onClick={() => setActiveSection(index)}
                    aria-label={`Feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 10 }} // Changed from 20 to 10
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <button
              onClick={handleGetStarted}
              className="group relative overflow-hidden"
            >
              {/* Button background layers */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
              <span className="absolute inset-0 backdrop-blur-[1px] opacity-30"></span>
              
              {/* Digital circuit pattern */}
              <span className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
                  <path d="M0,50 L100,50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
                  <path d="M50,0 L50,100" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
                  <path d="M25,25 L75,75" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
                  <path d="M75,25 L25,75" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"></path>
                  <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"></circle>
                </svg>
              </span>
              {/* Moving particles effect on hover */}
              <span className="absolute inset-0 overflow-hidden rounded-md opacity-0 group-hover:opacity-30 transition-opacity">
                <span className="absolute top-0 left-[-100%] w-[300%] h-[100%] bg-gradient-to-r from-transparent via-white to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out"></span>
              </span>
            </button>
          </motion.div>
        </section>

        {/*Footer */}
        <motion.footer
          className="relative bg-gradient-to-b from-blue-50 to-white py-8 border-t border-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center heartbeat mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900">HealthPal</div>
                  <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Your Health Companion</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 md:gap-12">
                <div className="text-center">
                  <h5 className="text-blue-800 font-medium mb-2 text-sm">Company</h5>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">About</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Careers</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Partners</a></li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <h5 className="text-blue-800 font-medium mb-2 text-sm">Resources</h5>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Blog</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Contact</a></li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <h5 className="text-blue-800 font-medium mb-2 text-sm">Legal</h5>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Privacy</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Terms</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Security</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-blue-50 flex flex-col-reverse md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs mt-4 md:mt-0">
                HealthPal is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              
              <div className="flex items-center gap-4">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default LandingPage;

