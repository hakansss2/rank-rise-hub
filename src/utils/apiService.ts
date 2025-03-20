
// Firebase tabanlı API servisi
import { getApiBaseUrl } from './environment';
import { 
  registerUser, 
  loginUser, 
  getUserCount,
  updateUserBalance,
  FirebaseUser
} from '../firebase/auth';
import {
  getOrders,
  createOrder,
  updateOrder,
  sendMessage,
  FirebaseOrder,
  FirebaseMessage
} from '../firebase/orders';

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
      return await loginUser(email, password);
    } catch (error: any) {
      console.error('❌ Giriş başarısız:', error);
      throw new Error(error.message || 'Giriş yapılamadı');
    }
  },
  
  register: async (email: string, username: string, password: string): Promise<UserResponse> => {
    try {
      return await registerUser(email, username, password);
    } catch (error: any) {
      console.error('❌ Kayıt başarısız:', error);
      throw new Error(error.message || 'Kayıt yapılamadı');
    }
  },
    
  getUserCount: async (): Promise<{count: number}> => {
    try {
      const count = await getUserCount();
      return { count };
    } catch (error: any) {
      console.error('❌ Kullanıcı sayısı alınamadı:', error);
      throw new Error(error.message || 'Kullanıcı sayısı alınamadı');
    }
  },
};

// Firebase tabanlı kullanıcı API
export const userApi = {
  updateBalance: async (userId: string, amount: number): Promise<UserResponse> => {
    try {
      return await updateUserBalance(userId, amount);
    } catch (error: any) {
      console.error('❌ Bakiye güncellenemedi:', error);
      throw new Error(error.message || 'Bakiye güncellenemedi');
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
};
