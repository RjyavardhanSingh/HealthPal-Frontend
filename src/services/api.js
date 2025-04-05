import axios from 'axios';
import { auth } from '../config/firebase';

// Export API_URL for other files that need it
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const instance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token management functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set');
  } else {
    localStorage.removeItem('authToken');
    delete instance.defaults.headers.common['Authorization'];
    console.log('Auth token cleared');
  }
};

export const clearAuthToken = () => {
  delete instance.defaults.headers.common['Authorization'];
  localStorage.removeItem('authToken');
};

// Initialize token from localStorage when module loads - add function that was missing
export const initializeAuthFromStorage = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth initialized from storage');
    return true;
  }
  return false;
};

// For backward compatibility - add the missing function
export const initToken = () => initializeAuthFromStorage();

// Initialize token on module load
initializeAuthFromStorage();

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add this debug interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug log to verify token is being sent
      console.log('Request with auth to:', config.url);
    } else {
      console.warn('No auth token available for request to:', config.url);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add this debug line to the instance interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with auth token:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('401 error caught, attempting to refresh token');
        
        // Get fresh token from Firebase
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('Getting fresh Firebase token');
          const newFirebaseToken = await currentUser.getIdToken(true);
          
          // Re-authenticate with backend
          console.log('Re-authenticating with backend');
          const response = await instance.post('/auth/authenticate', { idToken: newFirebaseToken });
          
          if (response.data && response.data.token) {
            const newBackendToken = response.data.token;
            console.log('Got new backend token');
            
            // Update token in localStorage and axios headers
            setAuthToken(newBackendToken);
            
            // Update the original request
            originalRequest.headers['Authorization'] = `Bearer ${newBackendToken}`;
            
            console.log('Retrying original request with new token');
            return instance(originalRequest);
          }
        } else {
          console.log('No Firebase user found for token refresh');
          clearAuthToken();
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add response interceptor to catch authentication errors
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      console.error('Authentication error:', error.response?.data?.message || 'Access denied');
      // Could add auto-logout here if needed
    }
    return Promise.reject(error);
  }
);

// Add token validity check function
export const checkTokenValidity = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const response = await instance.get('/auth/verify');
    return response.status === 200;
  } catch (error) {
    console.log('Token validation failed:', error.message);
    return false;
  }
};

// Add this function to help debug API endpoint issues

// Debug helper function
const debugRequest = async (request, ...args) => {
  try {
    console.log(`Making API request to: ${request.name || 'unknown endpoint'}`);
    const response = await request(...args);
    console.log('API request successful:', response.config.url);
    return response;
  } catch (error) {
    console.error(`API request failed for endpoint: ${error.config?.url || 'unknown'}`, error);
    throw error;
  }
};

// Add this function before the api object definition

const getAvailableDatesWithFallback = async (doctorId) => {
  const possibleEndpoints = [
    `/availability/doctor/${doctorId}/dates`,
    `/doctors/${doctorId}/available-dates`,
    `/doctors/${doctorId}/availability/dates`
  ];
  
  let lastError = null;
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Attempting to fetch dates from: ${endpoint}`);
      const response = await instance.get(endpoint);
      return response;
    } catch (error) {
      console.error(`Failed with endpoint: ${endpoint}`);
      lastError = error;
    }
  }
  
  throw lastError;
};

// Add this function after your getAvailableDatesWithFallback function

const getAvailableTimeSlotsWithFallback = async (doctorId, date) => {
  const possibleEndpoints = [
    `/availability/doctor/${doctorId}/slots`, // Based on server controller naming pattern
    `/doctors/${doctorId}/time-slots`,        // Current client expectation
    `/doctors/${doctorId}/availability/slots` // Another possible pattern
  ];
  
  let lastError = null;
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Attempting to fetch time slots from: ${endpoint} for date: ${date}`);
      const response = await instance.get(endpoint, { params: { date } });
      console.log('Successfully fetched time slots from:', endpoint);
      return response;
    } catch (error) {
      console.error(`Failed with endpoint: ${endpoint}`);
      lastError = error;
    }
  }
  
  throw lastError;
};

// Add this debug function to your api.js
const checkAuthToken = () => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  console.log('Auth check - Token exists:', !!token);
  console.log('Auth check - User exists:', !!user);
  if (user) {
    console.log('User role:', user.role);
    console.log('User ID:', user._id);
  }
  return !!token && !!user;
};

// Modify your interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with auth token:', config.url);
    } else {
      console.warn('No auth token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Complete API object with all endpoints
const api = {
  // Include utility functions
  setAuthToken,
  clearAuthToken,
  checkTokenValidity,
  initializeAuthFromStorage,
  initToken,
  
  auth: {
    authenticate: async (token, provider = 'google') => {
      try {
        console.log(`Authenticating with ${provider} token`);
        
        const response = await instance.post('/auth/google', { token });
        
        if (response.data && response.data.token) {
          console.log(`Authentication successful as ${response.data.user.role}`);
          setAuthToken(response.data.token);
        }
        
        return response;
      } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.response) {
          console.error('Server responded with:', error.response.status, error.response.data);
        }
        
        throw error;
      }
    },
    
    loginWithEmailPassword: async (email, idToken) => {
      try {
        console.log('Email/password authentication request for:', email);
        
        const response = await instance.post('/auth/login', {
          email,
          token: idToken
        });
        
        if (response.data && response.data.token) {
          console.log(`Login successful as ${response.data.user.role}`);
          setAuthToken(response.data.token);
        }
        
        return response;
      } catch (error) {
        console.error('Email/password authentication error:', error);
        
        if (error.response) {
          console.error('Server responded with:', error.response.status, error.response.data);
        }
        
        throw error;
      }
    },
    
    // Other auth methods...
    register: (userData) => instance.post('/auth/register', userData),
    registerGoogle: (userData) => instance.post('/auth/register-google', userData),
    login: (credentials) => instance.post('/auth/login', credentials),
    verifyToken: async () => {
      try {
        const response = await instance.get('/auth/verify');
        return response;
      } catch (error) {
        console.error('Token verification error:', error);
        throw error;
      }
    },
    getMe: () => instance.get('/auth/me'),
    updateProfile: (data) => instance.put('/auth/profile', data),
    updatePassword: (currentPassword, newPassword) => 
      instance.put('/auth/password', { currentPassword, newPassword }),
    updateNotificationSettings: (settings) => 
      instance.put('/auth/notification-settings', settings),

    // Remove the first declaration of loginAdmin
    // loginAdmin: (email, password) => {
    //   return instance.post('/auth/admin-login', { email, password });
    // },

    // Keep only this implementation
    loginAdmin: async (email, password) => {
      try {
        console.log('Admin authentication request for:', email);
        
        const response = await instance.post('/auth/admin-login', {
          email,
          password
        });
        
        if (response.data && response.data.token) {
          console.log('Admin login successful');
          setAuthToken(response.data.token);
        }
        
        return response;
      } catch (error) {
        console.error('Admin authentication error:', error);
        
        if (error.response) {
          console.error('Server responded with:', error.response.status, error.response.data);
        }
        
        throw error;
      }
    }
  },
  
  appointments: {
    // Use instance instead of axios to ensure auth headers are included
    getAll: (params) => instance.get('/appointments', { params }),
    getById: (id) => instance.get(`/appointments/${id}`),
    create: (data) => instance.post('/appointments', data),
    update: (id, data) => instance.put(`/appointments/${id}`, data),
    cancel: (id, reason) => instance.put(`/appointments/${id}/cancel`, { reason }),
    updateStatus: (id, status) => instance.patch(`/appointments/${id}/status`, { status }),
    submitReview: (id, data) => instance.post(`/appointments/${id}/review`, data),
    createByStaff: (data) => instance.post('/appointments/admin', data),
    getAvailableDates: (doctorId) => instance.get(`/doctors/${doctorId}/available-dates`),
    getAvailableTimeSlots: (doctorId, date) => instance.get(`/doctors/${doctorId}/available-slots/${date}`)
  },
  
  doctors: {
    getAll: (params = {}) => instance.get('/doctors', { params }),
    getById: (id) => instance.get(`/doctors/${id}`),
    getProfile: () => instance.get('/doctors/profile'),
    updateProfile: (data) => instance.put('/doctors/profile', data),
    
    // Add the missing getRecentPatients method
    getRecentPatients: () => instance.get('/doctors/patients/recent'),

    // Appointments 
    getAppointments: (params = {}) => instance.get('/doctors/appointments', { params }),
    
    // Make sure these existing methods are also present
    getPatients: () => instance.get('/doctors/patients'),
    getPatientById: (patientId) => instance.get(`/doctors/patients/${patientId}`),
    
    // Update these to match server routes directly without fallbacks
    getAvailableDates: (doctorId) => {
      // If doctorId is provided, get dates for that doctor
      if (doctorId) {
        return instance.get(`/doctors/${doctorId}/available-dates`);
      }
      // Otherwise get the current doctor's own dates
      return instance.get('/doctors/available-dates');
    },
    getTimeSlots: (date) => instance.get('/doctors/time-slots', { params: { date } }),
    getAvailableTimeSlots: (doctorId, date) => 
      instance.get(`/doctors/${doctorId}/time-slots`, { params: { date } }),
    
    // Make sure these match the server routes
    saveTimeSlots: (date, slots) => instance.post('/doctors/time-slots', { date, slots }),
    saveRecurringTimeSlots: (date, slots, repeatFor) => 
      instance.post('/doctors/time-slots/recurring', { date, slots, repeatFor }),
    deleteAvailability: (date) => instance.delete('/doctors/time-slots', { params: { date } }),
    updateAvailabilityStatus: (isAcceptingAppointments) => 
      instance.patch('/doctors/availability-status', { isAcceptingAppointments }),
    
    // Make sure these are defined
    getPatients: () => instance.get('/doctors/patients'),
    getPatientById: (patientId) => instance.get(`/doctors/patients/${patientId}`),

    // Add this method specifically for doctors' own appointments
    getMyAppointments: (params = {}) => instance.get('/doctors/my-appointments', { params }),

    // Fix this function - remove the duplicate /api/ prefix
    addReview: (doctorId, reviewData) => {
      return instance.post(`/doctors/${doctorId}/reviews`, reviewData);
    },
  },
  
  patients: {
    getAll: (params = {}) => instance.get('/patients', { params }),
    getById: (id) => instance.get(`/patients/${id}`),
    getProfile: () => instance.get('/patients/profile'),
    updateProfile: (data) => instance.put('/patients/profile', data),
    getAppointments: (id) => instance.get(`/patients/${id}/appointments`),
    addMedicalDocument: (patientId, formData) => 
      instance.post(`/patients/${patientId}/medical-documents`, formData)
  },
  
  consultations: {
    create: (data) => instance.post('/consultations', data),
    getById: (id) => instance.get(`/consultations/${id}`),
    getByAppointment: (appointmentId) => instance.get(`/consultations/appointment/${appointmentId}`),
    update: (id, data) => instance.put(`/consultations/${id}`, data),
    
    // Add this method for doctor's consultations
    getByPatient: (patientId) => instance.get(`/consultations/patient/${patientId}`)
  },
  
  medicalRecords: {
    getAll: (params = {}) => instance.get('/medical-records', { params }),
    getById: (id) => instance.get(`/medical-records/${id}`),
    getByPatient: (patientId) => instance.get(`/medical-records/patient/${patientId}`),
    create: (recordData) => instance.post('/medical-records', recordData),
    update: (id, recordData) => instance.put(`/medical-records/${id}`, recordData),
    delete: (id) => instance.delete(`/medical-records/${id}`)
  },
  
  prescriptions: {
    getAll: (params = {}) => instance.get('/prescriptions', { params }),
    getById: (id) => instance.get(`/prescriptions/${id}`),
    getByPatient: (patientId) => instance.get(`/prescriptions/patient/${patientId}`),
    getByDoctor: (doctorId) => instance.get(`/prescriptions/doctor/${doctorId}`), 
    create: (prescriptionData) => instance.post('/prescriptions', prescriptionData),
    update: (id, prescriptionData) => instance.put(`/prescriptions/${id}`, prescriptionData),
    delete: (id) => instance.delete(`/prescriptions/${id}`)
  },
  
  uploads: {
    // Change this method
    profileImage: (formData) => {
      return instance.post('/uploads/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    // The rest of your methods remain unchanged
    document: (formData) => {
      return instance.post('/uploads/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    // ...other methods...
  },
  
  video: {
    getToken: (data) => instance.post('/video/token', data),
    getCallDetails: (appointmentId) => instance.get(`/video/call/${appointmentId}`)
  },
  
  reminders: {
    getAll: () => instance.get('/reminders'),
    create: (reminderData) => instance.post('/reminders', reminderData),
    update: (id, reminderData) => instance.put(`/reminders/${id}`, reminderData),
    delete: (id) => instance.delete(`/reminders/${id}`)
  },

  files: {
    getSignedUrl: (fileId) => instance.get(`/files/signed-url/${fileId}`),
    // Add other file related endpoints as needed
  },

  medications: {
    getReminders: () => instance.get('/medications/reminders'),
    createReminder: (data) => instance.post('/medications/reminders', data),
    updateReminder: (id, data) => instance.put(`/medications/reminders/${id}`, data),
    deleteReminder: (id) => instance.delete(`/medications/reminders/${id}`),
    markTaken: (id) => instance.post(`/medications/reminders/${id}/taken`),
  },

  // Add this to your api object
  notifications: {
    registerDevice: (token) => {
      return instance.post('/notifications/register-device', { token });
    },
    
    getAll: () => {
      return instance.get('/notifications');
    },
    
    markAsRead: (notificationId) => {
      return instance.put(`/notifications/${notificationId}/read`);
    },
    
    markAllAsRead: () => {
      return instance.put('/notifications/read-all');
    },
    
    delete: (notificationId) => {
      return instance.delete(`/notifications/${notificationId}`);
    }
  },

  // Add this to your API service
  verification: {
    getRequests: () => instance.get('/admin/verification-requests'),
    // Change from PUT to POST to match server expectation
    approveRequest: (requestId) => instance.post(`/admin/verification-requests/${requestId}/approve`),
    rejectRequest: (requestId, data) => instance.post(`/admin/verification-requests/${requestId}/reject`, data),
    requestDocuments: (requestId, data) => instance.post(`/admin/verification-requests/${requestId}/request-documents`, data),
    getStatus: () => instance.get('/doctors/verification-status'),
    uploadDocuments: (formData) => instance.post('/doctors/verification-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  },

  // Add this to your api object
  payments: {
    createPaymentIntent: async (appointmentId) => {
      try {
        console.log('Creating payment intent for appointment:', appointmentId);
        const response = await instance.post('/payments/create-payment-intent', { appointmentId });
        console.log('Payment intent created successfully');
        return response;
      } catch (error) {
        console.error('Error creating payment intent:', error);
        if (error.response && error.response.data) {
          console.error('Server message:', error.response.data.message);
        }
        throw error;
      }
    },
    confirmPayment: async (appointmentId, paymentIntentId) => {
      try {
        const response = await instance.post('/payments/confirm-payment', { 
          appointmentId, 
          paymentIntentId 
        });
        return response;
      } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
      }
    },
  },
};

export default api;