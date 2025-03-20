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
    console.log("Firebase bağlantısı test ediliyor...");
    // Firestore bağlantısını test et - bu bir okuma operasyonu
    const testQuery = query(collection(db, "users"), limit(1));
    await getDocs(testQuery);
    console.log("Firebase bağlantısı başarılı");
    return true;
  } catch (error) {
    console.error("Firebase bağlantı hatası:", error);
    throw new Error("Firebase'e bağlanılamıyor. Lütfen daha sonra tekrar deneyin.");
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
    
    console.log("Firebase Auth hesabı oluşturuluyor...");
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
      console.log("Kullanıcı bilgileri Firestore'a kaydediliyor...");
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Kullanıcı Firestore'a kaydedildi:", user.uid);
    } catch (firestoreError) {
      console.error("Firestore kaydı sırasında hata:", firestoreError);
      // Kullanıcı oluşturuldu ancak profil oluşturulamadı, temizlik yap
      try {
        await user.delete();
        console.log("Auth kullanıcı silindi çünkü Firestore kaydı başarısız oldu");
      } catch (deleteError) {
        console.error("Kullanıcı silme hatası:", deleteError);
      }
      throw new Error("Kullanıcı profili oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
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
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error("E-posta/şifre girişi bu Firebase projesi için etkin değil.");
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
    console.log("Giriş işlemi başlatılıyor:", email);
    
    // Admin kontrolü
    if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
      console.log("Admin giriş başarılı");
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
    console.log("Firebase Auth ile giriş yapılıyor...");
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase Auth girişi başarılı");
    
    const user = userCredential.user;
    
    // Kullanıcı bilgilerini Firestore'dan al
    console.log("Kullanıcı verileri Firestore'dan alınıyor...");
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as FirebaseUser;
      console.log("Kullanıcı verileri başarıyla alındı");
      return userData;
    } else {
      console.error("Kullanıcı Firestore'da bulunamadı, senkronizasyon sorunu");
      
      // Kullanıcı Auth'da var ama Firestore'da yok, otomatik oluştur
      const newUserData: FirebaseUser = {
        id: user.uid,
        email: user.email,
        username: email.split('@')[0], // E-postadan basit bir kullanıcı adı oluştur
        role: "customer",
        balance: 0
      };
      
      await setDoc(doc(db, "users", user.uid), newUserData);
      console.log("Eksik Firestore kaydı oluşturuldu");
      
      return newUserData;
    }
  } catch (error: any) {
    console.error("Giriş hatası:", error.code, error.message);
    
    // Firebase hata kodlarını daha anlaşılır hata mesajlarına çevir
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("E-posta veya şifre hatalı.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Geçersiz e-posta formatı.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("Bu hesap devre dışı bırakılmış.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.");
    }
    
    throw new Error(error.message || "Giriş sırasında beklenmeyen bir hata oluştu.");
  }
};

// Çıkış fonksiyonu
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log("Kullanıcı çıkış yaptı");
  } catch (error: any) {
    console.error("Çıkış hatası:", error.message);
    throw new Error("Çıkış yapılırken bir hata oluştu.");
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
    console.log("Kullanıcı sayısı getiriliyor...");
    
    // Bağlantı kontrolü
    await checkConnection();
    
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const count = usersSnapshot.size;
    
    console.log(`${count} kullanıcı bulundu`);
    return count;
  } catch (error: any) {
    console.error("Kullanıcı sayısı alma hatası:", error.message);
    return 0; // Hata durumunda 0 dön
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
    throw new Error("Bakiye güncellenirken bir hata oluştu.");
  }
};
