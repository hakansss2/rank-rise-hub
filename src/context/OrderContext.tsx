import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getRankById, formatCurrency } from '../utils/rankData';
import { useToast } from '@/hooks/use-toast';
import { 
  STORAGE_KEYS, 
  getData, 
  setData, 
  refreshData, 
  syncAllTabs,
  initializeStorageHealthCheck
} from '@/utils/storageService';

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
  createOrder: (currentRank: number, targetRank: number, price: number, gameUsername: string, gamePassword: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  claimOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  getUserOrders: () => Order[];
  getBoosterOrders: () => Order[];
  getAvailableOrders: () => Order[];
  setActiveOrder: (order: Order | null) => void;
  sendMessage: (orderId: string, content: string) => Promise<void>;
  refreshOrders: () => void;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    userId: '3',
    currentRank: 5,
    targetRank: 10,
    price: 850,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [],
    gameUsername: 'testuser1',
    gamePassword: 'testpass1',
  },
  {
    id: '2',
    userId: '3',
    currentRank: 12,
    targetRank: 15,
    price: 1200,
    status: 'in_progress',
    boosterId: '2',
    boosterUsername: 'booster',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    messages: [
      {
        id: '1',
        senderId: '3',
        senderName: 'customer',
        content: 'Merhaba, siparişim ne durumda?',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
      },
      {
        id: '2',
        senderId: '2',
        senderName: 'booster',
        content: 'Merhaba, bu akşam başlayacağım. Hesap bilgilerinizi paylaşabilir misiniz?',
        timestamp: new Date(Date.now() - 30000000).toISOString(),
      },
    ],
    gameUsername: 'testuser2',
    gamePassword: 'testpass2',
  },
  {
    id: '3',
    userId: '3',
    currentRank: 8,
    targetRank: 12,
    price: 950,
    status: 'completed',
    boosterId: '2',
    boosterUsername: 'booster',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    messages: [],
    gameUsername: 'testuser3',
    gamePassword: 'testpass3',
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, addBalance } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Setup health check on mount
  useEffect(() => {
    const cleanupHealthCheck = initializeStorageHealthCheck();
    return () => cleanupHealthCheck();
  }, []);

  // Load orders from localStorage on component mount with enhanced reliability
  useEffect(() => {
    console.log('🔄 OrderProvider - Initial mount, attempting to load orders');
    
    try {
      // Use refreshData for enhanced validation and recovery
      const loadedOrders = refreshData(STORAGE_KEYS.ORDERS, MOCK_ORDERS);
      console.log('✅ OrderProvider - Successfully loaded orders from localStorage:', loadedOrders.length);
      
      // Validate and ensure all orders have the correct status type
      const validatedOrders = loadedOrders.map((order: any) => {
        // Ensure status is one of the valid types
        let validStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' = 'pending';
        
        if (order.status === 'pending' || 
            order.status === 'in_progress' || 
            order.status === 'completed' || 
            order.status === 'cancelled') {
          validStatus = order.status;
        } else {
          console.warn(`⚠️ OrderProvider - Invalid status found: ${order.status}. Defaulting to 'pending'`);
        }
        
        return {
          ...order,
          status: validStatus
        } as Order;
      });
      
      setOrders(validatedOrders);
      
      // Force sync across tabs
      syncAllTabs();
    } catch (error) {
      console.error('❌ OrderProvider - Error loading initial orders:', error);
      setOrders(MOCK_ORDERS);
      setData(STORAGE_KEYS.ORDERS, MOCK_ORDERS);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Setup periodic refresh for orders
  useEffect(() => {
    console.log('🔄 OrderProvider - Setting up periodic order refresh');
    
    const intervalId = setInterval(() => {
      try {
        console.log('🔄 OrderProvider - Periodic refresh of orders');
        const latestOrders = refreshData(STORAGE_KEYS.ORDERS, orders);
        
        // Only update state if different to avoid unnecessary renders
        if (JSON.stringify(latestOrders) !== JSON.stringify(orders)) {
          setOrders(latestOrders);
        }
      } catch (error) {
        console.error('❌ OrderProvider - Error in periodic refresh:', error);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [orders]);

  // Save orders to localStorage when they change with enhanced reliability
  useEffect(() => {
    if (initialized) {
      try {
        console.log('🔄 OrderProvider - Saving orders to localStorage:', orders.length);
        
        // Use setData from our enhanced storage service
        const success = setData(STORAGE_KEYS.ORDERS, orders);
        
        if (success) {
          console.log('✅ OrderProvider - Saved orders to localStorage successfully');
          // Force sync across tabs
          syncAllTabs();
        } else {
          console.error('❌ OrderProvider - Failed to save orders to localStorage');
        }
      } catch (error) {
        console.error('❌ OrderProvider - Failed to save orders to localStorage:', error);
      }
    }
  }, [orders, initialized]);

  const createOrder = async (currentRank: number, targetRank: number, price: number, gameUsername: string, gamePassword: string) => {
    if (!user) throw new Error('User must be logged in to create an order');

    console.log('🔄 OrderProvider - createOrder called with:', { currentRank, targetRank, price });
    
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        userId: user.id,
        currentRank,
        targetRank,
        price,
        status: 'pending',
        createdAt: new Date().toISOString(),
        messages: [],
        gameUsername,
        gamePassword,
      };
      
      console.log('✅ OrderProvider - Created new order object:', newOrder);
      
      // Update state
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      
      // Save to localStorage immediately
      console.log('🔄 OrderProvider - Saving orders after adding new order');
      setData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ OrderProvider - Error creating order:', error);
      throw error;
    }
  };

  const getOrderById = (id: string) => {
    console.log('🔍 OrderProvider - getOrderById called for:', id);
    const order = orders.find(order => order.id === id);
    console.log('🔍 OrderProvider - Found order:', order);
    return order;
  };

  const claimOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to claim an order');
    if (!user.id) throw new Error('User ID is required');
    
    if (user.role === 'admin') {
      toast({
        title: "İşlem Reddedildi",
        description: "Admin hesapları sipariş alamaz.",
        variant: "destructive",
      });
      throw new Error('Admin accounts cannot claim orders');
    }

    console.log(`🔄 OrderProvider - Claiming order ${orderId} by user ${user.username} with ID ${user.id}`);
    
    try {
      // Update the order
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'in_progress' as const, 
              boosterId: user.id,
              boosterUsername: user.username,
            } 
          : order
      );
      
      // Set the state
      setOrders(updatedOrders);
      
      // Save to localStorage
      console.log('🔄 OrderProvider - Saving orders after claiming order');
      setData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ OrderProvider - Error claiming order:', error);
      throw error;
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to complete an order');
    
    console.log(`🔄 OrderProvider - Completing order ${orderId}`);
    
    try {
      const order = orders.find(o => o.id === orderId);
      
      if (order && (order.boosterId === user.id || user.role === 'admin')) {
        const boosterCommission = Math.round(order.price * 0.6);
        
        if (order.boosterId && order.boosterId !== user.id && user.role === 'admin') {
          try {
            const storedUsers = localStorage.getItem('valorant_registered_users');
            if (storedUsers) {
              const parsedUsers = JSON.parse(storedUsers);
              const booster = parsedUsers.find((u: any) => u.id === order.boosterId);
              
              if (booster) {
                booster.balance = (booster.balance || 0) + boosterCommission;
                localStorage.setItem('valorant_registered_users', JSON.stringify(parsedUsers));
                
                console.log(`✅ OrderProvider - Admin completed order. Added ${boosterCommission}₺ to booster ${booster.username}'s account`);
                
                toast({
                  title: "Sipariş Tamamlandı",
                  description: `${booster.username} hesabına ${boosterCommission}₺ komisyon eklendi.`,
                });
              }
            }
          } catch (error) {
            console.error('❌ OrderProvider - Failed to add commission to booster:', error);
          }
        } else if (user.id === order.boosterId) {
          try {
            await addBalance(boosterCommission);
            console.log(`✅ OrderProvider - Booster earned ${boosterCommission}₺ commission`);
            
            toast({
              title: "Komisyon Eklendi",
              description: `Hesabınıza ${boosterCommission}₺ komisyon eklendi.`,
            });
          } catch (error) {
            console.error('❌ OrderProvider - Failed to add commission to booster:', error);
          }
        }
        
        // Update the order status
        const updatedOrders = orders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'completed' as const } 
            : order
        );
        
        // Update state
        setOrders(updatedOrders);
        
        // Save to localStorage
        console.log('🔄 OrderProvider - Saving orders after completing order');
        setData(STORAGE_KEYS.ORDERS, updatedOrders);
        
        return Promise.resolve();
      } else {
        toast({
          title: "İşlem Reddedildi",
          description: "Bu siparişi sadece atanmış booster veya admin tamamlayabilir.",
          variant: "destructive",
        });
        throw new Error('Only the assigned booster or an admin can complete this order');
      }
    } catch (error) {
      console.error('❌ OrderProvider - Error completing order:', error);
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "İşlem Reddedildi",
        description: "Sipariş iptali sadece adminler tarafından yapılabilir.",
        variant: "destructive",
      });
      throw new Error('Only admins can cancel orders');
    }
    
    console.log(`🔄 OrderProvider - Cancelling order ${orderId}`);
    
    try {
      // Update the order status
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const } 
          : order
      );
      
      // Update state
      setOrders(updatedOrders);
      
      // Save to localStorage
      console.log('🔄 OrderProvider - Saving orders after cancelling order');
      setData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ OrderProvider - Error cancelling order:', error);
      throw error;
    }
  };

  const getUserOrders = () => {
    if (!user) return [];
    
    console.log(`🔍 OrderProvider - Getting orders for user ${user.username} with ID ${user.id}`);
    const userOrders = orders.filter(order => order.userId === user.id);
    console.log(`🔍 OrderProvider - Found ${userOrders.length} orders for user ${user.username}`);
    
    return userOrders;
  };

  const getBoosterOrders = () => {
    if (!user) return [];
    
    console.log(`🔍 OrderProvider - Getting booster orders for user ${user.username} with role ${user.role}`);
    
    if (user.role === 'admin') {
      const adminOrders = orders.filter(order => order.status === 'in_progress' || order.status === 'completed');
      console.log(`🔍 OrderProvider - Admin user - Found ${adminOrders.length} in-progress or completed orders`);
      return adminOrders;
    }
    
    console.log(`🔍 OrderProvider - Checking booster orders for user ${user.username} with ID ${user.id}`);
    
    const filteredOrders = orders.filter(order => order.boosterId === user.id);
    
    console.log(`🔍 OrderProvider - Found ${filteredOrders.length} orders for booster ${user.username}`);
    return filteredOrders;
  };

  const getAvailableOrders = () => {
    if (!user) return [];
    
    console.log(`🔍 OrderProvider - Getting available orders for user ${user.username} with role ${user.role}`);
    
    if (user.role === 'admin') {
      const pendingOrders = orders.filter(order => order.status === 'pending');
      console.log(`🔍 OrderProvider - Admin user - Found ${pendingOrders.length} pending orders`);
      return pendingOrders;
    }
    
    if (user.role === 'booster') {
      console.log('🔍 OrderProvider - Getting available orders for booster');
      
      const availableOrders = orders.filter(order => {
        return order.status === 'pending' && order.userId !== user.id;
      });
      
      console.log(`🔍 OrderProvider - Found ${availableOrders.length} pending orders for boosters`);
      return availableOrders;
    }
    
    return [];
  };

  const sendMessage = async (orderId: string, content: string) => {
    if (!user) throw new Error('User must be logged in to send a message');

    console.log(`🔄 OrderProvider - Sending message to order ${orderId}: ${content}`);
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.username,
        content,
        timestamp: new Date().toISOString(),
      };
      
      // Update the order with the new message
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              messages: [...order.messages, newMessage] 
            } 
          : order
      );
      
      // Update state
      setOrders(updatedOrders);
      
      // Save to localStorage
      console.log('🔄 OrderProvider - Saving orders after adding message');
      setData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ OrderProvider - Error sending message:', error);
      throw error;
    }
  };
  
  const refreshOrders = () => {
    console.log('🔄 OrderProvider - refreshOrders called');
    try {
      // Use our enhanced refreshData method
      const refreshedOrders = refreshData(STORAGE_KEYS.ORDERS, MOCK_ORDERS);
      console.log('✅ OrderProvider - Successfully refreshed orders:', refreshedOrders.length);
      
      // Validate and ensure all orders have the correct status type
      const validatedOrders = refreshedOrders.map((order: any) => {
        // Ensure status is one of the valid types
        let validStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' = 'pending';
        
        if (order.status === 'pending' || 
            order.status === 'in_progress' || 
            order.status === 'completed' || 
            order.status === 'cancelled') {
          validStatus = order.status;
        } else {
          console.warn(`⚠️ OrderProvider - Invalid status found: ${order.status}. Defaulting to 'pending'`);
        }
        
        return {
          ...order,
          status: validStatus
        } as Order;
      });
      
      setOrders(validatedOrders);
      
      // Force sync across tabs
      syncAllTabs();
    } catch (error) {
      console.error('❌ OrderProvider - Error in refreshOrders:', error);
    }
  };

  const value = {
    orders,
    activeOrder,
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
