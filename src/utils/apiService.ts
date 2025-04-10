import { supabase } from '@/integrations/supabase/client';

// Add UserResponse type that was missing
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

// Add missing authApi
export const authApi = {
  login: async (email: string, password: string): Promise<UserResponse> => {
    console.log('🔄 API Service - Logging in user');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        // If user doesn't exist in the users table yet, create a new entry
        if (userError.code === 'PGRST116') {
          // Create a new user entry with explicitly typed role
          const newUser: UserResponse = {
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.email?.split('@')[0] || 'user',
            role: 'customer', // Explicitly set as one of the allowed roles
            balance: 0
          };
          
          const { error: insertError } = await supabase
            .from('users')
            .insert([newUser]);
            
          if (insertError) throw insertError;
          
          return newUser;
        } else {
          throw userError;
        }
      }
      
      // Use type assertion to ensure the role is of the correct type
      const userRole = userData.role as 'customer' | 'booster' | 'admin';
      
      return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userRole,
        balance: userData.balance
      };
    } catch (error) {
      console.error('❌ API Service - Login failed:', error);
      throw error;
    }
  },
  
  register: async (email: string, username: string, password: string): Promise<UserResponse> => {
    console.log('🔄 API Service - Registering user');
    
    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (!data.user) throw new Error('User registration failed');
      
      // Create user record in our users table
      const newUser: UserResponse = {
        id: data.user.id,
        email,
        username,
        role: 'customer', // Explicitly set as one of the allowed roles
        balance: 0
      };
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (insertError) throw insertError;
      
      return newUser;
    } catch (error) {
      console.error('❌ API Service - Registration failed:', error);
      throw error;
    }
  },
  
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getUserCount: async (): Promise<{ count: number }> => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      
      return { count: count || 0 };
    } catch (error) {
      console.error('❌ API Service - Failed to get user count:', error);
      return { count: 0 };
    }
  }
};

export const orderApi = {
  // Get all orders
  getOrders: async (): Promise<OrderResponse[]> => {
    console.log('🔄 API Service - Fetching orders from Supabase');
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ API Service - Error fetching orders:', error);
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      // Transform snake_case to camelCase
      const orders: OrderResponse[] = data.map(order => ({
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
      
      console.log(`✅ API Service - Successfully fetched ${orders.length} orders`);
      return orders;
    } catch (error) {
      console.error('❌ API Service - Failed to fetch orders:', error);
      
      // Fallback to localStorage
      try {
        const localOrders = localStorage.getItem('orders');
        if (localOrders) {
          return JSON.parse(localOrders);
        }
      } catch (localError) {
        console.error('❌ API Service - LocalStorage fallback failed:', localError);
      }
      
      return [];
    }
  },
  
  // Create a new order
  createOrder: async (orderData: {
    userId: string;
    currentRank: number;
    targetRank: number;
    price: number;
    gameUsername?: string;
    gamePassword?: string;
  }): Promise<OrderResponse> => {
    console.log('🔄 API Service - Creating new order:', orderData);
    
    try {
      // Transform to snake_case for Supabase
      const supabaseOrderData = {
        user_id: orderData.userId,
        current_rank: orderData.currentRank,
        target_rank: orderData.targetRank,
        price: orderData.price,
        status: 'pending',
        game_username: orderData.gameUsername || '',
        game_password: orderData.gamePassword || '',
        messages: []
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(supabaseOrderData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ API Service - Error creating order:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from order creation');
      }
      
      // Transform response
      const order: OrderResponse = {
        id: data.id,
        userId: data.user_id,
        currentRank: data.current_rank,
        targetRank: data.target_rank,
        price: data.price,
        status: data.status,
        createdAt: data.created_at,
        messages: data.messages || [],
        gameUsername: data.game_username,
        gamePassword: data.game_password
      };
      
      // Save to localStorage as backup
      try {
        const localStorageKey = 'orders';
        let existingOrders = [];
        const storedOrders = localStorage.getItem(localStorageKey);
        
        if (storedOrders) {
          existingOrders = JSON.parse(storedOrders);
        }
        
        existingOrders.unshift(order);
        localStorage.setItem(localStorageKey, JSON.stringify(existingOrders));
      } catch (localError) {
        console.error('❌ API Service - LocalStorage backup failed:', localError);
      }
      
      console.log('✅ API Service - Order created successfully:', order.id);
      return order;
    } catch (error) {
      console.error('❌ API Service - Failed to create order:', error);
      
      // Create a fallback order
      const fallbackOrder: OrderResponse = {
        id: `local-${Date.now()}`,
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
      
      // Save to localStorage
      try {
        const localStorageKey = 'orders';
        let existingOrders = [];
        const storedOrders = localStorage.getItem(localStorageKey);
        
        if (storedOrders) {
          existingOrders = JSON.parse(storedOrders);
        }
        
        existingOrders.unshift(fallbackOrder);
        localStorage.setItem(localStorageKey, JSON.stringify(existingOrders));
      } catch (localError) {
        console.error('❌ API Service - LocalStorage fallback failed:', localError);
      }
      
      return fallbackOrder;
    }
  },
  
  // Update an order
  updateOrder: async (
    orderId: string,
    updateData: Partial<OrderResponse>
  ): Promise<OrderResponse> => {
    console.log('🔄 API Service - Updating order:', orderId, updateData);
    
    try {
      // Transform to snake_case for Supabase
      const supabaseUpdateData: any = {};
      
      if (updateData.currentRank !== undefined) supabaseUpdateData.current_rank = updateData.currentRank;
      if (updateData.targetRank !== undefined) supabaseUpdateData.target_rank = updateData.targetRank;
      if (updateData.status !== undefined) supabaseUpdateData.status = updateData.status;
      if (updateData.price !== undefined) supabaseUpdateData.price = updateData.price;
      if (updateData.boosterId !== undefined) supabaseUpdateData.booster_id = updateData.boosterId;
      if (updateData.boosterUsername !== undefined) supabaseUpdateData.booster_username = updateData.boosterUsername;
      if (updateData.messages !== undefined) supabaseUpdateData.messages = updateData.messages;
      if (updateData.gameUsername !== undefined) supabaseUpdateData.game_username = updateData.gameUsername;
      if (updateData.gamePassword !== undefined) supabaseUpdateData.game_password = updateData.gamePassword;
      
      const { data, error } = await supabase
        .from('orders')
        .update(supabaseUpdateData)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ API Service - Error updating order:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from order update');
      }
      
      // Transform response
      const order: OrderResponse = {
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
      
      console.log('✅ API Service - Order updated successfully:', order.id);
      return order;
    } catch (error) {
      console.error('❌ API Service - Failed to update order:', error);
      throw error;
    }
  },
  
  // Send a message for an order
  sendMessage: async (
    orderId: string,
    messageData: {
      senderId: string;
      senderName: string;
      content: string;
    }
  ): Promise<MessageResponse> => {
    console.log('🔄 API Service - Sending message for order:', orderId);
    
    try {
      // First get the current order messages
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('messages')
        .eq('id', orderId)
        .single();
      
      if (orderError) {
        console.error('❌ API Service - Error fetching order messages:', orderError);
        throw orderError;
      }
      
      // Create new message
      const newMessage: MessageResponse = {
        id: Date.now().toString(),
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        content: messageData.content,
        timestamp: new Date().toISOString()
      };
      
      // Append new message to existing ones
      const messages = [...((orderData?.messages as any[]) || []), newMessage];
      
      // Update order with new messages
      const { error: updateError } = await supabase
        .from('orders')
        .update({ messages })
        .eq('id', orderId);
      
      if (updateError) {
        console.error('❌ API Service - Error updating order messages:', updateError);
        throw updateError;
      }
      
      console.log('✅ API Service - Message sent successfully');
      return newMessage;
    } catch (error) {
      console.error('❌ API Service - Failed to send message:', error);
      throw error;
    }
  }
};

export const userApi = {
  // Add balance to user
  addBalance: async (userId: string, amount: number): Promise<number> => {
    console.log('🔄 API Service - Adding balance for user:', userId, amount);
    
    try {
      // Handle admin user case separately
      if (userId === "admin-user-id" || userId === "admin-user-id-1") {
        console.log('✅ Admin user detected, using localStorage for balance');
        
        // Get from localStorage
        const stored = localStorage.getItem('valorant_user');
        if (stored) {
          const currentUser = JSON.parse(stored);
          currentUser.balance = (currentUser.balance || 0) + amount;
          localStorage.setItem('valorant_user', JSON.stringify(currentUser));
          return currentUser.balance;
        }
        
        return 5000 + amount; // Default admin balance
      }
    
      // First get current user balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('❌ API Service - Error fetching user balance:', userError);
        throw userError;
      }
      
      const currentBalance = (userData?.balance as number) || 0;
      const newBalance = currentBalance + amount;
      
      // Update user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ API Service - Error updating user balance:', updateError);
        throw updateError;
      }
      
      console.log('✅ API Service - Balance added successfully. New balance:', newBalance);
      return newBalance;
    } catch (error) {
      console.error('❌ API Service - Failed to add balance:', error);
      throw error;
    }
  }
};
