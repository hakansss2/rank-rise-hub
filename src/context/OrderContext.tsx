
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getRankById, formatCurrency } from '../utils/rankData';
import { useToast } from '@/hooks/use-toast';

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
  createOrder: (currentRank: number, targetRank: number, price: number) => Promise<void>;
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

// Mock order data - This will be replaced by localStorage data if available
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
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load orders from localStorage on mount
  useEffect(() => {
    refreshOrders();
    // Only set initialized to true after the first load
    setInitialized(true);
  }, []);

  // Save orders to localStorage whenever they change, but only after initialization
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('valorant_orders', JSON.stringify(orders));
      console.log('Saved orders to localStorage:', orders.length);
    }
  }, [orders, initialized]);

  const refreshOrders = () => {
    // Load orders from localStorage if available
    const storedOrders = localStorage.getItem('valorant_orders');
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        console.log('Loaded orders from localStorage:', parsedOrders.length);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Failed to parse stored orders', error);
        // Initialize with mock data if parsing fails
        setOrders(MOCK_ORDERS);
        localStorage.setItem('valorant_orders', JSON.stringify(MOCK_ORDERS));
      }
    } else {
      // Initialize with mock data if no saved data exists
      console.log('No saved orders found, using mock data');
      setOrders(MOCK_ORDERS);
      localStorage.setItem('valorant_orders', JSON.stringify(MOCK_ORDERS));
    }
  };

  const createOrder = async (currentRank: number, targetRank: number, price: number) => {
    if (!user) throw new Error('User must be logged in to create an order');

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: user.id,
      currentRank,
      targetRank,
      price,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setOrders(prev => [...prev, newOrder]);
    return Promise.resolve();
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const claimOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to claim an order');
    if (!user.id) throw new Error('User ID is required');
    
    // If the user is an admin, they shouldn't be able to claim orders
    if (user.role === 'admin') {
      toast({
        title: "İşlem Reddedildi",
        description: "Admin hesapları sipariş alamaz.",
        variant: "destructive",
      });
      throw new Error('Admin accounts cannot claim orders');
    }

    console.log(`Claiming order ${orderId} by user ${user.username} with ID ${user.id}`);
    
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'in_progress', 
              boosterId: user.id,
              boosterUsername: user.username,
            } 
          : order
      )
    );
    
    return Promise.resolve();
  };

  const completeOrder = async (orderId: string) => {
    if (!user) throw new Error('User must be logged in to complete an order');
    
    const order = orders.find(o => o.id === orderId);
    
    // Only the assigned booster or an admin can complete an order
    if (order && (order.boosterId === user.id || user.role === 'admin')) {
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'completed' } 
            : order
        )
      );
      return Promise.resolve();
    } else {
      toast({
        title: "İşlem Reddedildi",
        description: "Bu siparişi sadece atanmış booster veya admin tamamlayabilir.",
        variant: "destructive",
      });
      throw new Error('Only the assigned booster or an admin can complete this order');
    }
  };

  const cancelOrder = async (orderId: string) => {
    // Only admins can cancel orders
    if (!user || user.role !== 'admin') {
      toast({
        title: "İşlem Reddedildi",
        description: "Sipariş iptali sadece adminler tarafından yapılabilir.",
        variant: "destructive",
      });
      throw new Error('Only admins can cancel orders');
    }
    
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      )
    );
    return Promise.resolve();
  };

  const getUserOrders = () => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id);
  };

  const getBoosterOrders = () => {
    if (!user) return [];
    
    // If the user is an admin, they shouldn't see booster orders
    if (user.role === 'admin') {
      return [];
    }
    
    console.log(`Checking booster orders for user ${user.username} with ID ${user.id} and role ${user.role}`);
    const filtered = orders.filter(order => order.boosterId === user.id);
    console.log(`Found ${filtered.length} orders for booster ${user.username}`);
    return filtered;
  };

  const getAvailableOrders = () => {
    // Admins should not see available orders to claim
    if (user?.role === 'admin') {
      return [];
    }
    
    console.log('All orders:', orders);
    const availableOrders = orders.filter(order => order.status === 'pending');
    console.log(`Found ${availableOrders.length} pending orders:`, availableOrders);
    return availableOrders;
  };

  const sendMessage = async (orderId: string, content: string) => {
    if (!user) throw new Error('User must be logged in to send a message');

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.username,
      content,
      timestamp: new Date().toISOString(),
    };

    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              messages: [...order.messages, newMessage] 
            } 
          : order
      )
    );
    return Promise.resolve();
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
