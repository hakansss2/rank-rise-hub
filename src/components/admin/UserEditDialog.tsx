
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedUser: User, newPassword?: string) => void;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ user, open, onOpenChange, onSave }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [role, setRole] = useState<'customer' | 'booster' | 'admin'>(user?.role || 'customer');
  const [balance, setBalance] = useState(user?.balance?.toString() || '0');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
      setRole(user.role);
      setBalance(user.balance.toString());
      setNewPassword('');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate balance
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      toast({
        title: "Geçersiz bakiye",
        description: "Lütfen geçerli bir bakiye girin",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUser: User = {
      ...user,
      email,
      username,
      role,
      balance: numBalance
    };
    
    onSave(updatedUser, newPassword || undefined);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-valorant-black border border-valorant-gray/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Kullanıcı Düzenle</DialogTitle>
          <DialogDescription className="text-gray-400">
            Kullanıcı bilgilerini güncelleyin. Şifreyi boş bırakırsanız değiştirilmez.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-white">
              Kullanıcı Adı
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 bg-valorant-gray/20 border-valorant-gray/30 text-white"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-white">
              E-posta
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3 bg-valorant-gray/20 border-valorant-gray/30 text-white"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right text-white">
              Rol
            </Label>
            <Select 
              value={role} 
              onValueChange={(value: 'customer' | 'booster' | 'admin') => setRole(value)}
            >
              <SelectTrigger className="col-span-3 bg-valorant-gray/20 border-valorant-gray/30 text-white">
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent className="bg-valorant-black border border-valorant-gray/30 text-white">
                <SelectItem value="customer">Müşteri</SelectItem>
                <SelectItem value="booster">Booster</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right text-white">
              Bakiye (₺)
            </Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="col-span-3 bg-valorant-gray/20 border-valorant-gray/30 text-white"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-white">
              Yeni Şifre
            </Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="col-span-3 bg-valorant-gray/20 border-valorant-gray/30 text-white"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="bg-valorant-green hover:bg-valorant-darkGreen"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
