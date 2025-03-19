
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { forceRefreshLocalStorage } from '@/utils/localStorageMonitor';

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

  // Force refresh the user data from localStorage every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 UserTable - Periodic force refresh');
      const directUsers = forceRefreshLocalStorage('valorant_registered_users');
      
      if (directUsers && Array.isArray(directUsers)) {
        console.log('📊 UserTable - Fresh localStorage data:', directUsers.length, directUsers);
        // If we have direct data from localStorage and the count differs, trigger a refresh
        if (directUsers.length !== users.length) {
          console.log('🔄 UserTable - User count mismatch, triggering refresh');
          onRefresh();
        }
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [users.length, onRefresh]);

  // Update local state when props change
  useEffect(() => {
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

  const handleForceRefresh = () => {
    console.log('🔄 UserTable - Manual force refresh');
    const directUsers = forceRefreshLocalStorage('valorant_registered_users');
    console.log('📊 UserTable - Fresh localStorage data (manual):', directUsers);
    onRefresh();
  };

  return (
    <div>
      <div className="mb-4">
        <Button 
          onClick={handleForceRefresh}
          variant="outline" 
          className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-blue-500"
        >
          Kullanıcı Verilerini Doğrudan localStorage'dan Yenile
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
                  >
                    localStorage'ı Kontrol Et
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
