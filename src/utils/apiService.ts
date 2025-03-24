
import { getOrders as getSupabaseOrders, createOrder as createSupabaseOrder, updateOrder as updateSupabaseOrder, sendMessage as sendSupabaseMessage } from '../supabase/orders';
import { getOrders as getFirebaseOrders, createOrder as createFirebaseOrder, updateOrder as updateFirebaseOrder, sendMessage as sendFirebaseMessage } from '../firebase/orders';
import { toast } from '@/components/ui/use-toast';

// Sipariş arayüzü
export interface OrderResponse {
  id: string;
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  boosterId?: string;
  boosterUsername?: string;
  createdAt: string;
  messages: MessageResponse[];
  gameUsername?: string;
  gamePassword?: string;
}

// Mesaj arayüzü
export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// Veritabanı bağlantısı ve işlemleri için yardımcı API
export const orderApi = {
  // Tüm siparişleri getirme
  getOrders: async (): Promise<OrderResponse[]> => {
    console.log('🔄 Siparişler alınıyor...');
    
    try {
      // Önce Supabase'den siparişleri almaya çalış
      console.log('🔄 Supabase üzerinden siparişler alınıyor...');
      const supabaseOrders = await getSupabaseOrders();
      
      if (supabaseOrders && supabaseOrders.length > 0) {
        console.log('✅ Supabase:', supabaseOrders.length, 'sipariş bulundu');
        return supabaseOrders as OrderResponse[];
      }
      
      // Supabase'den veri alınamazsa Firebase'den almayı dene
      console.log('🔄 Firebase üzerinden siparişler alınıyor...');
      const firebaseOrders = await getFirebaseOrders();
      console.log('✅ Firebase:', firebaseOrders.length, 'sipariş bulundu');
      return firebaseOrders as OrderResponse[];
    } catch (error) {
      console.error('❌ Sipariş getirme hatası:', error);
      
      // Supabase hatası durumunda Firebase'e yönlendir
      try {
        console.log('🔄 Fallback: Firebase üzerinden siparişler alınıyor...');
        const firebaseOrders = await getFirebaseOrders();
        console.log('✅ Firebase fallback:', firebaseOrders.length, 'sipariş bulundu');
        return firebaseOrders as OrderResponse[];
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
        throw new Error('Siparişler alınamadı. Lütfen daha sonra tekrar deneyin.');
      }
    }
  },
  
  // Yeni sipariş oluşturma
  createOrder: async (orderData: {
    userId: string;
    currentRank: number;
    targetRank: number;
    price: number;
    gameUsername?: string;
    gamePassword?: string;
  }): Promise<OrderResponse> => {
    console.log('🔄 Yeni sipariş oluşturuluyor:', orderData);
    
    try {
      // Önce Supabase'de sipariş oluşturmayı dene
      console.log('Supabase üzerinden sipariş oluşturuluyor...');
      const supabaseOrder = await createSupabaseOrder(orderData);
      console.log('✅ Supabase sipariş başarıyla oluşturuldu:', supabaseOrder.id);
      return supabaseOrder as OrderResponse;
    } catch (error) {
      console.error('❌ Supabase sipariş oluşturma hatası:', error);
      
      // Supabase hatası durumunda Firebase'e yönlendir
      try {
        console.log('Fallback: Firebase ile sipariş oluşturuluyor...');
        const firebaseOrder = await createFirebaseOrder(orderData);
        console.log('✅ Firebase sipariş başarıyla oluşturuldu:', firebaseOrder.id);
        return firebaseOrder as OrderResponse;
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
        throw new Error('Sipariş oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
      }
    }
  },
  
  // Sipariş güncelleme
  updateOrder: async (
    orderId: string, 
    updateData: Partial<OrderResponse>
  ): Promise<OrderResponse> => {
    console.log('🔄 Sipariş güncelleniyor:', orderId, updateData);
    
    try {
      // Önce Supabase'de güncellemeyi dene
      console.log('Supabase üzerinden sipariş güncelleniyor...');
      const supabaseOrder = await updateSupabaseOrder(orderId, updateData);
      console.log('✅ Supabase sipariş başarıyla güncellendi:', orderId);
      return supabaseOrder as OrderResponse;
    } catch (error) {
      console.error('❌ Supabase sipariş güncelleme hatası:', error);
      
      // Supabase hatası durumunda Firebase'e yönlendir
      try {
        console.log('Fallback: Firebase ile sipariş güncelleniyor...');
        const firebaseOrder = await updateFirebaseOrder(orderId, updateData);
        console.log('✅ Firebase sipariş başarıyla güncellendi:', orderId);
        return firebaseOrder as OrderResponse;
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
        throw new Error('Sipariş güncellenemedi. Lütfen daha sonra tekrar deneyin.');
      }
    }
  },
  
  // Siparişe mesaj gönderme
  sendMessage: async (
    orderId: string,
    messageData: {
      senderId: string;
      senderName: string;
      content: string;
    }
  ): Promise<MessageResponse> => {
    console.log('🔄 Mesaj gönderiliyor:', orderId, messageData);
    
    try {
      // Önce Supabase'de mesaj göndermeyi dene
      console.log('Supabase üzerinden mesaj gönderiliyor...');
      const supabaseMessage = await sendSupabaseMessage(orderId, messageData);
      console.log('✅ Supabase mesaj başarıyla gönderildi');
      return supabaseMessage as MessageResponse;
    } catch (error) {
      console.error('❌ Supabase mesaj gönderme hatası:', error);
      
      // Supabase hatası durumunda Firebase'e yönlendir
      try {
        console.log('Fallback: Firebase ile mesaj gönderiliyor...');
        const firebaseMessage = await sendFirebaseMessage(orderId, messageData);
        console.log('✅ Firebase mesaj başarıyla gönderildi');
        return firebaseMessage as MessageResponse;
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
        throw new Error('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    }
  }
};
