
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDpv-U7lAy9Bm_AE2XJk8jMDcB5ttrjUBk",
  authDomain: "valorant-rank-booster.firebaseapp.com",
  projectId: "valorant-rank-booster",
  storageBucket: "valorant-rank-booster.appspot.com",
  messagingSenderId: "383776211387",
  appId: "1:383776211387:web:d7c35a0a3cc8c4ab8fc9f2"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Authentication hizmetlerini al
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
