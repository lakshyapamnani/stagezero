import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQBgXZERMrglL0Loc1-MVBY5z0ZZw63wQ",
  authDomain: "stagezero-bf097.firebaseapp.com",
  projectId: "stagezero-bf097",
  storageBucket: "stagezero-bf097.firebasestorage.app",
  messagingSenderId: "372546724361",
  appId: "1:372546724361:web:750ed2d8d31219c8bc0ed8",
  measurementId: "G-97SCQYHT0L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
