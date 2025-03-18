
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { valorantRanks, rankBasePrices, getRankDivisionPrice } from '@/utils/rankData';
import { 
  Users, 
  Briefcase, 
  Settings, 
  DollarSign, 
  Plus, 
  Trash, 
  Edit,
  Save,
  XCircle,
  Info,
  User,
  UserPlus,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RankCard from '@/components/ui/rankCard';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPanel = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { orders } = useOrder();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("boosters");
  
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Get all users from localStorage for admin management
  const [allUsers, setAllUsers] = useState<Array<any>>([]);
  const [admins, setAdmins] = useState<Array<any>>([]);
  const [boosters, setBoosters] = useState<Array<any>>([]);
  
  // Load all users from localStorage
  useEffect(() => {
    // Load registered users
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('valorant_registered_users');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          setAllUsers(parsedUsers);
          
          // Filter admins and boosters
          setAdmins(parsedUsers.filter((u: any) => u.role === 'admin'));
          setBoosters(parsedUsers.filter((u: any) => u.role === 'booster'));
        } catch (error) {
          console.error('Failed to parse stored users', error);
        }
      }
    };
    
    loadUsers();
    
    // Also add the default admin
    setAdmins(prev => {
      const defaultAdmin = { id: '1', email: 'hakan200505@gmail.com', username: 'admin', role: 'admin' };
      // Check if already exists
      if (!prev.some(a => a.id === '1')) {
        return [...prev, defaultAdmin];
      }
      return prev;
    });
  }, []);
  
  const [newBooster, setNewBooster] = useState({ email: '', username: '', password: '' });
  const [newAdmin, setNewAdmin] = useState({ email: '', username: '', password: '' });
  const [newUserRole, setNewUserRole] = useState<'booster' | 'admin'>('booster');
  
  const [basePrices, setBasePrices] = useState({ ...rankBasePrices });
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState<number>(0);

  // Save users to localStorage
  const saveUsers = (updatedUsers: any[]) => {
    localStorage.setItem('valorant_registered_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    setAdmins(updatedUsers.filter(u => u.role === 'admin'));
    setBoosters(updatedUsers.filter(u => u.role === 'booster'));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = newUserRole === 'admin' ? newAdmin : newBooster;
    
    if (!userData.email || !userData.username || !userData.password) {
      toast({
        title: 'Hata',
        description: 'Tüm kullanıcı bilgilerini doldurun.',
        variant: 'destructive',
      });
      return;
    }
    
    const newUserObj = {
      id: `u-${Date.now()}`,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: newUserRole,
      balance: 0,
    };
    
    // Update localStorage
    const updatedUsers = [...allUsers, newUserObj];
    saveUsers(updatedUsers);
    
    // Reset form
    if (newUserRole === 'admin') {
      setNewAdmin({ email: '', username: '', password: '' });
    } else {
      setNewBooster({ email: '', username: '', password: '' });
    }
    
    toast({
      title: `${newUserRole === 'admin' ? 'Admin' : 'Booster'} eklendi`,
      description: `${newUserObj.username} başarıyla eklendi.`,
    });
  };

  const handleRemoveUser = (id: string, role: string) => {
    // Don't allow removing the default admin
    if (id === '1' && role === 'admin') {
      toast({
        title: 'İşlem Reddedildi',
        description: 'Varsayılan admin hesabı silinemez.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedUsers = allUsers.filter(u => u.id !== id);
    saveUsers(updatedUsers);
    
    toast({
      title: `${role === 'admin' ? 'Admin' : 'Booster'} silindi`,
      description: 'Kullanıcı başarıyla silindi.',
    });
  };

  const handleChangeRole = (id: string, currentRole: string, newRole: 'admin' | 'booster' | 'customer') => {
    // Don't allow changing the default admin
    if (id === '1' && currentRole === 'admin') {
      toast({
        title: 'İşlem Reddedildi',
        description: 'Varsayılan admin rolü değiştirilemez.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedUsers = allUsers.map(u => {
      if (u.id === id) {
        return { ...u, role: newRole };
      }
      return u;
    });
    
    saveUsers(updatedUsers);
    
    toast({
      title: 'Rol Değiştirildi',
      description: `Kullanıcı rolü ${newRole} olarak güncellendi.`,
    });
  };

  const startEditingPrice = (tier: string, price: number) => {
    setEditingPrice(tier);
    setPriceValue(price);
  };

  const savePrice = (tier: string) => {
    setBasePrices({ ...basePrices, [tier]: priceValue });
    setEditingPrice(null);
    toast({
      title: 'Fiyat güncellendi',
      description: `${tier.toUpperCase()} fiyatı başarıyla güncellendi.`,
    });
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Find a valid rank for demo visualization that doesn't require an image to load
  const getValidRankByTier = (tier: string, division: number = 2) => {
    const rank = valorantRanks.find(r => r.tier === tier && r.division === division);
    return rank || valorantRanks[0]; // Fallback to first rank if not found
  };

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 font-heading">Admin <span className="text-valorant-green">Paneli</span></h1>
          <p className="text-gray-400">Site ayarlarını, adminleri, boosterları ve fiyatları yönetin.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Shield className="w-5 h-5 text-valorant-green mr-2" />
              Toplam Admin
            </h2>
            <div className="text-3xl font-bold">{admins.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 text-valorant-green mr-2" />
              Toplam Booster
            </h2>
            <div className="text-3xl font-bold">{boosters.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 text-valorant-green mr-2" />
              Toplam Sipariş
            </h2>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-valorant-green mr-2" />
              Toplam Kazanç
            </h2>
            <div className="text-3xl font-bold">
              {orders.reduce((total, order) => total + order.price, 0).toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>
        
        <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Settings className="w-5 h-5 text-valorant-green mr-2" />
              Yönetim Paneli
            </h2>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-valorant-gray/20 border border-valorant-gray/30">
              <TabsTrigger value="admins" className={cn(
                "data-[state=active]:bg-valorant-green data-[state=active]:text-white"
              )}>
                Adminler
              </TabsTrigger>
              <TabsTrigger value="boosters" className={cn(
                "data-[state=active]:bg-valorant-green data-[state=active]:text-white"
              )}>
                Boosterlar
              </TabsTrigger>
              <TabsTrigger value="prices" className={cn(
                "data-[state=active]:bg-valorant-green data-[state=active]:text-white"
              )}>
                Fiyatlar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admins" className="pt-6">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Admin Ekle</h3>
                <form onSubmit={handleAddUser} className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="admin-email" className="block text-sm font-medium text-gray-400 mb-1">E-posta</label>
                      <Input
                        type="email"
                        id="admin-email"
                        placeholder="e-posta@ornegi.com"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="admin-username" className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                      <Input
                        type="text"
                        id="admin-username"
                        placeholder="kullanici_adi"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="admin-password" className="block text-sm font-medium text-gray-400 mb-1">Şifre</label>
                      <Input
                        type="password"
                        id="admin-password"
                        placeholder="••••••••"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="bg-valorant-green hover:bg-valorant-darkGreen text-white"
                    onClick={() => setNewUserRole('admin')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Ekle
                  </Button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Mevcut Adminler</h3>
                
                <div className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-valorant-gray/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Kullanıcı Adı</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">E-posta</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-valorant-gray/30">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-valorant-gray/10">
                          <td className="px-4 py-3 text-sm text-gray-300">{admin.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-white">{admin.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{admin.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                    disabled={admin.id === '1'} // Disable for default admin
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-valorant-black border-valorant-gray/40 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Rol Değiştir</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      {admin.username} kullanıcısının rolünü değiştir
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <label className="text-sm font-medium text-gray-400 mb-2 block">Yeni Rol</label>
                                    <Select 
                                      onValueChange={(value) => handleChangeRole(admin.id, admin.role, value as any)}
                                      defaultValue={admin.role}
                                    >
                                      <SelectTrigger className="bg-valorant-gray/20 border-valorant-gray/30 text-white">
                                        <SelectValue placeholder="Rol seçin" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-valorant-black border-valorant-gray/40 text-white">
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="booster">Booster</SelectItem>
                                        <SelectItem value="customer">Müşteri</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500/10"
                                onClick={() => handleRemoveUser(admin.id, admin.role)}
                                disabled={admin.id === '1'} // Disable for default admin
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="boosters" className="pt-6">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Booster Ekle</h3>
                <form onSubmit={handleAddUser} className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">E-posta</label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="e-posta@ornegi.com"
                        value={newBooster.email}
                        onChange={(e) => setNewBooster({ ...newBooster, email: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                      <Input
                        type="text"
                        id="username"
                        placeholder="kullanici_adi"
                        value={newBooster.username}
                        onChange={(e) => setNewBooster({ ...newBooster, username: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Şifre</label>
                      <Input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={newBooster.password}
                        onChange={(e) => setNewBooster({ ...newBooster, password: e.target.value })}
                        className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="bg-valorant-green hover:bg-valorant-darkGreen text-white"
                    onClick={() => setNewUserRole('booster')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Booster Ekle
                  </Button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Mevcut Boosterlar</h3>
                
                <div className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-valorant-gray/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Kullanıcı Adı</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">E-posta</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-valorant-gray/30">
                      {boosters.map((booster) => (
                        <tr key={booster.id} className="hover:bg-valorant-gray/10">
                          <td className="px-4 py-3 text-sm text-gray-300">{booster.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-white">{booster.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{booster.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-valorant-black border-valorant-gray/40 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Rol Değiştir</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      {booster.username} kullanıcısının rolünü değiştir
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <label className="text-sm font-medium text-gray-400 mb-2 block">Yeni Rol</label>
                                    <Select 
                                      onValueChange={(value) => handleChangeRole(booster.id, booster.role, value as any)}
                                      defaultValue={booster.role}
                                    >
                                      <SelectTrigger className="bg-valorant-gray/20 border-valorant-gray/30 text-white">
                                        <SelectValue placeholder="Rol seçin" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-valorant-black border-valorant-gray/40 text-white">
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="booster">Booster</SelectItem>
                                        <SelectItem value="customer">Müşteri</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500/10"
                                onClick={() => handleRemoveUser(booster.id, booster.role)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="prices" className="pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Rank Baz Fiyatları</h3>
                <p className="text-gray-400 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-2 text-valorant-green" />
                  Bu fiyatlar, her rank kademesi için baz fiyat olarak kullanılacaktır. Division 1: %20 indirimli, Division 2: Baz fiyat, Division 3: %20 ek ücretli olarak uygulanır.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(basePrices).map(([tier, price]) => (
                  <div 
                    key={tier}
                    className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg p-4 flex flex-col"
                  >
                    <div className="flex items-center mb-3">
                      <RankCard 
                        rank={getValidRankByTier(tier)}
                        showTier={true}
                        showPrice={false}
                      />
                    </div>
                    
                    {editingPrice === tier ? (
                      <div className="mt-2">
                        <div className="flex items-center mb-2">
                          <Input
                            type="number"
                            value={priceValue}
                            onChange={(e) => setPriceValue(Number(e.target.value))}
                            className="bg-valorant-gray/20 border-valorant-gray/30 text-white mr-2"
                          />
                          <div className="text-lg font-bold">₺</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => savePrice(tier)}
                            className="bg-valorant-green hover:bg-valorant-darkGreen text-white"
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Kaydet
                          </Button>
                          <Button
                            onClick={cancelEditingPrice}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Division 1:</div>
                            <div className="text-valorant-green">{Math.round(price * 0.8)} ₺</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Division 2:</div>
                            <div className="text-valorant-green">{price} ₺</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Division 3:</div>
                            <div className="text-valorant-green">{Math.round(price * 1.2)} ₺</div>
                          </div>
                          <Button
                            onClick={() => startEditingPrice(tier, price)}
                            variant="outline"
                            className="border-valorant-green text-valorant-green hover:bg-valorant-green/10 mt-2"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Düzenle
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
