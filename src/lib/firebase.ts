import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIFB9T3LTgfAnKaxgnVNUgSg9toM6gVKo",
  authDomain: "mkci-final-project.firebaseapp.com",
  databaseURL: "https://mkci-final-project-default-rtdb.firebaseio.com",
  projectId: "mkci-final-project",
  storageBucket: "mkci-final-project.firebasestorage.app",
  messagingSenderId: "262704219195",
  appId: "1:262704219195:web:75de2168835e2ec8ed081e",
  measurementId: "G-YT0WEJ2CX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services with long polling to prevent WebSockets timeout in preview environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
export const auth = getAuth(app);
