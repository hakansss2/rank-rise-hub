
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Edit, Trash2, AlertTriangle, MessageCircle, CheckCircle, Activity } from 'lucide-react';
import UserEditDialog from '@/components/admin/UserEditDialog';
import DeleteSpecificUsers from '@/components/admin/DeleteSpecificUsers';
import { getRankById } from '@/utils/rankData';
import BoostMessagesDialog from '@/components/admin/BoostMessagesDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminPanel = () => {
  const { user, isAuthenticated, isAdmin, getAllUsers, updateUser, removeAllExceptAdmin, registeredUsersCount } = useAuth();
  const { orders, refreshOrders, completeOrder, cancelOrder } = useOrder();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState<any | null>(null);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      console.log('User is not an admin, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    console.log('AdminPanel - Refreshing users in Admin Panel...');
    console.log('AdminPanel - Current localStorage contents:', localStorage.getItem('valorant_registered_users'));
    console.log('AdminPanel - Current registeredUsersCount:', registeredUsersCount);
    
    refreshUsers();
    refreshOrders();
  }, [isAuthenticated, isAdmin, navigate, registeredUsersCount]);

  const refreshUsers = useCallback(() => {
    setLoading(true);
    
    try {
      console.log('AdminPanel - Calling getAllUsers() to refresh user list');
      console.log('AdminPanel - Current localStorage before getAllUsers():', localStorage.getItem('valorant_registered_users'));
      
      const users = getAllUsers();
      console.log("Admin panel - Total users fetched:", users.length, users);
      
      setAllUsers(users);
      
      toast({
        title: "Kullanıcı Listesi Güncellendi",
        description: `Toplam ${users.length} kullanıcı bulundu.`,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);
  
  const handleUserEdit = async (updatedUser: any, newPassword?: string) => {
    try {
      console.log("AdminPanel - Düzenlenecek kullanıcı:", updatedUser);
      console.log("AdminPanel - Yeni şifre var mı:", newPassword ? "Evet" : "Hayır");
      
      await updateUser(updatedUser, newPassword);
      
      console.log("AdminPanel - Kullanıcı güncellendi, şimdi listeyi yeniliyorum");
      refreshUsers();
      
      toast({
        title: "Kullanıcı Güncellendi",
        description: "Kullanıcı bilgileri başarıyla güncellendi.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Güncelleme Başarısız",
        description: "Kullanıcı güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditUser = (user: any) => {
    console.log("Düzenlenecek kullanıcı seçildi:", user);
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCleanupUsers = async () => {
    setLoading(true);
    try {
      await removeAllExceptAdmin();
      refreshUsers();
      
      toast({
        title: "Kullanıcılar Temizlendi",
        description: "Admin (hakan200505@gmail.com) dışındaki tüm kayıtlı kullanıcılar silindi.",
      });
      
      setCleanupDialogOpen(false);
    } catch (error) {
      console.error("Error cleaning up users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessages = (boost: any) => {
    console.log("Viewing messages for boost:", boost);
    setSelectedBoost(boost);
    setMessagesDialogOpen(true);
  };

  const handleCompleteBoost = async (orderId: string) => {
    try {
      console.log("AdminPanel - Completing boost:", orderId);
      await completeOrder(orderId);
      
      toast({
        title: "Boost Tamamlandı",
        description: "Boost başarıyla tamamlandı ve booster'a ödeme yapıldı.",
      });
      
      refreshOrders();
    } catch (error) {
      console.error('Error completing boost:', error);
      toast({
        title: "İşlem Başarısız",
        description: "Boost tamamlanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBoost = async (orderId: string) => {
    try {
      console.log("AdminPanel - Canceling boost:", orderId);
      await cancelOrder(orderId);
      
      toast({
        title: "Boost İptal Edildi",
        description: "Boost başarıyla iptal edildi.",
      });
      
      refreshOrders();
    } catch (error) {
      console.error('Error canceling boost:', error);
      toast({
        title: "İşlem Başarısız",
        description: "Boost iptal edilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const customers = allUsers.filter(u => u.role === 'customer');
  const boosters = allUsers.filter(u => u.role === 'booster' || u.role === 'admin');
  
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };
  
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Devam Ediyor</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Bekliyor</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">İptal Edildi</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">{status}</Badge>;
    }
  };

  const activeBoosts = orders.filter(order => order.status === 'in_progress');
  const completedBoosts = orders.filter(order => order.status === 'completed');
  const pendingBoosts = orders.filter(order => order.status === 'pending');
  const allBoosts = [...activeBoosts, ...completedBoosts, ...pendingBoosts];

  // Helper function to safely display rank name
  const getRankName = (rankId: number): string => {
    const rank = getRankById(rankId);
    return rank ? rank.name : 'Unknown Rank';
  };

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      <Toaster />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-heading">Admin <span className="text-valorant-green">Paneli</span></h1>
            <p className="text-gray-400">Tüm kullanıcıları yönetin ve bakiyeleri görüntüleyin.</p>
            <p className="text-sm text-valorant-green mt-1">Kayıtlı kullanıcı sayısı: {registeredUsersCount}</p>
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={() => {
                console.log('Manual localStorage check:', localStorage.getItem('valorant_registered_users'));
                refreshUsers();
              }} 
              variant="outline" 
              className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-red-500 flex items-center gap-2"
            >
              Yerel Depolamayı Kontrol Et
            </Button>
            <DeleteSpecificUsers />
            <Button 
              onClick={() => setCleanupDialogOpen(true)} 
              variant="outline" 
              className="border-valorant-gray/30 hover:bg-red-500/20 text-red-500 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Kullanıcıları Temizle
            </Button>
            <Button 
              onClick={refreshUsers} 
              variant="outline" 
              className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-blue-500 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Kullanıcıları Yenile
            </Button>
            <Button onClick={toggleCurrency} variant="outline" className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-green-600">
              {currency === 'TRY' ? '₺ TRY' : '$ USD'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4">Toplam Kullanıcı</h2>
            <div className="text-3xl font-bold">{allUsers.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4">Müşteriler</h2>
            <div className="text-3xl font-bold">{customers.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4">Boosterlar</h2>
            <div className="text-3xl font-bold">{boosters.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4">Toplam Boost</h2>
            <div className="text-3xl font-bold">{allBoosts.length}</div>
          </div>
        </div>
        
        <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl mb-12">
          <Tabs defaultValue="all">
            <TabsList className="bg-valorant-gray/20 border border-valorant-gray/30">
              <TabsTrigger value="all" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Tüm Kullanıcılar ({allUsers.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Müşteriler ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="boosters" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Boosterlar ({boosters.length})
              </TabsTrigger>
              <TabsTrigger value="boosts" className="data-[state=active]:bg-valorant-green data-[state=active]:text-white">
                Boostlar ({allBoosts.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-6">
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
                  {allUsers.length > 0 ? (
                    allUsers.map((user) => (
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
                            onClick={() => handleEditUser(user)}
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
                        Henüz kullanıcı bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="customers" className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Kullanıcı Adı</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right font-bold">{formatBalance(user.balance)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                            className="hover:bg-valorant-gray/20 text-blue-500"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Düzenle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        Henüz müşteri bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="boosters" className="pt-6">
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
                  {boosters.length > 0 ? (
                    boosters.map((user) => (
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
                            onClick={() => handleEditUser(user)}
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
                        Henüz booster bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="boosts" className="pt-6">
              <Tabs defaultValue="all-boosts">
                <TabsList className="bg-valorant-gray/10 border border-valorant-gray/20">
                  <TabsTrigger value="all-boosts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Tüm Boostlar ({allBoosts.length})
                  </TabsTrigger>
                  <TabsTrigger value="active-boosts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Aktif ({activeBoosts.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed-boosts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Tamamlanan ({completedBoosts.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending-boosts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Bekleyen ({pendingBoosts.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all-boosts" className="pt-4">
                  <Button 
                    onClick={refreshOrders} 
                    variant="outline"
                    className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-blue-500 flex items-center gap-2 mb-4"
                  >
                    <RefreshCw className="h-4 w-4" /> Boostları Yenile
                  </Button>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Durumu</TableHead>
                        <TableHead>Başlangıç Rank</TableHead>
                        <TableHead>Hedef Rank</TableHead>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Booster</TableHead>
                        <TableHead className="text-right">Fiyat</TableHead>
                        <TableHead className="text-right">Mesajlar</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBoosts.length > 0 ? (
                        allBoosts.map((boost) => {
                          return (
                            <TableRow key={boost.id}>
                              <TableCell className="font-mono text-xs">{boost.id}</TableCell>
                              <TableCell>{getStatusBadge(boost.status)}</TableCell>
                              <TableCell>{getRankName(boost.currentRank)}</TableCell>
                              <TableCell>{getRankName(boost.targetRank)}</TableCell>
                              <TableCell>{boost.userId}</TableCell>
                              <TableCell>{boost.boosterUsername || "-"}</TableCell>
                              <TableCell className="text-right font-bold">{formatBalance(boost.price)}</TableCell>
                              <TableCell className="text-right">
                                <Badge className="bg-valorant-green/10 text-valorant-green border-valorant-green/30">
                                  {boost.messages.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewMessages(boost)}
                                    className="hover:bg-valorant-gray/20 text-blue-500"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  {boost.status === 'in_progress' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleCompleteBoost(boost.id)}
                                      className="hover:bg-valorant-gray/20 text-green-500"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {boost.status === 'pending' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleCancelBoost(boost.id)}
                                      className="hover:bg-valorant-gray/20 text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                            Henüz boost bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="active-boosts" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Başlangıç Rank</TableHead>
                        <TableHead>Hedef Rank</TableHead>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Booster</TableHead>
                        <TableHead>Oyun Kullanıcı Adı</TableHead>
                        <TableHead className="text-right">Fiyat</TableHead>
                        <TableHead className="text-right">Mesajlar</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBoosts.length > 0 ? (
                        activeBoosts.map((boost) => {
                          return (
                            <TableRow key={boost.id}>
                              <TableCell className="font-mono text-xs">{boost.id}</TableCell>
                              <TableCell>{getRankName(boost.currentRank)}</TableCell>
                              <TableCell>{getRankName(boost.targetRank)}</TableCell>
                              <TableCell>{boost.userId}</TableCell>
                              <TableCell>{boost.boosterUsername || "-"}</TableCell>
                              <TableCell>{boost.gameUsername}</TableCell>
                              <TableCell className="text-right font-bold">{formatBalance(boost.price)}</TableCell>
                              <TableCell className="text-right">
                                <Badge className="bg-valorant-green/10 text-valorant-green border-valorant-green/30">
                                  {boost.messages.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewMessages(boost)}
                                    className="hover:bg-valorant-gray/20 text-blue-500"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleCompleteBoost(boost.id)}
                                    className="hover:bg-valorant-gray/20 text-green-500"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                            Henüz aktif boost bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="completed-boosts" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Başlangıç Rank</TableHead>
                        <TableHead>Hedef Rank</TableHead>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Booster</TableHead>
                        <TableHead className="text-right">Fiyat</TableHead>
                        <TableHead className="text-right">Mesajlar</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedBoosts.length > 0 ? (
                        completedBoosts.map((boost) => {
                          return (
                            <TableRow key={boost.id}>
                              <TableCell className="font-mono text-xs">{boost.id}</TableCell>
                              <TableCell>{getRankName(boost.currentRank)}</TableCell>
                              <TableCell>{getRankName(boost.targetRank)}</TableCell>
                              <TableCell>{boost.userId}</TableCell>
                              <TableCell>{boost.boosterUsername || "-"}</TableCell>
                              <TableCell className="text-right font-bold">{formatBalance(boost.price)}</TableCell>
                              <TableCell className="text-right">
                                <Badge className="bg-valorant-green/10 text-valorant-green border-valorant-green/30">
                                  {boost.messages.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleViewMessages(boost)}
                                  className="hover:bg-valorant-gray/20 text-blue-500"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                            Henüz tamamlanmış boost bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="pending-boosts" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Başlangıç Rank</TableHead>
                        <TableHead>Hedef Rank</TableHead>
                        <TableHead>Müşteri</TableHead>
                        <TableHead className="text-right">Fiyat</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBoosts.length > 0 ? (
                        pendingBoosts.map((boost) => {
                          return (
                            <TableRow key={boost.id}>
                              <TableCell className="font-mono text-xs">{boost.id}</TableCell>
                              <TableCell>{getRankName(boost.currentRank)}</TableCell>
                              <TableCell>{getRankName(boost.targetRank)}</TableCell>
                              <TableCell>{boost.userId}</TableCell>
                              <TableCell className="text-right font-bold">{formatBalance(boost.price)}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleCancelBoost(boost.id)}
                                  className="hover:bg-valorant-gray/20 text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            Henüz bekleyen boost bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <UserEditDialog 
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleUserEdit}
      />
      
      <BoostMessagesDialog
        boost={selectedBoost}
        open={messagesDialogOpen}
        onOpenChange={setMessagesDialogOpen}
      />
      
      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent className="bg-valorant-black border border-valorant-gray/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Kullanıcıları Temizle
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bu işlem, admin (hakan200505@gmail.com) dışındaki <strong>tüm kayıtlı kullanıcıları silecek</strong>. 
              Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-valorant-gray/20 border-valorant-gray/30 text-white hover:bg-valorant-gray/30">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupUsers}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Tüm Kullanıcıları Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;

