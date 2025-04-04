// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCU5RtmQM1Ailr-zM9R-e1Rn1XfpzEMyec",
  authDomain: "healthpal-a3830.firebaseapp.com",
  projectId: "healthpal-a3830",
  storageBucket: "healthpal-a3830.appspot.com",
  messagingSenderId: "469873154254",
  appId: "1:469873154254:web:1c5e5b27f0d2d7c9e8189f",
  measurementId: "G-FNGP9HRCVY"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const { title, body, icon } = payload.notification;
  
  // Customize notification here
  const notificationOptions = {
    body,
    icon: icon || '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const data = notification.data;
  notification.close();
  
  // Handle click based on notification type
  if (data && data.type === 'appointment') {
    clients.openWindow(`/appointments/${data.appointmentId}`);
  } else if (data && data.type === 'medication') {
    clients.openWindow('/medications');
  } else {
    clients.openWindow('/');
  }
});