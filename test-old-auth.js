import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl_iVSaiTdjUmhkyQVkpAexqRq0FIP5PA",
  authDomain: "mkci-new.firebaseapp.com",
  projectId: "mkci-new",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, "anoopnaini5@gmail.com", "password123")
  .then(() => console.log("Login success!"))
  .catch((err) => {
    console.error("Login Error Code:", err.code);
    console.error("Login Error Message:", err.message);
  });
