import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RankCard from '@/components/ui/rankCard';

const AdminPanel = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated || !isAdmin) {
    navigate('/login');
    return null;
  }

  const [boosters, setBoosters] = useState([
    { id: '2', email: 'booster@valorank.com', username: 'booster', role: 'booster' },
    { id: '4', email: 'booster2@valorank.com', username: 'booster2', role: 'booster' },
  ]);
  
  const [newBooster, setNewBooster] = useState({ email: '', username: '', password: '' });
  
  const [basePrices, setBasePrices] = useState({ ...rankBasePrices });
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState<number>(0);

  const handleAddBooster = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBooster.email || !newBooster.username || !newBooster.password) {
      toast({
        title: 'Hata',
        description: 'Tüm booster bilgilerini doldurun.',
        variant: 'destructive',
      });
      return;
    }
    
    const newBoosterObj = {
      id: (boosters.length + 3).toString(),
      email: newBooster.email,
      username: newBooster.username,
      role: 'booster',
    };
    
    setBoosters([...boosters, newBoosterObj]);
    setNewBooster({ email: '', username: '', password: '' });
    
    toast({
      title: 'Booster eklendi',
      description: `${newBoosterObj.username} başarıyla eklendi.`,
    });
  };

  const handleRemoveBooster = (id: string) => {
    setBoosters(boosters.filter(b => b.id !== id));
    toast({
      title: 'Booster silindi',
      description: 'Booster başarıyla silindi.',
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

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 font-heading">Admin <span className="text-valorant-green">Paneli</span></h1>
          <p className="text-gray-400">Site ayarlarını, boosterları ve fiyatları yönetin.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
          
          <Tabs defaultValue="boosters">
            <TabsList className="bg-valorant-gray/20 border border-valorant-gray/30">
              <TabsTrigger value="boosters" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Boosterlar
              </TabsTrigger>
              <TabsTrigger value="prices" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Fiyatlar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="boosters" className="pt-6">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Booster Ekle</h3>
                <form onSubmit={handleAddBooster} className="bg-valorant-gray/10 border border-valorant-gray/30 rounded-lg p-4">
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
                  >
                    <Plus className="w-4 h-4 mr-2" />
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500/10"
                                onClick={() => handleRemoveBooster(booster.id)}
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
                        rank={valorantRanks.find(r => r.tier === tier && r.division === 2)!}
                        showTier={true}
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
