import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl_iVSaiTdjUmhkyQVkpAexqRq0FIP5PA",
  authDomain: "mkci-new.firebaseapp.com",
  projectId: "mkci-new",
  storageBucket: "mkci-new.firebasestorage.app",
  messagingSenderId: "340464170099",
  appId: "1:340464170099:web:34f3eb47931c2a8e122606",
  measurementId: "G-JZR54PGPTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services with long polling to prevent WebSockets timeout in preview environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
export const auth = getAuth(app);
