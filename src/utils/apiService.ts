import { getOrders as getSupabaseOrders, createOrder as createSupabaseOrder, updateOrder as updateSupabaseOrder, sendMessage as sendSupabaseMessage } from '../supabase/orders';
import { getOrders as getFirebaseOrders, createOrder as createFirebaseOrder, updateOrder as updateFirebaseOrder, sendMessage as sendFirebaseMessage } from '../firebase/orders';
import { 
  registerUser, 
  loginUser, 
  signOut, 
  getUserCount, 
  updateUserBalance,
  FirebaseUser
} from '../firebase/auth';
import { toast } from '@/components/ui/use-toast';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

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

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export const authApi = {
  register: async (email: string, username: string, password: string): Promise<UserResponse> => {
    try {
      const userData = await registerUser(email, username, password);
      return userData as UserResponse;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },
  
  login: async (email: string, password: string): Promise<UserResponse> => {
    try {
      const userData = await loginUser(email, password);
      return userData as UserResponse;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  signOut: async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },
  
  getUserCount: async (): Promise<{count: number}> => {
    try {
      const count = await getUserCount();
      return { count };
    } catch (error) {
      console.error("Get user count error:", error);
      return { count: 0 };
    }
  }
};

export const userApi = {
  updateBalance: async (userId: string, amount: number): Promise<UserResponse> => {
    try {
      if (userId === "admin-user-id-1" || userId === "admin-user-id" || userId === "1") {
        console.log("Admin kullanıcısı için bakiye güncelleniyor");
        
        const adminUser = {
          id: "admin-user-id-1",
          email: "hakan200505@gmail.com",
          username: "admin",
          role: "admin" as const,
          balance: 5000 + amount
        };
        
        const stored = localStorage.getItem('valorant_user');
        if (stored) {
          const currentUser = JSON.parse(stored);
          if (currentUser.id === userId || currentUser.email === "hakan200505@gmail.com") {
            currentUser.balance = adminUser.balance;
            localStorage.setItem('valorant_user', JSON.stringify(currentUser));
          }
        }
        
        return adminUser;
      }
      
      try {
        const updatedUser = await updateUserBalance(userId, amount);
        return updatedUser as UserResponse;
      } catch (error) {
        console.error("Update balance error:", error);
        
        const stored = localStorage.getItem('valorant_user');
        if (stored) {
          const currentUser = JSON.parse(stored);
          if (currentUser.id === userId) {
            currentUser.balance = (currentUser.balance || 0) + amount;
            localStorage.setItem('valorant_user', JSON.stringify(currentUser));
            return currentUser as UserResponse;
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error("Update balance error:", error);
      throw error;
    }
  }
};

export const orderApi = {
  getOrders: async (): Promise<OrderResponse[]> => {
    console.log('🔄 Siparişler alınıyor...');
    
    const mockOrder: OrderResponse = {
      id: "mock-" + Date.now().toString(),
      userId: "admin-user-id-1",
      currentRank: 15, 
      targetRank: 20,
      price: 400,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [],
      gameUsername: "test-user",
      gamePassword: "test-pass"
    };
    
    try {
      try {
        const localOrders = localStorage.getItem('orders');
        if (localOrders) {
          const parsedOrders = JSON.parse(localOrders);
          if (parsedOrders && parsedOrders.length > 0) {
            console.log('✅ localStorage:', parsedOrders.length, 'sipariş bulundu');
            return parsedOrders;
          }
        }
      } catch (localError) {
        console.error('❌ localStorage sipariş getirme hatası:', localError);
      }
      
      console.log('🔄 Supabase üzerinden siparişler alınıyor...');
      try {
        const supabaseOrders = await getSupabaseOrders();
        
        if (supabaseOrders && supabaseOrders.length > 0) {
          console.log('✅ Supabase:', supabaseOrders.length, 'sipariş bulundu');
          
          try {
            localStorage.setItem('orders', JSON.stringify(supabaseOrders));
          } catch (e) {
            console.error('localStorage güncelleme hatası:', e);
          }
          
          return supabaseOrders as OrderResponse[];
        }
      } catch (supabaseError) {
        console.error('❌ Supabase sipariş getirme hatası:', supabaseError);
      }
      
      console.log('🔄 Firebase üzerinden siparişler alınıyor...');
      try {
        const firebaseOrders = await getFirebaseOrders();
        
        if (firebaseOrders && firebaseOrders.length > 0) {
          console.log('✅ Firebase:', firebaseOrders.length, 'sipariş bulundu');
          
          try {
            localStorage.setItem('orders', JSON.stringify(firebaseOrders));
          } catch (e) {
            console.error('localStorage güncelleme hatası:', e);
          }
          
          return firebaseOrders as OrderResponse[];
        }
        
        console.log('Firebase\'den 0 sipariş döndü');
      } catch (firebaseError) {
        console.error('❌ Firebase sipariş getirme hatası:', firebaseError);
      }
      
      try {
        const localOrders = localStorage.getItem('orders');
        if (localOrders) {
          const parsedOrders = JSON.parse(localOrders);
          console.log('✅ localStorage:', parsedOrders.length, 'sipariş bulundu');
          return parsedOrders;
        }
      } catch (localError) {
        console.error('❌ localStorage sipariş getirme hatası:', localError);
      }
      
      console.log('⚠️ Hiçbir yerden sipariş alınamadı, mock sipariş dönülüyor');
      
      try {
        saveOrderToLocalStorage(mockOrder);
        const orders = [mockOrder];
        localStorage.setItem('orders', JSON.stringify(orders));
      } catch (e) {
        console.error('Mock sipariş localStorage kayıt hatası:', e);
      }
      
      return [mockOrder];
    } catch (error) {
      console.error('❌ Sipariş getirme hatası:', error);
      
      console.log('⚠️ Genel hata nedeniyle mock sipariş dönülüyor');
      
      try {
        saveOrderToLocalStorage(mockOrder);
        const orders = [mockOrder];
        localStorage.setItem('orders', JSON.stringify(orders));
      } catch (e) {
        console.error('Mock sipariş localStorage kayıt hatası:', e);
      }
      
      return [mockOrder];
    }
  },
  
  createOrder: async (orderData: {
    userId: string;
    currentRank: number;
    targetRank: number;
    price: number;
    gameUsername?: string;
    gamePassword?: string;
  }): Promise<OrderResponse> => {
    console.log('🔄 Yeni sipariş oluşturuluyor:', orderData);
    
    const localOrder: OrderResponse = {
      id: "local-" + Date.now().toString(),
      userId: orderData.userId,
      currentRank: orderData.currentRank,
      targetRank: orderData.targetRank,
      price: orderData.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [],
      gameUsername: orderData.gameUsername,
      gamePassword: orderData.gamePassword
    };
    
    saveOrderToLocalStorage(localOrder);
    
    try {
      console.log('Supabase üzerinden sipariş oluşturuluyor...');
      try {
        const supabaseOrder = await createSupabaseOrder(orderData);
        if (supabaseOrder && supabaseOrder.id) {
          console.log('✅ Supabase sipariş başarıyla oluşturuldu:', supabaseOrder.id);
          
          const updatedOrder = {
            ...localOrder,
            id: supabaseOrder.id
          };
          
          updateOrderInLocalStorage(localOrder.id, updatedOrder);
          
          return updatedOrder as OrderResponse;
        }
      } catch (supabaseError) {
        console.error('❌ Supabase sipariş oluşturma hatası:', supabaseError);
      }
      
      console.log('Fallback: Firebase ile sipariş oluşturuluyor...');
      try {
        const firebaseOrder = await createFirebaseOrder(orderData);
        if (firebaseOrder && firebaseOrder.id) {
          console.log('✅ Firebase sipariş başarıyla oluşturuldu:', firebaseOrder.id);
          
          const updatedOrder = {
            ...localOrder,
            id: firebaseOrder.id
          };
          
          updateOrderInLocalStorage(localOrder.id, updatedOrder);
          
          return updatedOrder as OrderResponse;
        }
      } catch (firebaseError) {
        console.error('❌ Firebase fallback hatası:', firebaseError);
      }
      
      console.log('✅ Veri tabanları erişilemez, sipariş sadece localStorage\'a kaydedildi:', localOrder.id);
      
      return localOrder;
      
    } catch (error) {
      console.error('❌ Sipariş oluşturma hatası:', error);
      
      console.log('✅ Genel hata sonrası localStorage sipariş dönülüyor:', localOrder.id);
      
      try {
        const updatedLocalOrder = {
          ...localOrder, 
          id: "error-" + Date.now().toString()
        };
        
        updateOrderInLocalStorage(localOrder.id, updatedLocalOrder);
        return updatedLocalOrder;
      } catch (e) {
        console.error('Sipariş güncelleme hatası:', e);
      }
      
      return localOrder;
    }
  },
  
  updateOrder: async (
    orderId: string, 
    updateData: Partial<OrderResponse>
  ): Promise<OrderResponse> => {
    console.log('🔄 Sipariş güncelleniyor:', orderId, updateData);
    
    try {
      console.log('Supabase üzerinden sipariş güncelleniyor...');
      try {
        const supabaseOrder = await updateSupabaseOrder(orderId, updateData);
        console.log('✅ Supabase sipariş başarıyla güncellendi:', orderId);
        
        updateOrderInLocalStorage(orderId, updateData);
        
        return supabaseOrder as OrderResponse;
      } catch (supabaseError) {
        console.error('❌ Supabase sipariş güncelleme hatası:', supabaseError);
      }
      
      console.log('Fallback: Firebase ile sipariş güncelleniyor...');
      try {
        const firebaseOrder = await updateFirebaseOrder(orderId, updateData);
        console.log('✅ Firebase sipariş başarıyla güncellendi:', orderId);
        
        updateOrderInLocalStorage(orderId, updateData);
        
        return firebaseOrder as OrderResponse;
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
      }
      
      const updatedOrder = updateOrderInLocalStorage(orderId, updateData);
      if (updatedOrder) {
        return updatedOrder;
      }
      
      throw new Error('Sipariş güncellenemedi. Lütfen daha sonra tekrar deneyin.');
    } catch (error) {
      console.error('❌ Sipariş güncelleme hatası:', error);
      throw error;
    }
  },
  
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
      console.log('Supabase üzerinden mesaj gönderiliyor...');
      try {
        const supabaseMessage = await sendSupabaseMessage(orderId, messageData);
        console.log('✅ Supabase mesaj başarıyla gönderildi');
        
        addMessageToLocalStorage(orderId, supabaseMessage as MessageResponse);
        
        return supabaseMessage as MessageResponse;
      } catch (supabaseError) {
        console.error('❌ Supabase mesaj gönderme hatası:', supabaseError);
      }
      
      console.log('Fallback: Firebase ile mesaj gönderiliyor...');
      try {
        const firebaseMessage = await sendFirebaseMessage(orderId, messageData);
        console.log('✅ Firebase mesaj başarıyla gönderildi');
        
        addMessageToLocalStorage(orderId, firebaseMessage as MessageResponse);
        
        return firebaseMessage as MessageResponse;
      } catch (fallbackError) {
        console.error('❌ Firebase fallback hatası:', fallbackError);
      }
      
      const newMessage: MessageResponse = {
        id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      addMessageToLocalStorage(orderId, newMessage);
      return newMessage;
    } catch (error) {
      console.error('❌ Mesaj gönderme hatası:', error);
      
      const newMessage: MessageResponse = {
        id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      addMessageToLocalStorage(orderId, newMessage);
      return newMessage;
    }
  }
};

function saveOrderToLocalStorage(order: OrderResponse) {
  try {
    let orders: OrderResponse[] = [];
    const storedOrders = localStorage.getItem('orders');
    
    if (storedOrders) {
      orders = JSON.parse(storedOrders);
    }
    
    const existingOrderIndex = orders.findIndex(o => o.id === order.id);
    if (existingOrderIndex >= 0) {
      orders[existingOrderIndex] = order;
    } else {
      orders.unshift(order);
    }
    
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ Sipariş localStorage\'a kaydedildi:', order.id);
  } catch (error) {
    console.error('❌ localStorage\'a kaydetme hatası:', error);
  }
}

function updateOrderInLocalStorage(orderId: string, updateData: Partial<OrderResponse>): OrderResponse | null {
  try {
    const storedOrders = localStorage.getItem('orders');
    if (!storedOrders) return null;
    
    const orders: OrderResponse[] = JSON.parse(storedOrders);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex < 0) return null;
    
    const updatedOrder = { ...orders[orderIndex], ...updateData };
    orders[orderIndex] = updatedOrder;
    
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ Sipariş localStorage\'da güncellendi:', orderId);
    
    return updatedOrder;
  } catch (error) {
    console.error('❌ localStorage güncelleme hatası:', error);
    return null;
  }
}

function addMessageToLocalStorage(orderId: string, message: MessageResponse) {
  try {
    const storedOrders = localStorage.getItem('orders');
    if (!storedOrders) return;
    
    const orders: OrderResponse[] = JSON.parse(storedOrders);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex < 0) return;
    
    if (!orders[orderIndex].messages) {
      orders[orderIndex].messages = [];
    }
    
    orders[orderIndex].messages.push(message);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('✅ Mesaj localStorage\'da kaydedildi:', orderId);
  } catch (error) {
    console.error('❌ localStorage mesaj ekleme hatası:', error);
  }
}
