
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getRankById, formatCurrency } from '../utils/rankData';

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
}

// Mock order data
let MOCK_ORDERS: Order[] = [
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
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load orders from localStorage if available
    const storedOrders = localStorage.getItem('valorant_orders');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (error) {
        console.error('Failed to parse stored orders', error);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('valorant_orders', JSON.stringify(orders));
  }, [orders]);

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
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed' } 
          : order
      )
    );
    return Promise.resolve();
  };

  const cancelOrder = async (orderId: string) => {
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
    return orders.filter(order => order.boosterId === user.id);
  };

  const getAvailableOrders = () => {
    return orders.filter(order => order.status === 'pending');
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
