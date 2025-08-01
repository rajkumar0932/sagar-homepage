// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// This is your web app's confirmed, correct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGnGJ2fyC5DEbV9o8DESQXsh8HUcnR-JGY",
  authDomain: "sagar-dashboard-b7252.firebaseapp.com",
  projectId: "sagar-dashboard-b7252",
  storageBucket: "sagar-dashboard-b7252.firebasestorage.app",
  messagingSenderId: "345963130842",
  appId: "1:345963130842:web:c30d01bbfc80456f345ae3",
  measurementId: "G-MJMPYHZKHF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it for use in your app
export const db = getFirestore(app);