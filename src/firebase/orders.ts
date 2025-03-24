
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  Firestore
} from "firebase/firestore";
import { db } from "./config";

// Sipariş arayüzü
export interface FirebaseOrder {
  id: string;
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  boosterId?: string;
  boosterUsername?: string;
  createdAt: string;
  messages: FirebaseMessage[];
  gameUsername?: string;
  gamePassword?: string;
}

// Mesaj arayüzü
export interface FirebaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// Firebase bağlantısını kontrol et
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Basit bir okuma işlemi yaparak bağlantıyı kontrol et
    const testQuery = query(collection(db, "orders"));
    await getDocs(testQuery);
    console.log("Firebase bağlantısı başarılı");
    return true;
  } catch (error) {
    console.error("Firebase bağlantısı başarısız:", error);
    return false;
  }
}

// Tüm siparişleri getir
export const getOrders = async (): Promise<FirebaseOrder[]> => {
  try {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(ordersQuery);
    
    const orders: FirebaseOrder[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
      } as FirebaseOrder);
    });
    
    console.log(`Firebase'den ${orders.length} sipariş bulundu`);
    return orders;
  } catch (error: any) {
    console.error("Firebase sipariş getirme hatası:", error.message);
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
}): Promise<FirebaseOrder> => {
  try {
    // Firebase bağlantısını kontrol et
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      throw new Error("Firebase bağlantısı kurulamadı");
    }
    
    console.log("Firebase'de sipariş oluşturuluyor:", orderData);
    
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "pending",
      createdAt: new Date(),
      messages: []
    });
    
    // Yeni eklenen dokümanı getir
    const newOrderSnap = await getDoc(orderRef);
    
    if (!newOrderSnap.exists()) {
      throw new Error("Sipariş oluşturma hatası");
    }
    
    const data = newOrderSnap.data();
    
    const newOrder: FirebaseOrder = {
      id: orderRef.id,
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
    
    console.log("Firebase sipariş başarıyla oluşturuldu:", newOrder.id);
    return newOrder;
  } catch (error: any) {
    console.error("Firebase sipariş oluşturma hatası:", error.message);
    throw new Error("Firebase sipariş oluşturulamadı: " + error.message);
  }
};

// Sipariş güncelle
export const updateOrder = async (
  orderId: string, 
  updateData: Partial<FirebaseOrder>
): Promise<FirebaseOrder> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, updateData);
    
    // Güncellenmiş siparişi getir
    const updatedOrderSnap = await getDoc(orderRef);
    
    if (!updatedOrderSnap.exists()) {
      throw new Error("Sipariş bulunamadı");
    }
    
    const data = updatedOrderSnap.data();
    return {
      id: orderId,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
    } as FirebaseOrder;
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
): Promise<FirebaseMessage> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error("Sipariş bulunamadı");
    }
    
    const orderData = orderSnap.data();
    const messages = orderData.messages || [];
    
    const newMessage: FirebaseMessage = {
      id: Date.now().toString(),
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    await updateDoc(orderRef, {
      messages: [...messages, newMessage]
    });
    
    return newMessage;
  } catch (error: any) {
    console.error("Mesaj gönderme hatası:", error.message);
    throw new Error(error.message);
  }
};
