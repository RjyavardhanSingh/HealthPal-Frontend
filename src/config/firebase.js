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

export { auth, db, googleProvider, app };