
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBzaP14IRGBFhGkIXj6Iq2A4Rb-El-HMrY",
  authDomain: "valorantboost-ebb7d.firebaseapp.com",
  projectId: "valorantboost-ebb7d",
  storageBucket: "valorantboost-ebb7d.firebasestorage.app",
  messagingSenderId: "297162271025",
  appId: "1:297162271025:web:c6c0c990aae0bdc2a96810",
  measurementId: "G-LY2PTB3X70"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore, Authentication, Analytics ve Storage hizmetlerini al
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export default app;
