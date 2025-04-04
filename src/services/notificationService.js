import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';
import api from './api';

// Initialize Firebase - safely get the app if it exists
let messaging;
try {
  // Try to get existing Firebase app
  const app = window.firebaseApp;
  messaging = getMessaging(app);
} catch (err) {
  console.warn('Firebase messaging initialization failed:', err);
}

// Request notification permissions and register device
export const requestNotificationPermission = async (userRole) => {
  try {
    // Check browser support
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    // Request permission - this must happen in response to a user gesture
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    console.log('Permission status:', permission);
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }
    
    console.log('Notification permission granted');
    
    // Try to get FCM token
    if (messaging) {
      try {
        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        
        if (currentToken) {
          console.log('FCM token obtained:', currentToken.substring(0, 10) + '...');
          
          // Register token with backend
          await api.notifications.registerDevice(currentToken);
          return true;
        } else {
          console.log('Unable to get FCM token');
        }
      } catch (err) {
        console.error('Error getting FCM token:', err);
      }
    } else {
      console.warn('Firebase messaging not available, using browser notifications only');
    }
    
    // Return true if permission was granted, even if FCM isn't available
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Set up message listener for foreground notifications
export const setupMessageListener = () => {
  if (!messaging) {
    console.warn('Firebase messaging not available');
    return;
  }
  
  onMessage(messaging, (payload) => {
    console.log('Received message in foreground:', payload);
    
    // Show toast notification
    toast.info(payload.notification.title, {
      bodyClassName: 'notification-toast',
      data: {
        message: payload.notification.body,
        type: payload.data?.type || 'general'
      },
      onClick: () => handleNotificationClick(payload.data)
    });
    
    // Show browser notification as well
    if (Notification.permission === 'granted') {
      const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo.png'
      });
      
      notification.onclick = () => {
        handleNotificationClick(payload.data);
      };
    }
  });
};

// Handle notification clicks based on type
const handleNotificationClick = (data) => {
  if (!data) return;
  
  switch (data.type) {
    case 'appointment':
      window.location.href = `/appointments/${data.appointmentId}`;
      break;
    case 'medication':
      window.location.href = '/medications';
      break;
    case 'message':
      window.location.href = `/messages/${data.conversationId}`;
      break;
    default:
      window.location.href = '/';
  }
};

// Format reminder time helper
export const formatReminderTime = (timeString) => {
  if (!timeString) return 'Not set';
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.error('Error formatting time:', err);
    return timeString;
  }
};

export default {
  requestPermission: requestNotificationPermission,
  setupMessageListener,
  formatReminderTime
};