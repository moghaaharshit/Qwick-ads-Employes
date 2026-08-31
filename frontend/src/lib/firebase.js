import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG4t_lFLJG35DY_FhD9RM4L0mbDzZvCSI",
  authDomain: "qwick-ads-employes.firebaseapp.com",
  projectId: "qwick-ads-employes",
  storageBucket: "qwick-ads-employes.firebasestorage.app",
  messagingSenderId: "773831897019",
  appId: "1:773831897019:web:8a17955dd0af026f4fde9e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
