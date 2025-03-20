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

// API_BASE_URL artık sadece eski Mongo API'si için kullanılır, Firebase doğrudan erişilecek
export const API_BASE_URL = getApiBaseUrl();

// Yanıt türleri için arayüzler (Firebase'den dönecek)
export type UserResponse = FirebaseUser;
export type OrderResponse = FirebaseOrder;
export type MessageResponse = FirebaseMessage;

// Firebase tabanlı auth API
export const authApi = {
  login: async (email: string, password: string): Promise<UserResponse> => {
    try {
      console.log(`🔐 Login attempt for: ${email}`);
      
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
        console.log("🔓 Admin login successful");
        return adminUser;
      }
      
      // Normal kullanıcı girişi
      const userData = await loginUser(email, password);
      localStorage.setItem('valorant_user', JSON.stringify(userData));
      console.log(`🔓 User login successful: ${userData.username}`);
      return userData;
    } catch (error: any) {
      console.error('❌ Giriş başarısız:', error);
      throw error; // Orijinal hatayı ilet
    }
  },
  
  register: async (email: string, username: string, password: string): Promise<UserResponse> => {
    try {
      console.log(`📝 Register attempt: ${email}, ${username}`);
      const userData = await registerUser(email, username, password);
      localStorage.setItem('valorant_user', JSON.stringify(userData));
      console.log(`✅ Registration successful: ${userData.username}`);
      return userData;
    } catch (error: any) {
      console.error('❌ Kayıt başarısız:', error);
      throw error; // Orijinal hatayı ilet
    }
  },
    
  getUserCount: async (): Promise<{count: number}> => {
    try {
      const count = await getUserCount();
      return { count };
    } catch (error: any) {
      console.error('❌ Kullanıcı sayısı alınamadı:', error);
      return { count: 0 };
    }
  },
  
  signOut: async (): Promise<void> => {
    try {
      localStorage.removeItem('valorant_user');
      await firebaseSignOut();
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
      const updatedUser = await updateUserBalance(userId, amount);
      
      // Eğer bu aktif kullanıcı ise, oturum bilgisini de güncelle
      const userJson = localStorage.getItem('valorant_user');
      if (userJson) {
        const currentUser = JSON.parse(userJson);
        if (currentUser.id === userId) {
          currentUser.balance = updatedUser.balance;
          localStorage.setItem('valorant_user', JSON.stringify(currentUser));
        }
      }
      
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Bakiye güncellenemedi:', error);
      throw error;
    }
  },
  
  uploadProfileImage: async (userId: string, file: File): Promise<string> => {
    try {
      return await uploadProfileImage(userId, file);
    } catch (error: any) {
      console.error('❌ Profil resmi yüklenemedi:', error);
      throw error;
    }
  },
};

// Firebase tabanlı sipariş API
export const orderApi = {
  getOrders: async (): Promise<OrderResponse[]> => {
    try {
      return await getOrders();
    } catch (error: any) {
      console.error('❌ Siparişler alınamadı:', error);
      throw new Error(error.message || 'Siparişler alınamadı');
    }
  },
  
  createOrder: async (orderData: any): Promise<OrderResponse> => {
    try {
      return await createOrder(orderData);
    } catch (error: any) {
      console.error('❌ Sipariş oluşturulamadı:', error);
      throw new Error(error.message || 'Sipariş oluşturulamadı');
    }
  },
  
  updateOrder: async (orderId: string, updateData: any): Promise<OrderResponse> => {
    try {
      return await updateOrder(orderId, updateData);
    } catch (error: any) {
      console.error('❌ Sipariş güncellenemedi:', error);
      throw new Error(error.message || 'Sipariş güncellenemedi');
    }
  },
  
  sendMessage: async (orderId: string, messageData: any): Promise<MessageResponse> => {
    try {
      return await sendMessage(orderId, messageData);
    } catch (error: any) {
      console.error('❌ Mesaj gönderilemedi:', error);
      throw new Error(error.message || 'Mesaj gönderilemedi');
    }
  },
  
  uploadProofImage: async (orderId: string, file: File): Promise<string> => {
    try {
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
      return await uploadFile(file, path);
    } catch (error: any) {
      console.error('❌ Dosya yüklenemedi:', error);
      throw new Error(error.message || 'Dosya yüklenemedi');
    }
  },
  
  deleteFile: async (fileUrl: string): Promise<void> => {
    try {
      await deleteFile(fileUrl);
    } catch (error: any) {
      console.error('❌ Dosya silinemedi:', error);
      throw new Error(error.message || 'Dosya silinemedi');
    }
  },
};
