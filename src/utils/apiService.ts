
// Firebase tabanlı API servisi
import { getApiBaseUrl } from './environment';
import { 
  registerUser, 
  loginUser, 
  getUserCount,
  updateUserBalance,
  FirebaseUser,
  signOut as firebaseSignOut
} from '../firebase/auth';
import {
  getOrders,
  createOrder,
  updateOrder,
  sendMessage,
  FirebaseOrder,
  FirebaseMessage
} from '../firebase/orders';
import {
  uploadFile,
  uploadProfileImage,
  uploadBoostProofImage,
  deleteFile
} from '../firebase/storage';
import { setData, getData, STORAGE_KEYS } from './storageService';

// API_BASE_URL artık sadece eski Mongo API'si için kullanılır, Firebase doğrudan erişilecek
export const API_BASE_URL = getApiBaseUrl();

// Yanıt türleri için arayüzler (Firebase'den dönecek)
export type UserResponse = FirebaseUser;
export type OrderResponse = FirebaseOrder;
export type MessageResponse = FirebaseMessage;

// Çevrimdışı durumu kontrol et
const isOffline = () => !window.navigator.onLine;

// Firebase tabanlı auth API
export const authApi = {
  login: async (email: string, password: string): Promise<UserResponse> => {
    try {
      // Admin girişi için özel durum kontrolü
      if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
        const adminUser = {
          id: "admin-user-id",
          email: "hakan200505@gmail.com",
          username: "admin",
          role: "admin" as const,
          balance: 5000
        };
        
        // Admin bilgilerini localStorage'a kaydet
        localStorage.setItem('valorant_user', JSON.stringify(adminUser));
        return adminUser;
      }
      
      // Normal kullanıcı girişi
      if (isOffline()) {
        // Çevrimdışıysa ve hesap localStorage'da kayıtlıysa izin ver
        console.log('⚠️ Çevrimdışı mod - localStorage kontrolü yapılıyor');
        const registeredUsers = getData(STORAGE_KEYS.USERS, []) as any[];
        const user = registeredUsers.find(u => u.email === email);
        
        if (user && user.password === password) {
          const userData = { ...user };
          delete userData.password;
          
          localStorage.setItem('valorant_user', JSON.stringify(userData));
          return userData;
        }
        throw new Error("Çevrimdışı modda giriş başarısız veya kullanıcı bulunamadı.");
      }
      
      return await loginUser(email, password);
    } catch (error: any) {
      console.error('❌ Giriş başarısız:', error);
      throw new Error(error.message || 'Giriş yapılamadı');
    }
  },
  
  register: async (email: string, username: string, password: string): Promise<UserResponse> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage kayıt yapılıyor');
        
        // Çevrimdışı kayıt için yerel depolama kullan
        const registeredUsers = getData(STORAGE_KEYS.USERS, []) as any[];
        
        // E-posta kontrolü
        if (registeredUsers.some(u => u.email === email)) {
          throw new Error("Bu e-posta adresi zaten kullanılıyor.");
        }
        
        const newUser = {
          id: Date.now().toString(),
          email,
          username,
          password, // Çevrimdışı mod için şifreyi açık metinde saklıyoruz
          role: "customer" as const,
          balance: 0
        };
        
        // Kullanıcıyı yerel depolamaya kaydet
        registeredUsers.push(newUser);
        setData(STORAGE_KEYS.USERS, registeredUsers);
        
        // Şifreyi yanıtta siliyoruz
        const userData = { ...newUser };
        delete userData.password;
        
        // Oturum bilgisini ayarla
        localStorage.setItem('valorant_user', JSON.stringify(userData));
        
        return userData;
      }
      
      return await registerUser(email, username, password);
    } catch (error: any) {
      console.error('❌ Kayıt başarısız:', error);
      throw new Error(error.message || 'Kayıt yapılamadı');
    }
  },
    
  getUserCount: async (): Promise<{count: number}> => {
    try {
      if (isOffline()) {
        const registeredUsers = getData(STORAGE_KEYS.USERS, []) as any[];
        return { count: registeredUsers.length };
      }
      
      const count = await getUserCount();
      return { count };
    } catch (error: any) {
      console.error('❌ Kullanıcı sayısı alınamadı:', error);
      throw new Error(error.message || 'Kullanıcı sayısı alınamadı');
    }
  },
  
  signOut: async (): Promise<void> => {
    try {
      localStorage.removeItem('valorant_user');
      if (!isOffline()) {
        await firebaseSignOut();
      }
      console.log("Kullanıcı çıkış yaptı");
    } catch (error: any) {
      console.error("Çıkış hatası:", error.message);
      throw new Error(error.message || 'Çıkış yapılamadı');
    }
  }
};

// Firebase tabanlı kullanıcı API
export const userApi = {
  updateBalance: async (userId: string, amount: number): Promise<UserResponse> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage bakiye güncelleniyor');
        const registeredUsers = getData(STORAGE_KEYS.USERS, []) as any[];
        const userIndex = registeredUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new Error("Kullanıcı bulunamadı.");
        }
        
        registeredUsers[userIndex].balance += amount;
        setData(STORAGE_KEYS.USERS, registeredUsers);
        
        // Eğer bu aktif kullanıcı ise, oturum bilgisini de güncelle
        const userJson = localStorage.getItem('valorant_user');
        if (userJson) {
          const currentUser = JSON.parse(userJson);
          if (currentUser.id === userId) {
            currentUser.balance += amount;
            localStorage.setItem('valorant_user', JSON.stringify(currentUser));
          }
        }
        
        return registeredUsers[userIndex];
      }
      
      return await updateUserBalance(userId, amount);
    } catch (error: any) {
      console.error('❌ Bakiye güncellenemedi:', error);
      throw new Error(error.message || 'Bakiye güncellenemedi');
    }
  },
  
  uploadProfileImage: async (userId: string, file: File): Promise<string> => {
    try {
      if (isOffline()) {
        throw new Error("Çevrimdışı modda resim yüklenemez.");
      }
      
      return await uploadProfileImage(userId, file);
    } catch (error: any) {
      console.error('❌ Profil resmi yüklenemedi:', error);
      throw new Error(error.message || 'Profil resmi yüklenemedi');
    }
  },
};

// Firebase tabanlı sipariş API
export const orderApi = {
  getOrders: async (): Promise<OrderResponse[]> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage siparişler alınıyor');
        return getData(STORAGE_KEYS.ORDERS, []);
      }
      
      return await getOrders();
    } catch (error: any) {
      console.error('❌ Siparişler alınamadı:', error);
      throw new Error(error.message || 'Siparişler alınamadı');
    }
  },
  
  createOrder: async (orderData: any): Promise<OrderResponse> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage sipariş oluşturuluyor');
        const orders = getData(STORAGE_KEYS.ORDERS, []) as OrderResponse[];
        
        const newOrder = {
          id: Date.now().toString(),
          ...orderData,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
          messages: []
        };
        
        orders.push(newOrder);
        setData(STORAGE_KEYS.ORDERS, orders);
        
        return newOrder;
      }
      
      return await createOrder(orderData);
    } catch (error: any) {
      console.error('❌ Sipariş oluşturulamadı:', error);
      throw new Error(error.message || 'Sipariş oluşturulamadı');
    }
  },
  
  updateOrder: async (orderId: string, updateData: any): Promise<OrderResponse> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage sipariş güncelleniyor');
        const orders = getData(STORAGE_KEYS.ORDERS, []) as OrderResponse[];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
          throw new Error("Sipariş bulunamadı.");
        }
        
        const updatedOrder = {
          ...orders[orderIndex],
          ...updateData
        };
        
        orders[orderIndex] = updatedOrder;
        setData(STORAGE_KEYS.ORDERS, orders);
        
        return updatedOrder;
      }
      
      return await updateOrder(orderId, updateData);
    } catch (error: any) {
      console.error('❌ Sipariş güncellenemedi:', error);
      throw new Error(error.message || 'Sipariş güncellenemedi');
    }
  },
  
  sendMessage: async (orderId: string, messageData: any): Promise<MessageResponse> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - localStorage mesaj gönderiliyor');
        const orders = getData(STORAGE_KEYS.ORDERS, []) as OrderResponse[];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
          throw new Error("Sipariş bulunamadı.");
        }
        
        const newMessage = {
          id: Date.now().toString(),
          ...messageData,
          timestamp: new Date().toISOString()
        };
        
        if (!orders[orderIndex].messages) {
          orders[orderIndex].messages = [];
        }
        
        orders[orderIndex].messages.push(newMessage);
        setData(STORAGE_KEYS.ORDERS, orders);
        
        return newMessage;
      }
      
      return await sendMessage(orderId, messageData);
    } catch (error: any) {
      console.error('❌ Mesaj gönderilemedi:', error);
      throw new Error(error.message || 'Mesaj gönderilemedi');
    }
  },
  
  uploadProofImage: async (orderId: string, file: File): Promise<string> => {
    try {
      if (isOffline()) {
        throw new Error("Çevrimdışı modda resim yüklenemez.");
      }
      
      return await uploadBoostProofImage(orderId, file);
    } catch (error: any) {
      console.error('❌ Kanıt resmi yüklenemedi:', error);
      throw new Error(error.message || 'Kanıt resmi yüklenemedi');
    }
  },
};

// Firebase tabanlı storage API
export const storageApi = {
  uploadFile: async (file: File, path: string): Promise<string> => {
    try {
      if (isOffline()) {
        throw new Error("Çevrimdışı modda dosya yüklenemez.");
      }
      
      return await uploadFile(file, path);
    } catch (error: any) {
      console.error('❌ Dosya yüklenemedi:', error);
      throw new Error(error.message || 'Dosya yüklenemedi');
    }
  },
  
  deleteFile: async (fileUrl: string): Promise<void> => {
    try {
      if (isOffline()) {
        console.log('⚠️ Çevrimdışı mod - dosya silme ertelendi');
        return;
      }
      
      await deleteFile(fileUrl);
    } catch (error: any) {
      console.error('❌ Dosya silinemedi:', error);
      throw new Error(error.message || 'Dosya silinemedi');
    }
  },
};
