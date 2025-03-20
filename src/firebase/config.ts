
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBzaP14IRGBFhGkIXj6Iq2A4Rb-El-HMrY",
  authDomain: "valorantboost-ebb7d.firebaseapp.com",
  projectId: "valorantboost-ebb7d",
  storageBucket: "valorantboost-ebb7d.appspot.com",
  messagingSenderId: "297162271025",
  appId: "1:297162271025:web:c6c0c990aae0bdc2a96810",
  measurementId: "G-LY2PTB3X70"
};

console.log("Firebase yapılandırması başlatılıyor...");

try {
  // Firebase'i başlat
  const app = initializeApp(firebaseConfig);

  // Firestore, Authentication, Storage hizmetlerini al
  export const db = getFirestore(app);
  export const auth = getAuth(app);
  export const storage = getStorage(app);

  console.log("Firebase başarıyla yapılandırıldı");

  // Analytics'i yalnızca destekleniyorsa başlat
  export let analytics = null;
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics başlatıldı");
    }
  }).catch(err => {
    console.error("Analytics başlatma hatası:", err);
  });

  export default app;
} catch (error) {
  console.error("Firebase yapılandırma hatası:", error);
  throw new Error("Firebase yapılandırılamadı. Lütfen daha sonra tekrar deneyin.");
}
