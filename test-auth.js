import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAl_iVSaiTdjUmhkyQVkpAexqRq0FIP5PA",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "mkci-new.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "mkci-new",
};

console.log("Using project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, "anoopnaini5@gmail.com", "password123")
  .then(() => console.log("Login success!"))
  .catch((err) => {
    console.error("Login Error Code:", err.code);
    console.error("Login Error Message:", err.message);
  });
