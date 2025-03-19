
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw } from 'lucide-react';
import { forceRefreshLocalStorage, validateAndRepairLocalStorage } from '@/utils/localStorageMonitor';
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
  
  // Bileşen mount olduğunda localStorage'ı doğrula ve onar
  useEffect(() => {
    console.log('🏁 UserTable - Component mounted, validating localStorage');
    const repairedUsers = validateAndRepairLocalStorage('valorant_registered_users');
    if (repairedUsers && repairedUsers.length !== users.length) {
      console.log('🔄 UserTable - Repaired users data is different, triggering refresh');
      onRefresh();
    }
    
    // İlk yükleme anında localStorage'dan doğrudan kontrol
    console.log('🔄 UserTable - Initial direct localStorage check');
    const directUsers = forceRefreshLocalStorage('valorant_registered_users');
    
    if (directUsers && Array.isArray(directUsers)) {
      console.log('📊 UserTable - Fresh localStorage users data:', directUsers.length, directUsers);
      
      // En son verileri almak için daima refresh'i tetikle
      if (directUsers.length !== users.length) {
        console.log('🔄 UserTable - User count different, triggering refresh');
        onRefresh();
      }
    }
  }, []);

  // Daha iyi tepkimelilik için daha sık kontroller
  useEffect(() => {
    // Çok kısa aralıklı kontrol için
    const quickCheckInterval = setInterval(() => {
      console.log('🔄 UserTable - Quick direct localStorage check');
      const directUsers = forceRefreshLocalStorage('valorant_registered_users');
      
      if (directUsers && Array.isArray(directUsers)) {
        console.log('📊 UserTable - Fresh localStorage users data:', directUsers.length, directUsers);
        
        // En son verileri almak için daima refresh'i tetikle
        if (directUsers.length !== localUsers.length) {
          console.log('🔄 UserTable - User count changed, triggering refresh');
          onRefresh();
        }
      }
    }, 2000); // Her 2 saniyede kontrol et
    
    return () => clearInterval(quickCheckInterval);
  }, [localUsers.length, onRefresh]);

  // Özellikler değiştiğinde yerel durumu güncelle
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
      
      // Önce localStorage'ı doğrula ve onar
      validateAndRepairLocalStorage('valorant_registered_users');
      
      // localStorage'dan anında yenile
      const directUsers = forceRefreshLocalStorage('valorant_registered_users');
      console.log('📊 UserTable - Manual refresh data:', directUsers);
      
      // Geçerli bir yanıt alıp almadığımızı kontrol et
      if (directUsers && Array.isArray(directUsers)) {
        // Ebeveyn yenilemeyi tetikle
        onRefresh();
        
        toast({
          title: "Kullanıcı verileri güncellendi",
          description: `${directUsers.length} kullanıcı bulundu.`,
        });
      } else {
        console.error('❌ UserTable - Invalid data during manual refresh');
        toast({
          title: "Veri yenileme başarısız",
          description: "Yeniden deneyebilir veya sayfayı yenileyebilirsiniz.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ UserTable - Error during manual refresh:', error);
      toast({
        title: "Veri yenileme hatası",
        description: "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.",
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
