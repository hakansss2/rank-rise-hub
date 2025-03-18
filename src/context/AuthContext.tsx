
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
  addBalance: (amount: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<boolean>;
  formatBalance: (currency?: 'TRY' | 'USD') => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Gerçek kullanıcı verileri (Demo modundan çıkış)
const MOCK_USERS = [
  { id: '1', email: 'hakan200505@gmail.com', username: 'admin', password: 'Metin2398@', role: 'admin' as UserRole, balance: 5000 },
  { id: '2', email: 'booster@valorank.com', username: 'booster', password: 'booster123', role: 'booster' as UserRole, balance: 1000 },
  { id: '3', email: 'customer@valorank.com', username: 'customer', password: 'customer123', role: 'customer' as UserRole, balance: 2500 },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing auth
    const storedUser = localStorage.getItem('valorant_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('valorant_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('valorant_user', JSON.stringify(userWithoutPassword));
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
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // In a real app, you would make an API call to register the user
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        email,
        username,
        role: 'customer' as UserRole,
        balance: 0, // New users start with 0 balance
      };
      
      setUser(newUser);
      localStorage.setItem('valorant_user', JSON.stringify(newUser));
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
    addBalance,
    deductBalance,
    formatBalance,
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
