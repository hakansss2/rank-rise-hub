// Supabase tabanlı API servisi
import { getApiBaseUrl } from './environment';
import { 
  registerUser, 
  loginUser, 
  getUserCount,
  updateUserBalance,
  SupabaseUser,
  signOut as supabaseSignOut
} from '../supabase/auth';
import {
  getOrders as getSupabaseOrders,
  createOrder as createSupabaseOrder,
  updateOrder as updateSupabaseOrder,
  sendMessage as sendSupabaseMessage,
  SupabaseOrder,
  SupabaseMessage,
  initializeOrdersTable
} from '../supabase/orders';
import {
  uploadFile,
  uploadProfileImage,
  uploadBoostProofImage,
  deleteFile
} from '../supabase/storage';
import {
  getOrders as getFirebaseOrders,
  createOrder as createFirebaseOrder,
  updateOrder as updateFirebaseOrder,
  sendMessage as sendFirebaseMessage,
  checkFirebaseConnection
} from '../firebase/orders';

// API_BASE_URL artık sadece eski Mongo API'si için kullanılır
export const API_BASE_URL = getApiBaseUrl();

// Yanıt türleri için arayüzler (Supabase'den dönecek)
export type UserResponse = SupabaseUser;
export type OrderResponse = SupabaseOrder;
export type MessageResponse = SupabaseMessage;

// Supabase tabanlı auth API
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
      await supabaseSignOut();
      console.log("Kullanıcı çıkış yaptı");
    } catch (error: any) {
      console.error("Çıkış hatası:", error.message);
      throw new Error(error.message || 'Çıkış yapılamadı');
    }
  }
};

// Supabase tabanlı kullanıcı API
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

// Supabase ve Firebase tabanlı sipariş API
export const orderApi = {
  getOrders: async (): Promise<OrderResponse[]> => {
    try {
      // Önce Supabase'den almayı dene
      try {
        console.log('🔄 Supabase üzerinden siparişler alınıyor...');
        await initializeOrdersTable();
        const orders = await getSupabaseOrders();
        console.log(`✅ Supabase: ${orders.length} sipariş bulundu`);
        return orders;
      } catch (supabaseError) {
        console.error('❌ Supabase sipariş hatası, Firebase deneniyor:', supabaseError);
        
        // Supabase başarısız olursa Firebase'i dene
        const isFirebaseConnected = await checkFirebaseConnection();
        if (isFirebaseConnected) {
          console.log('🔄 Firebase üzerinden siparişler alınıyor...');
          const firebaseOrders = await getFirebaseOrders();
          console.log(`✅ Firebase: ${firebaseOrders.length} sipariş bulundu`);
          return firebaseOrders;
        } else {
          console.error('❌ Firebase bağlantısı kurulamadı');
          return []; // Boş liste dön
        }
      }
    } catch (error: any) {
      console.error('❌ Tüm sistemler başarısız, siparişler alınamadı:', error);
      return []; // Hata durumunda boş liste dön
    }
  },
  
  createOrder: async (orderData: any): Promise<OrderResponse> => {
    try {
      console.log('🔄 Sipariş oluşturma başlatılıyor...');
      
      // Önce Supabase'e kaydetmeyi dene
      try {
        console.log('🔄 Supabase üzerinde sipariş oluşturuluyor...');
        await initializeOrdersTable();
        const order = await createSupabaseOrder(orderData);
        console.log('✅ Supabase sipariş başarıyla oluşturuldu');
        return order;
      } catch (supabaseError) {
        console.error('❌ Supabase sipariş hatası, Firebase deneniyor:', supabaseError);
        
        // Firebase'i dene
        console.log('🔄 Firebase üzerinde sipariş oluşturuluyor...');
        const isFirebaseConnected = await checkFirebaseConnection();
        
        if (isFirebaseConnected) {
          const firebaseOrder = await createFirebaseOrder(orderData);
          console.log('✅ Firebase sipariş başarıyla oluşturuldu');
          return firebaseOrder;
        } else {
          console.error('❌ Firebase bağlantısı kurulamadı');
          throw new Error("Veritabanı bağlantısı sağlanamadı. Lütfen daha sonra tekrar deneyin.");
        }
      }
    } catch (error: any) {
      console.error('❌ Sipariş oluşturulamadı:', error);
      throw new Error(error.message || 'Sipariş oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
    }
  },
  
  updateOrder: async (orderId: string, updateData: any): Promise<OrderResponse> => {
    try {
      // Önce Supabase'de güncellemeyi dene
      try {
        console.log('🔄 Supabase üzerinde sipariş güncelleniyor...');
        const order = await updateSupabaseOrder(orderId, updateData);
        console.log('✅ Supabase sipariş başarıyla güncellendi');
        return order;
      } catch (supabaseError) {
        console.error('❌ Supabase güncelleme hatası, Firebase deneniyor:', supabaseError);
        
        // Firebase'i dene
        console.log('🔄 Firebase üzerinde sipariş güncelleniyor...');
        const firebaseOrder = await updateFirebaseOrder(orderId, updateData);
        console.log('✅ Firebase sipariş başarıyla güncellendi');
        return firebaseOrder;
      }
    } catch (error: any) {
      console.error('❌ Sipariş güncellenemedi:', error);
      throw new Error(error.message || 'Sipariş güncellenemedi');
    }
  },
  
  sendMessage: async (orderId: string, messageData: any): Promise<MessageResponse> => {
    try {
      // Önce Supabase'e mesaj göndermeyi dene
      try {
        console.log('🔄 Supabase üzerinde mesaj gönderiliyor...');
        const message = await sendSupabaseMessage(orderId, messageData);
        console.log('✅ Supabase mesaj başarıyla gönderildi');
        return message;
      } catch (supabaseError) {
        console.error('❌ Supabase mesaj hatası, Firebase deneniyor:', supabaseError);
        
        // Firebase'i dene
        console.log('🔄 Firebase üzerinde mesaj gönderiliyor...');
        const firebaseMessage = await sendFirebaseMessage(orderId, messageData);
        console.log('✅ Firebase mesaj başarıyla gönderildi');
        return firebaseMessage;
      }
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

// Supabase tabanlı storage API
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
