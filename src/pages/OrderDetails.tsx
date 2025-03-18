
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getRankById } from '@/utils/rankData';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  SendHorizonal,
  ArrowLeft,
  User,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import Image from '@/components/ui/image';
import { useToast } from '@/hooks/use-toast';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isBooster } = useAuth();
  const { getOrderById, sendMessage, completeOrder, cancelOrder, claimOrder } = useOrder();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');

  const order = id ? getOrderById(id) : null;
  
  const currentRank = order ? getRankById(order.currentRank) : null;
  const targetRank = order ? getRankById(order.targetRank) : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!order) {
      navigate('/dashboard');
      return;
    }

    if (user?.id !== order.userId && !isBooster) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, order, user, navigate, isBooster]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [order?.messages]);

  const getStatusColor = (status: string) => {
    switch(status) {
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
    switch(status) {
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
    switch(status) {
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

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return;
    
    try {
      await sendMessage(id, message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Mesaj gönderilemedi',
        description: 'Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const handleClaimOrder = async () => {
    if (!id) return;
    
    try {
      await claimOrder(id);
      toast({
        title: 'Sipariş alındı',
        description: 'Sipariş başarıyla alındı. Müşteri ile iletişime geçebilirsiniz.',
      });
    } catch (error) {
      console.error('Error claiming order:', error);
      toast({
        title: 'Sipariş alınamadı',
        description: 'Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteOrder = async () => {
    if (!id) return;
    
    try {
      await completeOrder(id);
      toast({
        title: 'Sipariş tamamlandı',
        description: 'Sipariş başarıyla tamamlandı.',
      });
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: 'Sipariş tamamlanamadı',
        description: 'Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    
    try {
      await cancelOrder(id);
      toast({
        title: 'Sipariş iptal edildi',
        description: 'Sipariş başarıyla iptal edildi.',
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: 'Sipariş iptal edilemedi',
        description: 'Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Geri Dön
          </Link>
          
          <h1 className="text-3xl font-bold mb-2 font-heading">Sipariş Detayları</h1>
          <p className="text-gray-400">Sipariş #{id?.slice(0, 5)}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Information */}
          <div className="lg:col-span-1">
            <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-6 shadow-xl sticky top-24">
              <div className="mb-6">
                <Badge className={`font-normal flex items-center text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </Badge>
                
                <div className="mt-4 text-sm text-gray-400">
                  Oluşturulma: {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Boost Bilgileri</h3>
                
                <div className="bg-valorant-black/50 border border-valorant-gray/30 rounded-lg p-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Mevcut</span>
                        {currentRank && (
                          <Image 
                            src={currentRank.image} 
                            alt={currentRank.name} 
                            className="w-16 h-16"
                            placeholder="/ranks/placeholder.png"
                          />
                        )}
                        <span className="mt-1 font-medium text-sm">{currentRank?.name}</span>
                      </div>
                      
                      <ChevronRight className="text-valorant-green w-6 h-6" />
                      
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">Hedef</span>
                        {targetRank && (
                          <Image 
                            src={targetRank.image} 
                            alt={targetRank.name} 
                            className="w-16 h-16"
                            placeholder="/ranks/placeholder.png"
                          />
                        )}
                        <span className="mt-1 font-medium text-sm">{targetRank?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-valorant-gray/30">
                    <span className="text-gray-400">Toplam Tutar:</span>
                    <div className="flex items-center">
                      <span className="font-bold">{formatCurrency(order.price, currency)}</span>
                      <button 
                        onClick={toggleCurrency}
                        className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded"
                      >
                        {currency === 'TRY' ? 'USD' : 'TRY'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              {isBooster && (
                <div className="space-y-3">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={handleClaimOrder}
                      className="w-full bg-valorant-green hover:bg-valorant-darkGreen text-white"
                    >
                      Siparişi Al
                    </Button>
                  )}
                  
                  {order.status === 'in_progress' && order.boosterId === user?.id && (
                    <Button 
                      onClick={handleCompleteOrder}
                      className="w-full bg-valorant-green hover:bg-valorant-darkGreen text-white"
                    >
                      Siparişi Tamamla
                    </Button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'in_progress') && (
                    <Button 
                      onClick={handleCancelOrder}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      Siparişi İptal Et
                    </Button>
                  )}
                </div>
              )}
              
              {user?.id === order.userId && order.status === 'pending' && (
                <Button 
                  onClick={handleCancelOrder}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  Siparişi İptal Et
                </Button>
              )}
            </div>
          </div>
          
          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-valorant-gray/30 flex items-center">
                <MessageCircle className="w-5 h-5 text-valorant-green mr-2" />
                <h2 className="text-lg font-bold">Mesajlaşma</h2>
              </div>
              
              <div 
                ref={chatContainerRef}
                className="h-[400px] overflow-y-auto p-4 space-y-4 bg-valorant-black/30"
              >
                {order.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="w-10 h-10 mb-2 text-valorant-gray" />
                    <p className="text-center">Henüz mesaj yok. İlk mesajı gönderebilirsiniz.</p>
                  </div>
                ) : (
                  order.messages.map((msg) => {
                    const isCurrentUser = msg.senderId === user?.id;
                    
                    return (
                      <div 
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isCurrentUser 
                              ? 'bg-valorant-green text-white rounded-tr-none' 
                              : 'bg-valorant-gray text-white rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <User className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">{isCurrentUser ? 'Siz' : msg.senderName}</span>
                          </div>
                          <p>{msg.content}</p>
                          <div className="text-xs opacity-70 text-right mt-1">
                            {format(new Date(msg.timestamp), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Message Input */}
              {(order.status === 'in_progress' || order.status === 'pending') && (
                <div className="p-4 border-t border-valorant-gray/30">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="bg-valorant-gray/20 border-valorant-gray/30 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-valorant-green hover:bg-valorant-darkGreen text-white"
                    >
                      <SendHorizonal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {(order.status === 'completed' || order.status === 'cancelled') && (
                <div className="p-4 border-t border-valorant-gray/30 text-center text-gray-400 text-sm">
                  Bu sipariş {order.status === 'completed' ? 'tamamlandı' : 'iptal edildi'} ve mesajlaşma kapatıldı.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetails;
