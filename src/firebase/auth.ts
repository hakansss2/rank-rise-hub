
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { auth, db } from "./config";

// Kullanıcı arayüzü
export interface FirebaseUser {
  id: string;
  email: string | null;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

// Bağlantı durumunu kontrol et
const checkConnection = async () => {
  if (!window.navigator.onLine) {
    throw new Error("İnternet bağlantısı bulunamadı.");
  }
  
  try {
    // Firestore bağlantısını test et
    const q = query(collection(db, "connection_test"), where("test", "==", true), limit(1));
    await getDocs(q);
    return true;
  } catch (error) {
    console.error("Firebase bağlantı hatası:", error);
    throw new Error("Firebase'e bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.");
  }
};

// Kayıt fonksiyonu
export const registerUser = async (
  email: string, 
  username: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    console.log("Kayıt işlemi başlatılıyor:", email);
    
    // Bağlantı kontrolü
    await checkConnection();
    
    // Admin için özel durum
    if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
      console.log("Admin hesabı tespit edildi, özel giriş yapılıyor");
      return {
        id: "admin-user-id",
        email: "hakan200505@gmail.com",
        username: "admin",
        role: "admin",
        balance: 5000
      };
    }
    
    // Firebase Authentication ile kullanıcı oluştur
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Firebase Auth hesabı oluşturuldu:", userCredential.user.uid);
    
    const user = userCredential.user;
    
    // Kullanıcı bilgilerini Firestore'a kaydet
    const userData: FirebaseUser = {
      id: user.uid,
      email: user.email,
      username,
      role: "customer",
      balance: 0
    };
    
    try {
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Kullanıcı Firestore'a kaydedildi:", user.uid);
    } catch (firestoreError) {
      console.error("Firestore kaydı sırasında hata:", firestoreError);
      throw new Error("Kullanıcı profili oluşturulamadı: " + firestoreError.message);
    }
    
    console.log("Kullanıcı başarıyla kaydedildi:", userData);
    return userData;
  } catch (error: any) {
    console.error("Kayıt hatası:", error.code, error.message);
    
    // Firebase hata kodlarını daha anlaşılır hata mesajlarına çevir
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Bu e-posta adresi zaten kullanımda.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Geçersiz e-posta formatı.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Şifre çok zayıf. En az 6 karakter olmalıdır.");
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error("Ağ hatası. İnternet bağlantınızı kontrol edin.");
    }
    
    throw new Error(error.message || "Kayıt sırasında beklenmeyen bir hata oluştu.");
  }
};

// Giriş fonksiyonu
export const loginUser = async (
  email: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    // Admin kontrolü
    if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
      return {
        id: "admin-user-id",
        email: "hakan200505@gmail.com",
        username: "admin",
        role: "admin",
        balance: 5000
      };
    }
    
    // Bağlantı kontrolü
    await checkConnection();
    
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
  return firebaseOnAuthStateChanged(auth, callback);
};

// Kullanıcı sayısını getir
export const getUserCount = async (): Promise<number> => {
  try {
    // Bağlantı kontrolü
    try {
      await checkConnection();
    } catch (error) {
      return 0; // Bağlantı yoksa 0 dön
    }
    
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.size;
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
    // Bağlantı kontrolü
    await checkConnection();
    
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
