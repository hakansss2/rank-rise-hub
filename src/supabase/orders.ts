
import { supabase } from './client';

// Sipariş arayüzü
export interface SupabaseOrder {
  id: string;
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  boosterId?: string;
  boosterUsername?: string;
  createdAt: string;
  messages: SupabaseMessage[];
  gameUsername?: string;
  gamePassword?: string;
}

// Mesaj arayüzü
export interface SupabaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// Tüm siparişleri getir
export const getOrders = async (): Promise<SupabaseOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error("Sipariş getirme hatası:", error.message);
      if (error.message.includes('does not exist')) {
        console.log("Orders tablosu bulunamadı, boş liste dönülüyor");
        return [];
      }
      throw new Error(error.message);
    }
    
    if (!data) {
      return [];
    }
    
    console.log(`${data.length} sipariş bulundu`);
    return data as SupabaseOrder[];
  } catch (error: any) {
    console.error("Sipariş getirme hatası:", error.message);
    return []; // Hata durumunda boş liste dön
  }
};

// Yeni sipariş oluştur
export const createOrder = async (orderData: {
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  gameUsername?: string;
  gamePassword?: string;
}): Promise<SupabaseOrder> => {
  try {
    const newOrder = {
      userId: orderData.userId,
      currentRank: orderData.currentRank,
      targetRank: orderData.targetRank,
      price: orderData.price,
      gameUsername: orderData.gameUsername || '',
      gamePassword: orderData.gamePassword || '',
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    console.log("Yeni sipariş oluşturuluyor:", newOrder);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();
    
    if (error) {
      console.error("Sipariş oluşturma hatası:", error.message);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error("Sipariş oluşturuldu ancak veri alınamadı");
    }
    
    console.log("Sipariş başarıyla oluşturuldu:", data.id);
    return data as SupabaseOrder;
  } catch (error: any) {
    console.error("Sipariş oluşturma hatası:", error.message);
    throw new Error(error.message || "Sipariş oluştururken beklenmeyen bir hata oluştu");
  }
};

// Sipariş güncelle
export const updateOrder = async (
  orderId: string, 
  updateData: Partial<SupabaseOrder>
): Promise<SupabaseOrder> => {
  try {
    console.log("Sipariş güncelleniyor:", orderId, updateData);
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error("Sipariş güncelleme hatası:", error.message);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error("Sipariş güncellendi ancak veri alınamadı");
    }
    
    console.log("Sipariş başarıyla güncellendi");
    return data as SupabaseOrder;
  } catch (error: any) {
    console.error("Sipariş güncelleme hatası:", error.message);
    throw new Error(error.message || "Sipariş güncellenirken beklenmeyen bir hata oluştu");
  }
};

// Siparişe mesaj ekle
export const sendMessage = async (
  orderId: string,
  messageData: {
    senderId: string;
    senderName: string;
    content: string;
  }
): Promise<SupabaseMessage> => {
  try {
    console.log("Siparişe mesaj ekleniyor:", orderId);
    
    // Önce mevcut siparişi ve mesajlarını al
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('messages')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      console.error("Sipariş bulunamadı:", fetchError.message);
      throw new Error("Sipariş bulunamadı");
    }
    
    if (!existingOrder) {
      throw new Error("Sipariş bulunamadı");
    }
    
    // Yeni mesajı oluştur
    const newMessage: SupabaseMessage = {
      id: Date.now().toString(),
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    // Mevcut mesajlara ekle
    const messages = [...(existingOrder.messages || []), newMessage];
    
    // Mesajları güncelle
    const { error: updateError } = await supabase
      .from('orders')
      .update({ messages })
      .eq('id', orderId);
    
    if (updateError) {
      console.error("Mesaj gönderme hatası:", updateError.message);
      throw new Error(updateError.message);
    }
    
    console.log("Mesaj başarıyla gönderildi");
    return newMessage;
  } catch (error: any) {
    console.error("Mesaj gönderme hatası:", error.message);
    throw new Error(error.message || "Mesaj gönderilirken beklenmeyen bir hata oluştu");
  }
};

// Belirli bir kullanıcının siparişlerini getir
export const getUserOrders = async (userId: string): Promise<SupabaseOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error("Kullanıcı siparişleri getirme hatası:", error.message);
      return [];
    }
    
    return data as SupabaseOrder[] || [];
  } catch (error: any) {
    console.error("Kullanıcı siparişleri getirme hatası:", error.message);
    return [];
  }
};

// Belirli bir siparişi ID'ye göre getir
export const getOrderById = async (orderId: string): Promise<SupabaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error("Sipariş getirme hatası:", error.message);
      return null;
    }
    
    return data as SupabaseOrder;
  } catch (error: any) {
    console.error("Sipariş getirme hatası:", error.message);
    return null;
  }
};
