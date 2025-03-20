
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
      throw new Error(error.message);
    }
    
    console.log(`${data.length} sipariş bulundu`);
    return data as SupabaseOrder[];
  } catch (error: any) {
    console.error("Sipariş getirme hatası:", error.message);
    throw new Error(error.message);
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
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();
    
    if (error) {
      console.error("Sipariş oluşturma hatası:", error.message);
      throw new Error(error.message);
    }
    
    return data as SupabaseOrder;
  } catch (error: any) {
    console.error("Sipariş oluşturma hatası:", error.message);
    throw new Error(error.message);
  }
};

// Sipariş güncelle
export const updateOrder = async (
  orderId: string, 
  updateData: Partial<SupabaseOrder>
): Promise<SupabaseOrder> => {
  try {
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
    
    return data as SupabaseOrder;
  } catch (error: any) {
    console.error("Sipariş güncelleme hatası:", error.message);
    throw new Error(error.message);
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
    
    return newMessage;
  } catch (error: any) {
    console.error("Mesaj gönderme hatası:", error.message);
    throw new Error(error.message);
  }
};
