// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK7-IklIVhgIR2WNEB9qYKr0w0neDKaD8",
  authDomain: "house-d9b3d.firebaseapp.com",
  projectId: "house-d9b3d",
  storageBucket: "house-d9b3d.firebasestorage.app",
  messagingSenderId: "280019202217",
  appId: "1:280019202217:web:2df9b325a90c2bb561f9b8",
  measurementId: "G-XC31X8FB95"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (safely handles environments where analytics is not supported or server-side)
export let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
