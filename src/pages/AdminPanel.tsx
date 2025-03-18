import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Edit, Trash2, AlertTriangle } from 'lucide-react';
import UserEditDialog from '@/components/admin/UserEditDialog';
import DeleteSpecificUsers from '@/components/admin/DeleteSpecificUsers';
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
  const { user, isAuthenticated, isAdmin, getAllUsers, removeAllExceptAdmin } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  
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
    
    refreshUsers();
  }, [isAuthenticated, isAdmin, navigate]);

  const refreshUsers = useCallback(() => {
    setLoading(true);
    
    try {
      const users = getAllUsers();
      console.log("Admin panel - Total users fetched:", users.length);
      
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
      const { updateUser } = useAuth();
      await updateUser(updatedUser, newPassword);
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

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      <Toaster />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-heading">Admin <span className="text-valorant-green">Paneli</span></h1>
            <p className="text-gray-400">Tüm kullanıcıları yönetin ve bakiyeleri görüntüleyin.</p>
          </div>
          <div className="flex space-x-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
          </Tabs>
        </div>
      </div>
      
      <UserEditDialog 
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleUserEdit}
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
