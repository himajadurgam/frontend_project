// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHw02aWGftVR8yCJe1zfTwqeE5-ZBbwEw",
  authDomain: "nullpoint-19578.firebaseapp.com",
  projectId: "nullpoint-19578",
  storageBucket: "nullpoint-19578.firebasestorage.app",
  messagingSenderId: "283009711654",
  appId: "1:283009711654:web:b82fc0ea816dcad8ce70e7",
  measurementId: "G-57G7QL5LPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;