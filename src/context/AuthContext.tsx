
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  STORAGE_KEYS, 
  getData, 
  setData, 
  addStorageListener, 
  removeData,
  refreshData,
  syncAllTabs,
  initializeStorageHealthCheck
} from '@/utils/storageService';
import { useToast } from '@/hooks/use-toast';
import { authApi, userApi, UserResponse } from '@/utils/apiService';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0);
  const { toast } = useToast();
  
  // İnternet bağlantı kontrolü
  const checkOnlineStatus = () => {
    if (navigator.onLine) {
      if (!document.body.classList.contains('online-mode')) {
        document.body.classList.add('online-mode');
        document.body.classList.remove('offline-mode');
        toast({
          title: "Çevrimiçi moda geçildi",
          description: "İnternet bağlantısı sağlandı, tam özelliklerle devam edebilirsiniz.",
        });
      }
    } else {
      if (!document.body.classList.contains('offline-mode')) {
        document.body.classList.remove('online-mode');
        document.body.classList.add('offline-mode');
        toast({
          title: "Çevrimdışı moda geçildi",
          description: "İnternet bağlantısı yok. Sınırlı özelliklerle devam edilecek.",
          variant: "destructive",
        });
      }
    }
  };
  
  useEffect(() => {
    // İnternet bağlantısı durumunu dinle
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    // İlk kontrol
    checkOnlineStatus();
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);
  
  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    console.log('🔄 AuthProvider - Initial mount, checking session');
    
    try {
      // Tarayıcı depolamasında oturum bilgisi var mı kontrol et
      const storedUser = localStorage.getItem('valorant_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('User session restored:', parsedUser.username);
      }
    } catch (error) {
      console.error('❌ Error loading user session:', error);
      localStorage.removeItem('valorant_user');
    } finally {
      setIsLoading(false);
    }
    
    // Kullanıcı sayısını yükle
    fetchUserCount();
  }, []);

  // Kayıtlı kullanıcı sayısını sunucudan al
  const fetchUserCount = async () => {
    try {
      const response = await authApi.getUserCount();
      setRegisteredUsersCount(response.count);
    } catch (error) {
      console.error('Failed to fetch user count', error);
    }
  };

  // Tüm kullanıcıları getir 
  const getAllUsers = () => {
    // NOT: Backend API'ye bağlandığında burada gerçek bir API çağrısı yapmalısınız
    console.log('🔄 DEBUG: getAllUsers - API çağrısı yapılacak');
    
    // Şimdilik default admin'i döndür
    const adminUser = { 
      id: DEFAULT_ADMIN.id, 
      email: DEFAULT_ADMIN.email, 
      username: DEFAULT_ADMIN.username, 
      role: DEFAULT_ADMIN.role, 
      balance: DEFAULT_ADMIN.balance 
    };
    
    // Çevrimdışı modda localStorage'daki kullanıcıları ekle
    const registeredUsers = getData(STORAGE_KEYS.USERS, []) as any[];
    const users = [adminUser, ...registeredUsers.map(u => {
      // Şifreleri hariç tutarak döndür
      const { password, ...userData } = u;
      return userData;
    })];
    
    return users;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Logging in user:', email);
      
      // API üzerinden giriş yap
      const userData = await authApi.login(email, password);
      
      // Kullanıcı bilgilerini state'e kaydet
      setUser(userData);
      
      // Oturum bilgisini tarayıcı depolamasına kaydet
      localStorage.setItem('valorant_user', JSON.stringify(userData));
      
      console.log('User logged in successfully:', userData.username);
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Giriş Başarısız",
        description: "E-posta veya şifre hatalı.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('📢 Registration - Starting process for:', email);
      
      // API üzerinden kayıt ol
      const userData = await authApi.register(email, username, password);
      
      // Kullanıcı bilgilerini state'e kaydet
      setUser(userData);
      
      // Oturum bilgisini tarayıcı depolamasına kaydet
      localStorage.setItem('valorant_user', JSON.stringify(userData));
      
      console.log('User registered successfully:', userData.username);
      
      // Kayıtlı kullanıcı sayısını güncelle
      fetchUserCount();
      
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız başarıyla oluşturuldu!",
      });
    } catch (error) {
      console.error('Registration failed', error);
      toast({
        title: "Kayıt Başarısız",
        description: "Bu e-posta adresi zaten kullanılıyor olabilir.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('valorant_user');
    
    // Eğer çevrimiçiyse Firebase çıkışını da yap
    if (navigator.onLine) {
      authApi.signOut().catch(err => console.error('Çıkış hatası:', err));
    }
    
    console.log('User logged out');
  };
  
  // Kullanıcı bakiyesine ekleme yap
  const addBalance = async (amount: number) => {
    if (!user) throw new Error('User must be logged in to add balance');
    
    try {
      // Bakiye güncelleme API çağrısı
      const updatedUser = await userApi.updateBalance(user.id, amount);
      
      // State güncelleme
      setUser(updatedUser);
      
      // Kullanıcı bilgisini localStorage'da güncelle
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Bakiye Eklendi",
        description: `Hesabınıza ${amount}₺ eklendi.`,
      });
    } catch (error) {
      console.error('Failed to add balance', error);
      toast({
        title: "İşlem Başarısız",
        description: "Bakiye eklenirken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Kullanıcı bakiyesinden düşme yap
  const deductBalance = async (amount: number): Promise<boolean> => {
    if (!user) throw new Error('User must be logged in to make a purchase');
    
    // Yeterli bakiye kontrolü
    if (user.balance < amount) {
      toast({
        title: "Yetersiz Bakiye",
        description: "Bu işlem için yeterli bakiyeniz bulunmuyor.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Bakiye güncelleme API çağrısı (negatif değer göndererek düşme işlemi)
      const updatedUser = await userApi.updateBalance(user.id, -amount);
      
      // State güncelleme
      setUser(updatedUser);
      
      // Kullanıcı bilgisini localStorage'da güncelle
      localStorage.setItem('valorant_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Failed to deduct balance', error);
      toast({
        title: "İşlem Başarısız",
        description: "Bakiye düşülürken bir hata oluştu.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
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
        setData(STORAGE_KEYS.CURRENT_USER, updatedUser);
      }
      
      // Check if updating admin (which is not stored in registered users)
      if (updatedUser.email !== DEFAULT_ADMIN.email) {
        // Update in registered users
        const latestRegisteredUsers = refreshData(STORAGE_KEYS.USERS, []);
        const updatedRegisteredUsers = latestRegisteredUsers.map(u => {
          if (u.id === updatedUser.id) {
            return {
              ...updatedUser,
              password: newPassword || u.password
            };
          }
          return u;
        });
        
        setData(STORAGE_KEYS.USERS, updatedRegisteredUsers);
        // Düzeltme: setRegisteredUsers yerine setRegisteredUsersCount kullanımı
        // Arayüzde yalnızca sayıyı tutuyoruz, tam kullanıcı listesini değil
        setRegisteredUsersCount(updatedRegisteredUsers.length);
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
      setData(STORAGE_KEYS.USERS, []);
      // Düzeltme: setRegisteredUsers yerine setRegisteredUsersCount kullanımı
      setRegisteredUsersCount(0);
      
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
      const latestRegisteredUsers = refreshData(STORAGE_KEYS.USERS, []);
      
      // Filter out users with specified emails
      const filteredUsers = latestRegisteredUsers.filter(u => !emails.includes(u.email));
      
      console.log(`Removing users with emails:`, emails);
      console.log(`Before removal: ${latestRegisteredUsers.length} users, After removal: ${filteredUsers.length} users`);
      
      setData(STORAGE_KEYS.USERS, filteredUsers);
      // Düzeltme: setRegisteredUsers yerine setRegisteredUsersCount kullanımı
      setRegisteredUsersCount(filteredUsers.length);
      
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
