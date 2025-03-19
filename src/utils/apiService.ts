
// API çağrıları için merkezi bir servis dosyası

// API_BASE_URL, ortama göre değişiklik gösterebilir
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com/api'
  : 'http://localhost:5000/api';

// Tüm endpoint'leri tek bir yerde toplama
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  USERS: `${API_BASE_URL}/users`,
  ORDERS: `${API_BASE_URL}/orders`,
  USER_BALANCE: (userId: string) => `${API_BASE_URL}/users/${userId}/balance`,
  ORDER_MESSAGES: (orderId: string) => `${API_BASE_URL}/orders/${orderId}/messages`,
};

// HTTP istekleri için yardımcı fonksiyonlar
async function httpRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
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

    return await response.json();
  } catch (error) {
    console.error('API isteği başarısız:', error);
    throw error;
  }
}

// Auth API istekleri
export const authApi = {
  login: (email: string, password: string) => 
    httpRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, username: string, password: string) => 
    httpRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
};

// Kullanıcı API istekleri
export const userApi = {
  updateBalance: (userId: string, amount: number) => 
    httpRequest(API_ENDPOINTS.USER_BALANCE(userId), {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),
};

// Sipariş API istekleri
export const orderApi = {
  getOrders: () => 
    httpRequest(API_ENDPOINTS.ORDERS),
  
  createOrder: (orderData: any) => 
    httpRequest(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  
  updateOrder: (orderId: string, updateData: any) => 
    httpRequest(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),
  
  sendMessage: (orderId: string, messageData: any) => 
    httpRequest(API_ENDPOINTS.ORDER_MESSAGES(orderId), {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};
