
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBzaP14IRGBFhGkIXj6Iq2A4Rb-El-HMrY",
  authDomain: "valorantboost-ebb7d.firebaseapp.com",
  projectId: "valorantboost-ebb7d",
  storageBucket: "valorantboost-ebb7d.appspot.com", // .firebasestorage.app yerine doğru değer
  messagingSenderId: "297162271025",
  appId: "1:297162271025:web:c6c0c990aae0bdc2a96810",
  measurementId: "G-LY2PTB3X70"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore, Authentication, Storage hizmetlerini al
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics'i yalnızca destekleniyorsa başlat
export let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  console.error("Analytics başlatma hatası:", err);
});

// Geliştirme ortamında emülatör bağlantıları (geliştirici bu kısmı açabilir)
// if (window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, "localhost", 8080);
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectStorageEmulator(storage, "localhost", 9199);
// }

export default app;
