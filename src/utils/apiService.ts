// API çağrıları için merkezi bir servis dosyası
import { getApiBaseUrl } from './environment';

// API_BASE_URL, ortama göre değişiklik gösterebilir
export const API_BASE_URL = getApiBaseUrl();

// Tüm endpoint'leri tek bir yerde toplama
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  USERS: `${API_BASE_URL}/users`,
  USERS_COUNT: `${API_BASE_URL}/users/count`,
  ORDERS: `${API_BASE_URL}/orders`,
  USER_BALANCE: (userId: string) => `${API_BASE_URL}/users/${userId}/balance`,
  ORDER_MESSAGES: (orderId: string) => `${API_BASE_URL}/orders/${orderId}/messages`,
};

// API yanıt türleri için arayüzler
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

// HTTP istekleri için yardımcı fonksiyonlar
async function httpRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`🔄 API isteği yapılıyor: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API yanıtı alındı:`, data);
    return data;
  } catch (error) {
    console.error('❌ API isteği başarısız:', error);
    throw error;
  }
}

// Auth API istekleri
export const authApi = {
  login: (email: string, password: string): Promise<UserResponse> => 
    httpRequest<UserResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, username: string, password: string): Promise<UserResponse> => 
    httpRequest<UserResponse>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
    
  getUserCount: (): Promise<{count: number}> =>
    httpRequest<{count: number}>(API_ENDPOINTS.USERS_COUNT),
};

// Kullanıcı API istekleri
export const userApi = {
  updateBalance: (userId: string, amount: number): Promise<UserResponse> => 
    httpRequest<UserResponse>(API_ENDPOINTS.USER_BALANCE(userId), {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),
};

// Sipariş API istekleri
export const orderApi = {
  getOrders: (): Promise<OrderResponse[]> => 
    httpRequest<OrderResponse[]>(API_ENDPOINTS.ORDERS),
  
  createOrder: (orderData: any): Promise<OrderResponse> => 
    httpRequest<OrderResponse>(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  
  updateOrder: (orderId: string, updateData: any): Promise<OrderResponse> => 
    httpRequest<OrderResponse>(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),
  
  sendMessage: (orderId: string, messageData: any): Promise<MessageResponse> => 
    httpRequest<MessageResponse>(API_ENDPOINTS.ORDER_MESSAGES(orderId), {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};
