import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getRankById } from '@/utils/rankData';
import { Clock, CheckCircle, XCircle, MessageCircle, ArrowRight } from 'lucide-react';
import Image from '@/components/ui/image';
const Dashboard = () => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const {
    getUserOrders,
    setActiveOrder
  } = useOrder();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const orders = getUserOrders();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'completed':
        return 'bg-valorant-green/10 text-valorant-green border-valorant-green/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 mr-1 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekleniyor';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder(order);
      navigate(`/order/${orderId}`);
    }
  };
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  return <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 font-heading">Hoş Geldiniz, <span className="text-valorant-green">{user?.username}</span></h1>
          <p className="text-gray-400">Hesabınızı ve siparişlerinizi buradan yönetebilirsiniz.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-valorant-green mr-2" />
              Toplam Siparişlerim
            </h2>
            <div className="text-3xl font-bold">{orders.length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              Aktif Siparişler
            </h2>
            <div className="text-3xl font-bold">{orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length}</div>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl hover-scale">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-valorant-green mr-2" />
              Tamamlanan Siparişler
            </h2>
            <div className="text-3xl font-bold">{orders.filter(o => o.status === 'completed').length}</div>
          </div>
        </div>
        
        <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Siparişlerim</h2>
            <Button onClick={toggleCurrency} variant="outline" className="border-valorant-gray/30 hover:bg-valorant-gray/20 text-green-600">
              {currency === 'TRY' ? '₺ TRY' : '$ USD'}
            </Button>
          </div>
          
          {orders.length === 0 ? <div className="text-center py-12">
              <div className="text-gray-400 mb-4">Henüz hiç sipariş vermediniz.</div>
              <Button onClick={() => navigate('/ranks')} className="bg-valorant-green hover:bg-valorant-darkGreen text-white">
                Rank Boost Satın Al
              </Button>
            </div> : <div className="space-y-4">
              {orders.map(order => {
            const currentRank = getRankById(order.currentRank);
            const targetRank = getRankById(order.targetRank);
            return <div key={order.id} className="border border-valorant-gray/30 rounded-lg p-4 hover:border-valorant-green/30 transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <Badge className={`font-normal flex items-center ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                          <span className="text-sm text-gray-400 ml-3">
                            Sipariş #{order.id.slice(0, 5)}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex flex-col items-center mr-6">
                            <span className="text-xs text-gray-400 mb-1">Mevcut</span>
                            <div className="flex items-center">
                              {currentRank && <Image src={currentRank.image} alt={currentRank.name} className="w-10 h-10 mr-2" placeholder="/ranks/placeholder.png" />}
                              <span className="font-medium">{currentRank?.name}</span>
                            </div>
                          </div>
                          
                          <ArrowRight className="mx-2 text-valorant-green w-5 h-5" />
                          
                          <div className="flex flex-col items-center ml-2">
                            <span className="text-xs text-gray-400 mb-1">Hedef</span>
                            <div className="flex items-center">
                              {targetRank && <Image src={targetRank.image} alt={targetRank.name} className="w-10 h-10 mr-2" placeholder="/ranks/placeholder.png" />}
                              <span className="font-medium">{targetRank?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end">
                        <div className="font-bold text-xl mb-2">
                          {formatCurrency(order.price, currency)}
                        </div>
                        
                        <Button onClick={() => handleViewOrder(order.id)} className="bg-valorant-green hover:bg-valorant-darkGreen text-white">
                          {order.status === 'in_progress' ? <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Mesajlar ({order.messages.length})
                            </> : 'Detaylar'}
                        </Button>
                      </div>
                    </div>
                  </div>;
          })}
            </div>}
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Dashboard;