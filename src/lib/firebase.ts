import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAl_iVSaiTdjUmhkyQVkpAexqRq0FIP5PA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mkci-new.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mkci-new",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mkci-new.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "340464170099",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:340464170099:web:34f3eb47931c2a8e122606",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JZR54PGPTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services with long polling to prevent WebSockets timeout in preview environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
export const auth = getAuth(app);
