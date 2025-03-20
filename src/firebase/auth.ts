
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Kullanıcı arayüzü
export interface FirebaseUser {
  id: string;
  email: string | null;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

// Kayıt fonksiyonu
export const registerUser = async (
  email: string, 
  username: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    // Firebase Authentication ile kullanıcı oluştur
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı bilgilerini Firestore'a kaydet
    const userData: FirebaseUser = {
      id: user.uid,
      email: user.email,
      username,
      role: "customer",
      balance: 0
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    console.log("Kullanıcı başarıyla kaydedildi:", userData);
    return userData;
  } catch (error: any) {
    console.error("Kayıt hatası:", error.message);
    throw new Error(error.message);
  }
};

// Giriş fonksiyonu
export const loginUser = async (
  email: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    // Admin kontrolü (gerçek uygulamada daha güvenli bir yöntem kullanılmalı)
    if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
      return {
        id: "admin-user-id",
        email: "hakan200505@gmail.com",
        username: "admin",
        role: "admin",
        balance: 5000
      };
    }
    
    // Normal kullanıcı girişi
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı bilgilerini Firestore'dan al
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as FirebaseUser;
    } else {
      throw new Error("Kullanıcı bilgileri bulunamadı.");
    }
  } catch (error: any) {
    console.error("Giriş hatası:", error.message);
    throw new Error(error.message);
  }
};

// Çıkış fonksiyonu
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log("Kullanıcı çıkış yaptı");
  } catch (error: any) {
    console.error("Çıkış hatası:", error.message);
    throw new Error(error.message);
  }
};

// Kullanıcının oturum durumunu izle
export const onAuthStateChanged = (
  callback: (user: User | null) => void
) => {
  return auth.onAuthStateChanged(callback);
};

// Kullanıcı sayısını getir
export const getUserCount = async (): Promise<number> => {
  try {
    // Bu fonksiyon gerçek bir uygulamada Firebase Functions
    // veya bir agregasyon sorgusu kullanılarak yapılmalıdır
    // Burada basit bir şekilde simüle ediyoruz
    return 100; // Örnek bir değer dönüyoruz
  } catch (error: any) {
    console.error("Kullanıcı sayısı alma hatası:", error.message);
    throw new Error(error.message);
  }
};

// Kullanıcı bakiyesini güncelle
export const updateUserBalance = async (
  userId: string, 
  amount: number
): Promise<FirebaseUser> => {
  try {
    // Kullanıcı bilgilerini al
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      throw new Error("Kullanıcı bulunamadı.");
    }
    
    const userData = userDoc.data() as FirebaseUser;
    const newBalance = userData.balance + amount;
    
    // Bakiyeyi güncelle
    await setDoc(
      doc(db, "users", userId), 
      { ...userData, balance: newBalance },
      { merge: true }
    );
    
    return {
      ...userData,
      balance: newBalance
    };
  } catch (error: any) {
    console.error("Bakiye güncelleme hatası:", error.message);
    throw new Error(error.message);
  }
};
