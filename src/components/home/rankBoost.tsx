import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import { valorantRanks, getRankPrice, formatCurrency } from '@/utils/rankData';
import { Button } from '@/components/ui/button';
import RankCard from '@/components/ui/rankCard';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Shield,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RankBoost = () => {
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [targetRank, setTargetRank] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { createOrder } = useOrder();
  const { toast } = useToast();

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };

  useEffect(() => {
    if (currentRank && targetRank) {
      const calculatedPrice = getRankPrice(currentRank, targetRank);
      setPrice(calculatedPrice);
    }
  }, [currentRank, targetRank]);

  const handleRankSelect = (rankId: number) => {
    if (step === 1) {
      setCurrentRank(rankId);
      setStep(2);
    } else {
      if (rankId <= (currentRank || 0)) {
        toast({
          title: "Hata",
          description: "Hedef rank, mevcut rankınızdan yüksek olmalıdır.",
          variant: "destructive",
        });
        return;
      }
      setTargetRank(rankId);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setCurrentRank(null);
      setStep(1);
    } else if (step === 3) {
      setTargetRank(null);
      setStep(2);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Giriş Yapın",
        description: "Sipariş verebilmek için giriş yapmanız gerekiyor.",
        variant: "default",
      });
      navigate('/login');
      return;
    }

    if (!currentRank || !targetRank) {
      toast({
        title: "Hata",
        description: "Lütfen mevcut ve hedef rankınızı seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createOrder(currentRank, targetRank, price);
      toast({
        title: "Başarılı",
        description: "Siparişiniz başarıyla oluşturuldu. Hesabım sayfasından takip edebilirsiniz.",
        variant: "default",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Mevcut Rankınızı Seçin</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {valorantRanks.map((rank) => (
              <RankCard
                key={rank.id}
                rank={rank}
                isSelected={currentRank === rank.id}
                onClick={() => handleRankSelect(rank.id)}
                showPrice={false}
              />
            ))}
          </div>
        </div>
      );
    } else if (step === 2) {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Hedef Rankınızı Seçin</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {valorantRanks.map((rank) => (
              <RankCard
                key={rank.id}
                rank={rank}
                isSelected={targetRank === rank.id}
                onClick={() => handleRankSelect(rank.id)}
                showPrice={false}
              />
            ))}
          </div>
        </div>
      );
    } else if (step === 3) {
      const current = valorantRanks.find(r => r.id === currentRank);
      const target = valorantRanks.find(r => r.id === targetRank);

      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Sipariş Özeti</h2>
          
          <div className="glass-card p-8 rounded-xl mb-8 bg-valorant-black/50 border border-valorant-gray/30">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <span className="text-sm text-gray-400 mb-2">Mevcut Rank</span>
                <div className="flex items-center">
                  <img src={current?.image} alt={current?.name} className="w-16 h-16 mr-2" />
                  <span className="text-xl font-bold text-white">{current?.name}</span>
                </div>
              </div>
              
              <div className="flex items-center text-valorant-green my-4 md:my-0">
                <ChevronRight className="w-10 h-10" />
              </div>
              
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <span className="text-sm text-gray-400 mb-2">Hedef Rank</span>
                <div className="flex items-center">
                  <img src={target?.image} alt={target?.name} className="w-16 h-16 mr-2" />
                  <span className="text-xl font-bold text-white">{target?.name}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-valorant-gray/30">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="font-medium text-gray-400">Toplam Tutar:</div>
                  <div className="text-3xl font-bold text-white flex items-center">
                    {formatCurrency(price, currency)}
                    <button 
                      onClick={toggleCurrency}
                      className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded"
                    >
                      {currency === 'TRY' ? 'USD' : 'TRY'}
                    </button>
                  </div>
                </div>
                
                <Button 
                  className="bg-valorant-green hover:bg-valorant-darkGreen text-white px-8 py-6 text-lg rounded-lg w-full md:w-auto"
                  onClick={handlePurchase}
                >
                  Şimdi Satın Al <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-valorant-green mr-3" />
                <h3 className="text-xl font-bold text-white">Güvenli Boost</h3>
              </div>
              <p className="text-gray-400">
                %100 güvenli boost sistemi ile hesap bilgileriniz şifrelenerek korunur.
              </p>
            </div>
            
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 text-valorant-green mr-3" />
                <h3 className="text-xl font-bold text-white">Pro Oyuncular</h3>
              </div>
              <p className="text-gray-400">
                Tüm boosterlarımız profesyonel ve deneyimli oyunculardan oluşur.
              </p>
            </div>
            
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-valorant-green mr-3" />
                <h3 className="text-xl font-bold text-white">Hızlı Teslimat</h3>
              </div>
              <p className="text-gray-400">
                Siparişleriniz en kısa sürede tamamlanarak hesabınız teslim edilir.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="bg-valorant-black py-20" id="rank-boost">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Valorant <span className="gradient-text">Rank Boost</span> Hizmeti
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            İstediğiniz ranka hızlı ve güvenli bir şekilde ulaşmanızı sağlıyoruz. Profesyonel oyuncularımızla hedeflerinize ulaşın.
          </p>
        </div>

        <div className="bg-valorant-black/70 shadow-xl rounded-2xl backdrop-blur-sm p-6 border border-valorant-gray/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full ${
                    s === step
                      ? 'bg-valorant-green'
                      : s < step
                      ? 'bg-valorant-green/50'
                      : 'bg-valorant-gray/30'
                  }`}
                />
              ))}
            </div>
            
            {step > 1 && (
              <Button
                variant="outline"
                className="border-valorant-gray/50 text-white hover:bg-valorant-gray/20"
                onClick={handleBack}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Geri
              </Button>
            )}
          </div>

          {renderStepContent()}
        </div>
      </div>
    </section>
  );
};

export default RankBoost;
