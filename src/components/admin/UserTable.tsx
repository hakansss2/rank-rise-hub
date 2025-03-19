
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw } from 'lucide-react';
import { forceRefreshLocalStorage, validateAndRepairLocalStorage, setupAggressiveRefresh } from '@/utils/localStorageMonitor';
import { useToast } from '@/hooks/use-toast';

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
  
  const refreshUserData = useCallback(() => {
    console.log('🔄 UserTable - refreshUserData executing');
    setIsRefreshing(true);
    
    // Force immediate localStorage update before calling parent refresh
    const directData = forceRefreshLocalStorage('valorant_registered_users');
    console.log('🔍 UserTable - Direct refresh before parent refresh:', directData);
    
    onRefresh();
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [onRefresh]);
  
  useEffect(() => {
    console.log('🏁 UserTable - Component mounted, setting up aggressive refresh');
    
    // Run initial validation and repair
    validateAndRepairLocalStorage('valorant_registered_users');
    
    // Setup more frequent data checking
    const aggressiveCleanup = setupAggressiveRefresh('valorant_registered_users', (data) => {
      if (data && Array.isArray(data)) {
        console.log('⚡ UserTable - Received fresh data from aggressive refresh:', data.length);
        
        if (data.length !== localUsers.length) {
          console.log('🔄 UserTable - Data count changed, triggering refresh');
          refreshUserData();
        }
      }
    }, 500); // Check every 500ms
    
    // Double-check mechanism with direct localStorage access
    const directCheckInterval = setInterval(() => {
      console.log('🔍 UserTable - Direct check');
      
      try {
        const rawData = localStorage.getItem('valorant_registered_users');
        if (rawData) {
          const directData = JSON.parse(rawData);
          if (directData && Array.isArray(directData) && directData.length !== localUsers.length) {
            console.log('🔄 UserTable - Direct check found data change, refreshing');
            refreshUserData();
          }
        }
      } catch (error) {
        console.error('❌ UserTable - Error during direct check:', error);
      }
    }, 750);
    
    return () => {
      console.log('🏁 UserTable - Component unmounting, cleaning up refresh');
      aggressiveCleanup();
      clearInterval(directCheckInterval);
    };
  }, [localUsers.length, refreshUserData]);

  useEffect(() => {
    console.log('📊 UserTable - Props changed, updating local state with', users.length, 'users');
    setLocalUsers(users);
  }, [users]);

  const formatBalance = (balance: number): string => {
    if (currency === 'TRY') {
      return `${balance.toLocaleString('tr-TR')} ₺`;
    } else {
      const usdAmount = balance / 35;
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

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

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      console.log('🔄 UserTable - Manual force refresh initiated');
      
      // Run full validation and repair cycle
      validateAndRepairLocalStorage('valorant_registered_users');
      
      const directUsers = forceRefreshLocalStorage('valorant_registered_users');
      console.log('📊 UserTable - Manual refresh data:', directUsers);
      
      refreshUserData();
      
      toast({
        title: "Kullanıcı verileri yenilendi",
        description: `${Array.isArray(directUsers) ? directUsers.length : 0} kullanıcı bulundu.`,
      });
    } catch (error) {
      console.error('❌ UserTable - Error during manual refresh:', error);
      toast({
        title: "Veri yenileme hatası",
        description: "Beklenmeyen bir hata oluştu. Sayfayı yenileyin.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
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
                    {isRefreshing ? 'Kontrol Ediliyor...' : 'localStorage\'ı Kontrol Et'}
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
