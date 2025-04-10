
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderApi, OrderResponse, MessageResponse } from '@/utils/apiService';

export interface Order {
  id: string;
  userId: string;
  currentRank: number;
  targetRank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  boosterId?: string;
  boosterUsername?: string;
  createdAt: string;
  messages: Message[];
  gameUsername?: string;
  gamePassword?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  createOrder: (currentRank: number, targetRank: number, price: number, gameUsername: string, gamePassword: string) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  claimOrder: (orderId: string) => Promise<Order>;
  completeOrder: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  getUserOrders: () => Order[];
  getBoosterOrders: () => Order[];
  getAvailableOrders: () => Order[];
  setActiveOrder: (order: Order | null) => void;
  sendMessage: (orderId: string, content: string) => Promise<Message>;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// OrderResponse'dan Order'a dönüştürme yardımcı fonksiyonu
const mapResponseToOrder = (orderResponse: OrderResponse): Order => {
  return {
    id: orderResponse.id,
    userId: orderResponse.userId,
    currentRank: orderResponse.currentRank,
    targetRank: orderResponse.targetRank,
    price: orderResponse.price,
    status: orderResponse.status,
    boosterId: orderResponse.boosterId,
    boosterUsername: orderResponse.boosterUsername,
    createdAt: orderResponse.createdAt,
    messages: orderResponse.messages as Message[],
    gameUsername: orderResponse.gameUsername,
    gamePassword: orderResponse.gamePassword
  };
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, addBalance } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);

  useEffect(() => {
    if (user && !initialFetch) {
      fetchOrders();
      setInitialFetch(true);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 OrderProvider - Fetching orders from API');
      const ordersData = await orderApi.getOrders();
      console.log('✅ OrderProvider - Successfully fetched orders:', ordersData.length);
      
      // API yanıtını Order tipine dönüştürme
      const mappedOrders = ordersData.map(mapResponseToOrder);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('❌ OrderProvider - Error fetching orders:', error);
      toast({
        title: "Sipariş Yükleme Hatası",
        description: "Siparişler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (currentRank: number, targetRank: number, price: number, gameUsername: string, gamePassword: string) => {
    if (!user) throw new Error('User must be logged in to create an order');

    setIsLoading(true);
    try {
      console.log('🔄 OrderProvider - Creating new order');
      
      // Prevent duplicate orders
      if (orders.some(o => 
        o.userId === user.id && 
        o.currentRank === currentRank && 
        o.targetRank === targetRank && 
        Math.abs(Date.now() - new Date(o.createdAt).getTime()) < 10000 // Within 10 seconds
      )) {
        console.log('⚠️ OrderProvider - Preventing duplicate order');
        toast({
          title: "İşlem Engellendi",
          description: "Aynı sipariş zaten oluşturulmuş. Lütfen biraz bekleyip tekrar deneyiniz.",
          variant: "destructive",
        });
        throw new Error("Potential duplicate order detected");
      }
      
      const newOrder = {
        userId: user.id,
        currentRank,
        targetRank,
        price,
        gameUsername,
        gamePassword,
      };
      
      const createdOrderResponse = await orderApi.createOrder(newOrder);
      const createdOrder = mapResponseToOrder(createdOrderResponse);
      
      // Yeni siparişi listeye ekle
      setOrders(prevOrders => [createdOrder, ...prevOrders]);
      
      toast({
        title: "Sipariş Oluşturuldu",
        description: "Siparişiniz başarıyla oluşturuldu!",
      });
      
      return createdOrder;
    } catch (error) {
      console.error('❌ OrderProvider - Error creating order:', error);
      toast({
        title: "Sipariş Oluşturma Hatası",
        description: "Sipariş oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const claimOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to claim an order');
    
    setIsLoading(true);
    try {
      console.log(`🔄 OrderProvider - Claiming order ${orderId}`);
      
      const updatedOrderResponse = await orderApi.updateOrder(orderId, {
        status: 'in_progress',
        boosterId: user.id,
        boosterUsername: user.username
      });
      
      const updatedOrder = mapResponseToOrder(updatedOrderResponse);
      
      // Siparişleri güncelle
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast({
        title: "Sipariş Alındı",
        description: "Sipariş başarıyla size atandı!",
      });
      
      return updatedOrder;
    } catch (error) {
      console.error('❌ OrderProvider - Error claiming order:', error);
      toast({
        title: "Sipariş Alma Hatası", 
        description: "Sipariş alınırken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to complete an order');
    
    setIsLoading(true);
    try {
      console.log(`🔄 OrderProvider - Completing order ${orderId}`);
      
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');
      
      const updatedOrderResponse = await orderApi.updateOrder(orderId, {
        status: 'completed'
      });
      
      const updatedOrder = mapResponseToOrder(updatedOrderResponse);
      
      if (order.boosterId && (order.boosterId === user.id || user.role === 'admin')) {
        const boosterCommission = Math.round(order.price * 0.6);
        
        try {
          if (user.id === order.boosterId) {
            await addBalance(boosterCommission);
            
            toast({
              title: "Komisyon Eklendi",
              description: `Hesabınıza ${boosterCommission}₺ komisyon eklendi.`,
            });
          }
        } catch (error) {
          console.error('❌ OrderProvider - Failed to add commission:', error);
        }
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast({
        title: "Sipariş Tamamlandı",
        description: "Sipariş başarıyla tamamlandı!",
      });
      
      return updatedOrder;
    } catch (error) {
      console.error('❌ OrderProvider - Error completing order:', error);
      toast({
        title: "Sipariş Tamamlama Hatası",
        description: "Sipariş tamamlanırken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user) throw new Error('Only authorized users can cancel orders');
    
    setIsLoading(true);
    try {
      console.log(`🔄 OrderProvider - Cancelling order ${orderId}`);
      
      const updatedOrderResponse = await orderApi.updateOrder(orderId, {
        status: 'cancelled'
      });
      
      const updatedOrder = mapResponseToOrder(updatedOrderResponse);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast({
        title: "Sipariş İptal Edildi",
        description: "Sipariş başarıyla iptal edildi.",
      });
      
      return updatedOrder;
    } catch (error) {
      console.error('❌ OrderProvider - Error cancelling order:', error);
      toast({
        title: "Sipariş İptal Hatası",
        description: "Sipariş iptal edilirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (orderId: string, content: string) => {
    if (!user) throw new Error('User must be logged in to send a message');

    setIsLoading(true);
    try {
      console.log(`🔄 OrderProvider - Sending message to order ${orderId}`);
      
      const messageData = {
        senderId: user.id,
        senderName: user.username,
        content
      };
      
      const newMessageResponse = await orderApi.sendMessage(orderId, messageData);
      const newMessage: Message = {
        id: newMessageResponse.id,
        senderId: newMessageResponse.senderId,
        senderName: newMessageResponse.senderName,
        content: newMessageResponse.content,
        timestamp: newMessageResponse.timestamp
      };
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              messages: [...order.messages, newMessage]
            };
          }
          return order;
        })
      );
      
      return newMessage;
    } catch (error) {
      console.error('❌ OrderProvider - Error sending message:', error);
      toast({
        title: "Mesaj Gönderme Hatası",
        description: "Mesaj gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUserOrders = () => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id);
  };

  const getBoosterOrders = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return orders.filter(order => 
        order.status === 'in_progress' || order.status === 'completed'
      );
    }
    
    return orders.filter(order => order.boosterId === user.id);
  };

  const getAvailableOrders = () => {
    if (!user) return [];
    
    console.log('getAvailableOrders - user role:', user.role);
    console.log('getAvailableOrders - orders:', orders);
    
    if (user.role === 'admin') {
      const pendingOrders = orders.filter(order => order.status === 'pending');
      console.log('getAvailableOrders - admin pendingOrders:', pendingOrders);
      return pendingOrders;
    }
    
    if (user.role === 'booster') {
      const availableOrders = orders.filter(order => 
        order.status === 'pending' && order.userId !== user.id
      );
      console.log('getAvailableOrders - booster availableOrders:', availableOrders);
      return availableOrders;
    }
    
    return [];
  };
  
  const refreshOrders = () => {
    console.log('OrderContext - Manual refresh requested');
    fetchOrders();
  };

  const value = {
    orders,
    activeOrder,
    isLoading,
    createOrder,
    getOrderById,
    claimOrder,
    completeOrder,
    cancelOrder,
    getUserOrders,
    getBoosterOrders,
    getAvailableOrders,
    setActiveOrder,
    sendMessage,
    refreshOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
