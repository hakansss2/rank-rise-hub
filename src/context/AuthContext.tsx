
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
  updateUser: (updatedUser: User, newPassword?: string) => Promise<void>;
  removeAllExceptAdmin: () => Promise<void>;
  removeUsersByEmails: (emails: string[]) => Promise<void>;
  registeredUsersCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin user data
const DEFAULT_ADMIN = { 
  id: '1', 
  email: 'hakan200505@gmail.com', 
  username: 'admin', 
  password: 'Metin2398@', 
  role: 'admin' as UserRole, 
  balance: 5000 
};

// Constant for localStorage key
const USERS_STORAGE_KEY = 'valorant_registered_users';

// Function to load registered users from localStorage
const loadRegisteredUsers = () => {
  try {
    console.log('📌 DEBUG: loadRegisteredUsers - Called from:', new Error().stack?.split('\n')[2]?.trim());
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    console.log('📌 Loading registered users from localStorage:', storedUsers);
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      console.log('📌 Successfully loaded registered users:', parsedUsers.length, parsedUsers);
      return parsedUsers;
    }
  } catch (error) {
    console.error('Failed to parse stored users', error);
  }
  
  // Initialize with empty array if no users found
  console.log('📌 No registered users found, initializing with empty array');
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
  return [];
};

// Function to save registered users to localStorage
const saveRegisteredUsers = (users: any[]) => {
  try {
    console.log('📌 DEBUG: saveRegisteredUsers - Called from:', new Error().stack?.split('\n')[2]?.trim());
    console.log('📌 Attempting to save users to localStorage:', users.length, users);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    // Verify that the data was saved correctly
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    console.log('📌 Saved registered users to localStorage, verification:', storedData);
    console.log('📌 Saved user count:', JSON.parse(storedData || '[]').length);
  } catch (error) {
    console.error('Failed to save registered users to localStorage', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Load registered users and check for existing session on mount
  useEffect(() => {
    // Load registered users
    const loadedUsers = loadRegisteredUsers();
    setRegisteredUsers(loadedUsers);
    console.log('📌 Initial loading of registered users:', loadedUsers.length, loadedUsers);
    
    // Check for existing user session
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

  // Get all users (default admin + registered users)
  const getAllUsers = () => {
    // Always fetch the latest registered users from localStorage
    console.log('🔄 DEBUG: getAllUsers - Called from:', new Error().stack?.split('\n')[2]?.trim());
    const latestRegisteredUsers = loadRegisteredUsers();
    console.log("🔄 getAllUsers - Registered Users Count:", latestRegisteredUsers.length);
    
    // Map users to exclude passwords
    const adminUser = { 
      id: DEFAULT_ADMIN.id, 
      email: DEFAULT_ADMIN.email, 
      username: DEFAULT_ADMIN.username, 
      role: DEFAULT_ADMIN.role, 
      balance: DEFAULT_ADMIN.balance 
    };
    
    // Map registered users to exclude passwords
    const registeredUsersList = latestRegisteredUsers.map(({ password, ...rest }: any) => rest);
    
    // Combine admin and registered users
    const allUsers = [adminUser, ...registeredUsersList];
    console.log("📢 getAllUsers - Final User List:", allUsers.length, allUsers);
    
    return allUsers;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get the latest registered users
      const latestRegisteredUsers = loadRegisteredUsers();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if admin login
      let foundUser = null;
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        foundUser = DEFAULT_ADMIN;
      } else {
        // Check registered users
        console.log('Checking registered users for:', email);
        foundUser = latestRegisteredUsers.find(
          u => u.email === email && u.password === password
        );
      }
      
      if (!foundUser) {
        console.error('Login failed: Invalid credentials for', email);
        throw new Error('Invalid credentials');
      }
      
      // Extract user info without password
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('valorant_user', JSON.stringify(userWithoutPassword));
      console.log('User logged in successfully:', userWithoutPassword.username);
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('📢 Registration - Starting process for:', email);
      console.log('📌 localStorage before registration attempt:', localStorage.getItem(USERS_STORAGE_KEY));
      
      // Get the latest registered users directly from localStorage to ensure we have the most recent data
      const latestRegisteredUsers = loadRegisteredUsers();
      console.log("📌 Registration - Current registered users:", latestRegisteredUsers.length);
      
      // Check for duplicate email
      if (email === DEFAULT_ADMIN.email || latestRegisteredUsers.some(u => u.email === email)) {
        console.error('Registration failed: Email already in use -', email);
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser = {
        id: `u-${Date.now()}`,
        email,
        username,
        password,
        role: 'customer' as UserRole,
        balance: 0,
      };
      
      console.log("📢 Registering user:", newUser);
      console.log("🔍 Existing users before save:", localStorage.getItem(USERS_STORAGE_KEY));
      
      // Add to registered users
      const updatedRegisteredUsers = [...latestRegisteredUsers, newUser];
      
      console.log("📌 Registration - Before saving to localStorage:", {
        oldLength: latestRegisteredUsers.length,
        newLength: updatedRegisteredUsers.length,
        newUsers: updatedRegisteredUsers
      });
      
      // IMPORTANT: Save to localStorage BEFORE updating state to ensure data is persisted
      saveRegisteredUsers(updatedRegisteredUsers);
      console.log("📌 Registration - After saving to localStorage:", localStorage.getItem(USERS_STORAGE_KEY));
      
      // Then update state
      setRegisteredUsers(updatedRegisteredUsers);
      
      console.log('User registered successfully:', { email, username, id: newUser.id });
      console.log('Total registered users after registration:', updatedRegisteredUsers.length);
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('valorant_user', JSON.stringify(userWithoutPassword));
      
      // Verify localStorage after registration
      const storedUsersAfter = loadRegisteredUsers();
      console.log('📌 Verification - Users in localStorage after registration:', storedUsersAfter.length, storedUsersAfter);
      
      if (storedUsersAfter.length !== updatedRegisteredUsers.length) {
        console.error('ERROR: User count mismatch after registration!', {
          expected: updatedRegisteredUsers.length,
          actual: storedUsersAfter.length
        });
      }
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        balance: user.balance + amount
      };
      
      setUser(updatedUser);
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));
      
      // Update balance in registered users if not admin
      if (user.email !== DEFAULT_ADMIN.email) {
        const latestRegisteredUsers = loadRegisteredUsers();
        const updatedRegisteredUsers = latestRegisteredUsers.map(u => {
          if (u.id === user.id) {
            return { ...u, balance: updatedUser.balance };
          }
          return u;
        });
        
        saveRegisteredUsers(updatedRegisteredUsers);
        setRegisteredUsers(updatedRegisteredUsers);
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        balance: user.balance - amount
      };
      
      setUser(updatedUser);
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));
      
      // Update balance in registered users if not admin
      if (user.email !== DEFAULT_ADMIN.email) {
        const latestRegisteredUsers = loadRegisteredUsers();
        const updatedRegisteredUsers = latestRegisteredUsers.map(u => {
          if (u.id === user.id) {
            return { ...u, balance: updatedUser.balance };
          }
          return u;
        });
        
        saveRegisteredUsers(updatedRegisteredUsers);
        setRegisteredUsers(updatedRegisteredUsers);
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

  const updateUser = async (updatedUser: User, newPassword?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update current user if it's the same one
      if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
        localStorage.setItem('valorant_user', JSON.stringify(updatedUser));
      }
      
      // Check if updating admin (which is not stored in registered users)
      if (updatedUser.email !== DEFAULT_ADMIN.email) {
        // Update in registered users
        const latestRegisteredUsers = loadRegisteredUsers();
        const updatedRegisteredUsers = latestRegisteredUsers.map(u => {
          if (u.id === updatedUser.id) {
            return {
              ...updatedUser,
              password: newPassword || u.password
            };
          }
          return u;
        });
        
        saveRegisteredUsers(updatedRegisteredUsers);
        setRegisteredUsers(updatedRegisteredUsers);
        console.log('Updated registered user:', updatedUser.username);
      } else {
        console.log('Updated admin user in UI only:', updatedUser.username);
      }
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove all registered users except admin
  const removeAllExceptAdmin = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Admin is not in registered users, so just clear all registered users
      saveRegisteredUsers([]);
      setRegisteredUsers([]);
      
      // Check if current user was removed (if not admin)
      if (user && user.email !== DEFAULT_ADMIN.email) {
        logout();
      }
    } catch (error) {
      console.error('Failed to remove users', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove specific users by email
  const removeUsersByEmails = async (emails: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the latest registered users
      const latestRegisteredUsers = loadRegisteredUsers();
      
      // Filter out users with specified emails
      const filteredUsers = latestRegisteredUsers.filter(u => !emails.includes(u.email));
      
      console.log(`Removing users with emails:`, emails);
      console.log(`Before removal: ${latestRegisteredUsers.length} users, After removal: ${filteredUsers.length} users`);
      
      saveRegisteredUsers(filteredUsers);
      setRegisteredUsers(filteredUsers);
      
      // Check if current user was removed
      if (user && emails.includes(user.email)) {
        logout();
      }
    } catch (error) {
      console.error('Failed to remove users', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update the registeredUsersCount to directly check localStorage
  const registeredUsersCount = loadRegisteredUsers().length;

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
    updateUser,
    removeAllExceptAdmin,
    removeUsersByEmails,
    registeredUsersCount,
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
