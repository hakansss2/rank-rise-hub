
import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'customer' | 'booster' | 'admin';

interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isBooster: boolean;
  isCustomer: boolean;
  addBalance: (amount: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<boolean>;
  formatBalance: (currency?: 'TRY' | 'USD') => string;
  getAllUsers: () => Array<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Kullanıcı verileri
const USERS = [
  { id: '1', email: 'hakan200505@gmail.com', username: 'admin', password: 'Metin2398@', role: 'admin' as UserRole, balance: 5000 },
  { id: '2', email: 'booster@test.com', username: 'booster', password: 'password', role: 'booster' as UserRole, balance: 1000 },
  { id: '3', email: 'customer@test.com', username: 'customer', password: 'password', role: 'customer' as UserRole, balance: 2000 },
];

// Yeni kayıt olan kullanıcıları bu array'de saklayacağız
let registeredUsers: Array<typeof USERS[0]> = [];

// LocalStorage'dan kayıtlı kullanıcıları yükleme
const loadRegisteredUsers = () => {
  const storedUsers = localStorage.getItem('valorant_registered_users');
  if (storedUsers) {
    try {
      registeredUsers = JSON.parse(storedUsers);
      console.log('Loaded registered users from localStorage:', registeredUsers.length);
    } catch (error) {
      console.error('Failed to parse stored users', error);
      registeredUsers = [];
    }
  }
};

// LocalStorage'a kayıtlı kullanıcıları kaydetme
const saveRegisteredUsers = () => {
  try {
    localStorage.setItem('valorant_registered_users', JSON.stringify(registeredUsers));
    console.log('Saved registered users to localStorage:', registeredUsers.length);
  } catch (error) {
    console.error('Failed to save registered users to localStorage', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load registered users when component mounts
    loadRegisteredUsers();
    
    // Check local storage for existing auth
    const storedUser = localStorage.getItem('valorant_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('User session restored from localStorage:', parsedUser.username);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('valorant_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Tüm kullanıcıları getir (sabit ve kayıtlı)
  const getAllUsers = () => {
    // Clone arrays to prevent modification
    const defaultUsers = USERS.map(({ password, ...rest }) => rest);
    const registeredUsersList = registeredUsers.map(({ password, ...rest }) => rest);
    return [...defaultUsers, ...registeredUsersList];
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Reload registered users to get the latest data
      loadRegisteredUsers();
      
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Önce sabit kullanıcılarda ara
      let foundUser = USERS.find(
        u => u.email === email && u.password === password
      );
      
      // Sabit kullanıcılarda bulunamazsa, kayıtlı kullanıcılarda ara
      if (!foundUser) {
        console.log('Searching in registered users for:', email);
        console.log('Registered users:', registeredUsers);
        
        foundUser = registeredUsers.find(
          u => u.email === email && u.password === password
        );
      }
      
      if (!foundUser) {
        console.error('Login failed: Invalid credentials for', email);
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('valorant_user', JSON.stringify(userWithoutPassword));
      console.log('User logged in successfully:', userWithoutPassword.username, 'with role:', userWithoutPassword.role);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reload registered users to get latest data
      loadRegisteredUsers();
      console.log('Before registration - current registered users:', registeredUsers.length);
      
      // Tüm kullanıcılarda e-posta kontrolü (sabit ve kayıtlı)
      const allUsers = [...USERS, ...registeredUsers];
      if (allUsers.some(u => u.email === email)) {
        console.error('Registration failed: Email already in use -', email);
        throw new Error('Email already in use');
      }
      
      // Yeni kullanıcı oluştur
      const newUser = {
        id: `u-${Date.now()}`,
        email,
        username,
        password, // şifreyi kaydet
        role: 'customer' as UserRole,
        balance: 0, // New users start with 0 balance
      };
      
      console.log('Creating new user:', { ...newUser, password: '***' });
      
      // Kayıtlı kullanıcılar listesine ekle
      registeredUsers.push(newUser);
      
      // LocalStorage'a kaydet
      saveRegisteredUsers();
      console.log('After registration - updated registered users:', registeredUsers.length);
      
      // Verify the save operation
      const storedUsers = localStorage.getItem('valorant_registered_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        console.log('Verification - users in localStorage after save:', parsedUsers.length);
      }
      
      // Kullanıcı bilgilerini state'e ve localStorage'a ekle (şifre olmadan)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('valorant_user', JSON.stringify(userWithoutPassword));
      console.log('Registration successful, logged in as:', userWithoutPassword.username);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('valorant_user');
    console.log('User logged out');
  };
  
  // Add balance to user account
  const addBalance = async (amount: number) => {
    if (!user) throw new Error('User must be logged in to add balance');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        balance: user.balance + amount
      };
      
      setUser(updatedUser);
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));

      // Reload registered users to get latest data
      loadRegisteredUsers();
      
      // Kayıtlı kullanıcılarda da güncelle
      const isDefaultUser = USERS.some(u => u.id === user.id);
      if (!isDefaultUser) {
        const userIndex = registeredUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = { 
            ...registeredUsers[userIndex], 
            balance: updatedUser.balance 
          };
          saveRegisteredUsers();
        }
      }
    } catch (error) {
      console.error('Failed to add balance', error);
      throw error;
    }
  };
  
  // Deduct balance from user account
  const deductBalance = async (amount: number): Promise<boolean> => {
    if (!user) throw new Error('User must be logged in to make a purchase');
    
    // Check if user has sufficient balance
    if (user.balance < amount) {
      return false;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        balance: user.balance - amount
      };
      
      setUser(updatedUser);
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));

      // Reload registered users to get latest data
      loadRegisteredUsers();
      
      // Kayıtlı kullanıcılarda da güncelle
      const isDefaultUser = USERS.some(u => u.id === user.id);
      if (!isDefaultUser) {
        const userIndex = registeredUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = { 
            ...registeredUsers[userIndex], 
            balance: updatedUser.balance 
          };
          saveRegisteredUsers();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to deduct balance', error);
      throw error;
    }
  };
  
  // Format user balance with currency
  const formatBalance = (currency: 'TRY' | 'USD' = 'TRY'): string => {
    if (!user) return currency === 'TRY' ? '0 ₺' : '$0.00';
    
    if (currency === 'TRY') {
      return `${user.balance.toLocaleString('tr-TR')} ₺`;
    } else {
      const usdAmount = user.balance / 35; // Convert TRY to USD
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isBooster: user?.role === 'booster' || user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    addBalance,
    deductBalance,
    formatBalance,
    getAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
