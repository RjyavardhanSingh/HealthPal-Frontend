import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import StarRating from '../../components/common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const FindDoctor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    specialization: location.state?.specialty || '',
    location: '',
    availability: '',
    gender: '',
    experience: '',
    feeRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Redirect doctors away from this page
    if (currentUser?.role === 'doctor') {
      navigate('/doctor/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.doctors.getAll(searchParams);
        setDoctors(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Failed to load doctors");
        setDoctors([]);
      } finally {
        setLoading(false);
        // Trigger animations after data is loaded
        setTimeout(() => {
          setContentLoaded(true);
        }, 100);
      }
    };

    fetchDoctors();
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.doctors.getAll(searchParams);
      setDoctors(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError(err.message || "Failed to search doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleClearFilters = () => {
    setSearchParams({
      name: '',
      specialization: '',
      location: '',
      availability: '',
      gender: '',
      experience: '',
      feeRange: ''
    });
  };
  
  const getSoonestAvailability = (doctor) => {
    // Logic to determine soonest available appointment
    // For now, just returning a placeholder
    return "Today";
  };
  
  // Custom styles to match landing page aesthetics
  const customStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .animate-slide-up {
      animation: slideUp 0.6s ease-out forwards;
    }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(59, 130, 246, 0.1);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }
    
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 20px rgba(59, 130, 246, 0.15);
    }
    
    .search-input:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }
    
    .filter-button {
      position: relative;
      overflow: hidden;
    }
    
    .filter-button:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(59, 130, 246, 0.1);
      transform: scaleX(0);
      transform-origin: 0 50%;
      transition: transform 0.5s ease;
    }
    
    .filter-button:hover:after {
      transform: scaleX(1);
    }
    
    .specialty-badge {
      transition: all 0.2s ease;
    }
    
    .specialty-badge:hover {
      background: #dbeafe;
      transform: translateY(-1px);
    }
  `;

  return (
    <div className="min-h-screen py-8 px-4">
      <style>{customStyles}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className={`mb-6 flex items-center ${contentLoaded ? "animate-fade-in" : "opacity-0"}`}>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-800">Find Doctors</h1>
        </div>
        
        <div className={`glass-card rounded-xl mb-8 overflow-hidden ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div className="p-6">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Search doctor by name"
                      value={searchParams.name}
                      onChange={handleInputChange}
                      className="search-input block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl text-sm placeholder-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-1">
                  <select
                    name="specialization"
                    value={searchParams.specialization}
                    onChange={handleInputChange}
                    className="search-input block w-full py-3 px-4 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="General Physician">General Physician</option>
                  </select>
                </div>
                
                <div className="md:col-span-1">
                  <button 
                    type="submit" 
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </span>
                  </button>
                </div>
                
                <div className="md:col-span-1">
                  <button 
                    type="button" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-button w-full py-3 px-6 border border-blue-200 bg-white font-medium rounded-xl hover:bg-blue-50 transition-colors duration-200"
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filters {showFilters ? '▲' : '▼'}
                    </span>
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-blue-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="location"
                          placeholder="Any location"
                          value={searchParams.location}
                          onChange={handleInputChange}
                          className="search-input block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl text-sm placeholder-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={searchParams.gender}
                        onChange={handleInputChange}
                        className="search-input block w-full py-3 px-4 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Any Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience
                      </label>
                      <select
                        name="experience"
                        value={searchParams.experience}
                        onChange={handleInputChange}
                        className="search-input block w-full py-3 px-4 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Any Experience</option>
                        <option value="0-5">0-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee Range
                      </label>
                      <select
                        name="feeRange"
                        value={searchParams.feeRange}
                        onChange={handleInputChange}
                        className="search-input block w-full py-3 px-4 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Any Fee Range</option>
                        <option value="0-100">$0-$100</option>
                        <option value="100-200">$100-$200</option>
                        <option value="200+">$200+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-3 text-sm"
                    >
                      Clear Filters
                    </button>
                    
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
          
          {/* Specialties quick filters */}
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            {["Cardiologist", "Dermatologist", "Neurologist", "Psychiatrist", "Pediatrician", "General Physician"].map(
              (specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSearchParams(prev => ({ ...prev, specialization: specialty }))}
                  className={`specialty-badge px-3 py-1 rounded-full text-xs font-medium ${
                    searchParams.specialization === specialty
                      ? "bg-blue-500 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {specialty}
                </button>
              )
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center heartbeat mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-blue-600 font-medium">Finding doctors...</p>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : doctors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-8 text-center max-w-2xl mx-auto"
          >
            <div className="mb-4 bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any doctors matching your search criteria. Try adjusting your filters or try a different search.
            </p>
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              Clear filters and try again
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-card rounded-xl overflow-hidden hover-lift ${contentLoaded ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 flex justify-center">
                      {doctor.profileImage ? (
                        <img 
                          src={doctor.profileImage} 
                          alt={doctor.name} 
                          className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                          <span className="text-2xl font-bold">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-xl font-semibold text-gray-800">Dr. {doctor.name}</h3>
                            {doctor.isAcceptingAppointments === false ? (
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                On Leave
                              </span>
                            ) : (
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </div>
                          
                          <p className="text-blue-600 font-medium mt-1">{doctor.specialization}</p>
                          
                          <div className="flex items-center mt-2">
                            <StarRating rating={doctor.rating || 4.5} />
                            <span className="ml-2 text-sm text-gray-500">({doctor.reviews?.length || 0} reviews)</span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                              </svg>
                              <span>{doctor.experience || '5+'} years exp.</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>${doctor.consultationFee} fee</span>
                            </div>
                            
                            {doctor.hospital?.name && (
                              <div className="flex items-center text-sm text-gray-600 col-span-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{doctor.hospital.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center md:items-end">
                          {doctor.isAcceptingAppointments === false ? (
                            <div className="flex items-center bg-amber-50 text-amber-800 px-4 py-2 rounded-lg text-sm mb-3 w-full md:w-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Currently On Leave</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm mb-3 w-full md:w-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Available: {getSoonestAvailability(doctor)}</span>
                            </div>
                          )}
                          
                          <div className="flex space-x-3 w-full md:w-auto">
                            <button 
                              onClick={() => navigate(`/doctors/${doctor._id}`)}
                              className="flex-1 md:flex-none px-5 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              View Profile
                            </button>
                            
                            <button 
                              onClick={() => navigate(`/book-appointment/${doctor._id}`)}
                              className={`flex-1 md:flex-none px-5 py-2 rounded-lg font-medium transition-colors ${
                                doctor.isAcceptingAppointments !== false
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={doctor.isAcceptingAppointments === false}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctor;