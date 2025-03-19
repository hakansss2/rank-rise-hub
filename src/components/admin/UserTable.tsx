
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STORAGE_KEYS, refreshData, addStorageListener } from '@/utils/storageService';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  currency: 'TRY' | 'USD';
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEditUser, currency, onRefresh }) => {
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Function to refresh the user data
  const refreshUserData = useCallback(() => {
    console.log('🔄 UserTable - refreshUserData executing');
    setIsRefreshing(true);
    
    // Trigger parent refresh which will get latest data
    onRefresh();
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [onRefresh]);
  
  // Set up storage event listener
  useEffect(() => {
    console.log('🏁 UserTable - Component mounted, setting up storage listener');
    
    // Listen for changes to the users data in storage
    const cleanupListener = addStorageListener(STORAGE_KEYS.USERS, (data) => {
      console.log('🔄 UserTable - Storage event received, users count:', data?.length);
      if (Array.isArray(data) && data.length !== localUsers.length) {
        console.log('🔄 UserTable - Data count changed, triggering refresh');
        refreshUserData();
      }
    });
    
    // Manual refresh on interval as backup
    const refreshInterval = setInterval(() => {
      console.log('🔍 UserTable - Scheduled refresh check');
      refreshData(STORAGE_KEYS.USERS, []);
    }, 10000); // Check every 10 seconds
    
    return () => {
      console.log('🏁 UserTable - Component unmounting, cleaning up');
      cleanupListener();
      clearInterval(refreshInterval);
    };
  }, [localUsers.length, refreshUserData]);

  // Update local state when props change
  useEffect(() => {
    console.log('📊 UserTable - Props changed, updating local state with', users.length, 'users');
    setLocalUsers(users);
  }, [users]);

  // Format balance with currency
  const formatBalance = (balance: number): string => {
    if (currency === 'TRY') {
      return `${balance.toLocaleString('tr-TR')} ₺`;
    } else {
      const usdAmount = balance / 35;
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Get badge for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Admin</Badge>;
      case 'booster':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Booster</Badge>;
      case 'customer':
        return <Badge className="bg-valorant-green/10 text-valorant-green border-valorant-green/30">Müşteri</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">{role}</Badge>;
    }
  };

  // Handle manual refresh button
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      console.log('🔄 UserTable - Manual force refresh initiated');
      
      // Refresh data directly from storage
      const userData = refreshData(STORAGE_KEYS.USERS, []);
      console.log('📊 UserTable - Manual refresh data count:', userData.length);
      
      // Trigger parent refresh
      refreshUserData();
      
      toast({
        title: "Kullanıcı verileri yenilendi",
        description: `${userData.length} kullanıcı bulundu.`,
      });
    } catch (error) {
      console.error('❌ UserTable - Error during manual refresh:', error);
      toast({
        title: "Veri yenileme hatası",
        description: "Beklenmeyen bir hata oluştu. Sayfayı yenileyin.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Kullanıcı Listesi <span className="text-valorant-green">({localUsers.length})</span>
        </h2>
        
        <Button 
          onClick={handleForceRefresh}
          variant="outline" 
          className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-blue-500"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Yenileniyor...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verileri Yenile
            </>
          )}
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Kullanıcı Adı</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Bakiye</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localUsers.length > 0 ? (
            localUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-right font-bold">{formatBalance(user.balance)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditUser(user)}
                    className="hover:bg-valorant-gray/20 text-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Düzenle
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                Henüz kullanıcı bulunmuyor.
                <div className="mt-2">
                  <Button 
                    onClick={handleForceRefresh}
                    variant="outline" 
                    className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-blue-500"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? 'Kontrol Ediliyor...' : 'Verileri Kontrol Et'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
