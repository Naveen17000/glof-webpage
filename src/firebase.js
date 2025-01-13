// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBot8wCeoJh9TkBdPunC5-or18lJlzbzK0",
  authDomain: "glacier-breakdown-detection.firebaseapp.com",
  databaseURL: "https://glacier-breakdown-detection-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "glacier-breakdown-detection",
  storageBucket: "glacier-breakdown-detection.firebasestorage.app",
  messagingSenderId: "117459328945",
  appId: "1:117459328945:web:5a29adf54a8f8d50342790",
  measurementId: "G-S4NK8VQFJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { database, analytics };
