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

// Orders tablosunu başlatma/kontrol etme
export const initializeOrdersTable = async (): Promise<boolean> => {
  try {
    console.log("Orders tablosu kontrol ediliyor...");
    
    // Tablo var mı kontrol et
    const { error: checkError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log("Orders tablosu mevcut.");
      return true;
    }
    
    console.log("Orders tablosu oluşturuluyor...");
    
    // Safe error check - ensure error property exists and has a message property
    if (checkError && typeof checkError === 'object' && checkError.message) {
      if (checkError.message.includes('does not exist')) {
        console.log("Orders tablosu bulunamadı, oluşturma denemesi yapılacak");
        
        // Tablo oluşturmayı dene
        try {
          // SQL ile tablo oluşturma girişimi
          const { error: createError } = await supabase.rpc('create_orders_table');
          
          if (!createError) {
            console.log("Orders tablosu başarıyla oluşturuldu!");
            return true;
          }
          
          // Dummy order verisi oluştur
          const { error: insertError } = await supabase
            .from('orders')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000',
              current_rank: 0,
              target_rank: 0,
              price: 0,
              status: 'system',
              created_at: new Date().toISOString(),
              messages: []
            });
          
          if (!insertError) {
            console.log("Orders tablosu başarıyla oluşturuldu!");
            return true;
          } else {
            // Tablo oluşturulamadı, localStorage kullanılacak
            console.error("Orders tablosu oluşturma hatası:", insertError.message);
            return false;
          }
        } catch (e: any) {
          console.error("SQL işlemi hatası:", e?.message || e);
          return false;
        }
      } else {
        console.error("Tablo kontrolünde beklenmeyen hata:", checkError.message);
        return false;
      }
    } else {
      console.error("Beklenmeyen hata formatı:", checkError);
      return false;
    }
  } catch (error: any) {
    console.error("Orders tablosu başlatma hatası:", error?.message || error);
    return false;
  }
  
  return false; // Default return eğer hiçbir koşul karşılanmazsa
};

// Tüm siparişleri getir
export const getOrders = async (): Promise<SupabaseOrder[]> => {
  try {
    // Önce tabloyu kontrol et ve oluştur
    const tableExists = await initializeOrdersTable();
    
    if (!tableExists) {
      console.log("Orders tablosu bulunamadı, boş liste dönülüyor");
      return [];
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
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
    
    // Veri alanlarını doğru isimlendirmeye dönüştür
    const formattedOrders = data.map(order => ({
      id: order.id,
      userId: order.user_id,
      currentRank: order.current_rank,
      targetRank: order.target_rank,
      price: order.price,
      status: order.status,
      boosterId: order.booster_id,
      boosterUsername: order.booster_username,
      createdAt: order.created_at,
      messages: order.messages || [],
      gameUsername: order.game_username,
      gamePassword: order.game_password
    }));
    
    console.log(`${formattedOrders.length} sipariş bulundu`);
    return formattedOrders;
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
    console.log("Yeni sipariş oluşturuluyor:", orderData);
    
    // Supabase için alan adlarını dönüştür (camelCase -> snake_case)
    const newOrder = {
      user_id: orderData.userId,
      current_rank: orderData.currentRank,
      target_rank: orderData.targetRank,
      price: orderData.price,
      game_username: orderData.gameUsername || '',
      game_password: orderData.gamePassword || '',
      status: "pending" as const,
      created_at: new Date().toISOString(),
      messages: []
    };
    
    // Önce tabloyu kontrol et
    const tableExists = await initializeOrdersTable();
    if (!tableExists) {
      throw new Error("Orders tablosu oluşturulamadı");
    }
    
    // Siparişi oluştur
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();
    
    if (error) {
      console.error("Sipariş oluşturma hatası:", error.message);
      throw new Error("Supabase sipariş oluşturulamadı: " + error.message);
    }
    
    if (!data) {
      throw new Error("Sipariş oluşturuldu ancak veri alınamadı");
    }
    
    // Response'u doğru formata dönüştür
    const formattedOrder: SupabaseOrder = {
      id: data.id,
      userId: data.user_id,
      currentRank: data.current_rank,
      targetRank: data.target_rank,
      price: data.price,
      status: data.status,
      boosterId: data.booster_id,
      boosterUsername: data.booster_username,
      createdAt: data.created_at,
      messages: data.messages || [],
      gameUsername: data.game_username,
      gamePassword: data.game_password
    };
    
    // Başarılı oluşturulduğunda localStorage'a da kaydet (yedekleme)
    try {
      const localStorageKey = 'orders';
      let existingOrders = [];
      const storedOrders = localStorage.getItem(localStorageKey);
      
      if (storedOrders) {
        existingOrders = JSON.parse(storedOrders);
      }
      
      existingOrders.unshift(formattedOrder);
      localStorage.setItem(localStorageKey, JSON.stringify(existingOrders));
      console.log("Sipariş ayrıca localStorage'a da kaydedildi:", formattedOrder.id);
    } catch (localError) {
      console.error("localStorage'a kaydetme hatası:", localError);
    }
    
    console.log("Sipariş başarıyla oluşturuldu:", formattedOrder.id);
    return formattedOrder;
  } catch (error: any) {
    console.error("Sipariş oluşturma hatası:", error);
    
    // Hata durumunda localStorage'a kaydet ve oluşturulan siparişi geri döndür
    const fallbackOrder: SupabaseOrder = {
      id: "supabase-offline-" + Date.now().toString(),
      userId: orderData.userId,
      currentRank: orderData.currentRank,
      targetRank: orderData.targetRank,
      price: orderData.price,
      status: "pending",
      createdAt: new Date().toISOString(),
      messages: [],
      gameUsername: orderData.gameUsername,
      gamePassword: orderData.gamePassword
    };
    
    // localStorage'a kaydet
    try {
      const localStorageKey = 'orders';
      let existingOrders = [];
      const storedOrders = localStorage.getItem(localStorageKey);
      
      if (storedOrders) {
        existingOrders = JSON.parse(storedOrders);
      }
      
      existingOrders.unshift(fallbackOrder);
      localStorage.setItem(localStorageKey, JSON.stringify(existingOrders));
      console.log("Supabase hatası: Sipariş sadece localStorage'a kaydedildi:", fallbackOrder.id);
    } catch (localError) {
      console.error("localStorage'a kaydetme hatası:", localError);
    }
    
    return fallbackOrder;
  }
};

// Sipariş güncelle
export const updateOrder = async (
  orderId: string, 
  updateData: Partial<SupabaseOrder>
): Promise<SupabaseOrder> => {
  try {
    console.log("Sipariş güncelleniyor:", orderId, updateData);
    
    // CamelCase'ten snake_case'e dönüştür
    const formattedUpdateData: any = {};
    
    if (updateData.userId !== undefined) formattedUpdateData.user_id = updateData.userId;
    if (updateData.currentRank !== undefined) formattedUpdateData.current_rank = updateData.currentRank;
    if (updateData.targetRank !== undefined) formattedUpdateData.target_rank = updateData.targetRank;
    if (updateData.price !== undefined) formattedUpdateData.price = updateData.price;
    if (updateData.status !== undefined) formattedUpdateData.status = updateData.status;
    if (updateData.boosterId !== undefined) formattedUpdateData.booster_id = updateData.boosterId;
    if (updateData.boosterUsername !== undefined) formattedUpdateData.booster_username = updateData.boosterUsername;
    if (updateData.messages !== undefined) formattedUpdateData.messages = updateData.messages;
    if (updateData.gameUsername !== undefined) formattedUpdateData.game_username = updateData.gameUsername;
    if (updateData.gamePassword !== undefined) formattedUpdateData.game_password = updateData.gamePassword;
    
    const { data, error } = await supabase
      .from('orders')
      .update(formattedUpdateData)
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
    
    // Response'u doğru formata dönüştür
    const formattedOrder: SupabaseOrder = {
      id: data.id,
      userId: data.user_id,
      currentRank: data.current_rank,
      targetRank: data.target_rank,
      price: data.price,
      status: data.status,
      boosterId: data.booster_id,
      boosterUsername: data.booster_username,
      createdAt: data.created_at,
      messages: data.messages || [],
      gameUsername: data.game_username,
      gamePassword: data.game_password
    };
    
    console.log("Sipariş başarıyla güncellendi");
    return formattedOrder;
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Kullanıcı siparişleri getirme hatası:", error.message);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    // Veri alanlarını doğru isimlendirmeye dönüştür
    const formattedOrders = data.map(order => ({
      id: order.id,
      userId: order.user_id,
      currentRank: order.current_rank,
      targetRank: order.target_rank,
      price: order.price,
      status: order.status,
      boosterId: order.booster_id,
      boosterUsername: order.booster_username,
      createdAt: order.created_at,
      messages: order.messages || [],
      gameUsername: order.game_username,
      gamePassword: order.game_password
    }));
    
    return formattedOrders;
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
    
    if (!data) {
      return null;
    }
    
    // Veri alanlarını doğru isimlendirmeye dönüştür
    const formattedOrder: SupabaseOrder = {
      id: data.id,
      userId: data.user_id,
      currentRank: data.current_rank,
      targetRank: data.target_rank,
      price: data.price,
      status: data.status,
      boosterId: data.booster_id,
      boosterUsername: data.booster_username,
      createdAt: data.created_at,
      messages: data.messages || [],
      gameUsername: data.game_username,
      gamePassword: data.game_password
    };
    
    return formattedOrder;
  } catch (error: any) {
    console.error("Sipariş getirme hatası:", error.message);
    return null;
  }
};
