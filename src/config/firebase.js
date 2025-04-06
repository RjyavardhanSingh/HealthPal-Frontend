import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCU5RtmQM1Ailr-zM9R-e1Rn1XfpzEMyec",
  authDomain: "healthpal-a3830.firebaseapp.com",
  projectId: "healthpal-a3830",
  storageBucket: "healthpal-a3830.appspot.com",
  messagingSenderId: "469873154254",
  appId: "1:469873154254:web:1c5e5b27f0d2d7c9e8189f",
  measurementId: "G-FNGP9HRCVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Add this code to the firebase.js file to prevent notification requests during signup
export const suppressNotificationsForSignup = () => {
  // Set a flag to prevent notification prompts during signup
  localStorage.setItem('suppressNotifications', 'true');
  
  // Clear the flag after 30 seconds (after signup is likely complete)
  setTimeout(() => {
    localStorage.removeItem('suppressNotifications');
  }, 30000);
};

// Update the messaging initialization to check for this flag
export const getMessaging = () => {
  // Skip messaging initialization during signup
  if (localStorage.getItem('suppressNotifications') === 'true') {
    return null;
  }
  
  // Regular initialization
  if (typeof window !== 'undefined' && firebase.messaging) {
    return firebase.messaging();
  }
  return null;
};

export { auth, db, googleProvider, app };