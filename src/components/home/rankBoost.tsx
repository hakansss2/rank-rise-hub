import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import { valorantRanks, getRankPrice, formatCurrency } from '@/utils/rankData';
import { Button } from '@/components/ui/button';
import RankCard from '@/components/ui/rankCard';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Clock, Shield, Award, Zap, Video, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const RankBoost = () => {
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [targetRank, setTargetRank] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [priorityOrder, setPriorityOrder] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  const {
    createOrder
  } = useOrder();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };
  useEffect(() => {
    if (currentRank && targetRank) {
      const calculatedPrice = getRankPrice(currentRank, targetRank);
      setBasePrice(calculatedPrice);

      // Calculate final price with add-ons
      let totalPrice = calculatedPrice;
      if (priorityOrder) totalPrice += calculatedPrice * 0.2; // 20% increase
      if (streaming) totalPrice += calculatedPrice * 0.1; // 10% increase
      // Offline mode is free

      setFinalPrice(totalPrice);
    }
  }, [currentRank, targetRank, priorityOrder, streaming, offlineMode]);
  const handleRankSelect = (rankId: number) => {
    if (step === 1) {
      setCurrentRank(rankId);
      setStep(2);
    } else {
      if (rankId <= (currentRank || 0)) {
        toast({
          title: "Hata",
          description: "Hedef rank, mevcut rankınızdan yüksek olmalıdır.",
          variant: "destructive"
        });
        return;
      }
      setTargetRank(rankId);
      setStep(3);
    }
  };
  const handleMobileRankSelect = (value: string, stepNumber: number) => {
    const rankId = parseInt(value);
    if (stepNumber === 1) {
      setCurrentRank(rankId);
      setStep(2);
    } else {
      if (rankId <= (currentRank || 0)) {
        toast({
          title: "Hata",
          description: "Hedef rank, mevcut rankınızdan yüksek olmalıdır.",
          variant: "destructive"
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
        variant: "default"
      });
      navigate('/login');
      return;
    }
    if (!currentRank || !targetRank) {
      toast({
        title: "Hata",
        description: "Lütfen mevcut ve hedef rankınızı seçin.",
        variant: "destructive"
      });
      return;
    }
    try {
      await createOrder(currentRank, targetRank, finalPrice);
      toast({
        title: "Başarılı",
        description: "Siparişiniz başarıyla oluşturuldu. Hesabım sayfasından takip edebilirsiniz.",
        variant: "default"
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };
  const renderMobileRankSelector = (stepTitle: string, stepNumber: number) => {
    const currentValue = stepNumber === 1 ? currentRank : targetRank;
    const handleChange = (value: string) => handleMobileRankSelect(value, stepNumber);
    return <div className="animate-fade-in mb-6">
        <h3 className="text-xl font-bold text-white mb-4">{stepTitle}</h3>
        <Select value={currentValue?.toString()} onValueChange={handleChange}>
          <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
            <SelectValue placeholder="Rank seçin" />
          </SelectTrigger>
          <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
            {valorantRanks.map(rank => <SelectItem key={rank.id} value={rank.id.toString()} className="flex items-center">
                <div className="flex items-center">
                  <img src={rank.image} alt={rank.name} className="w-6 h-6 mr-2" />
                  <span>{rank.name}</span>
                </div>
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>;
  };
  const renderDesktopRankGrid = (stepTitle: string) => {
    return <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">{stepTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {valorantRanks.map(rank => <RankCard key={rank.id} rank={rank} isSelected={step === 1 ? currentRank === rank.id : targetRank === rank.id} onClick={() => handleRankSelect(rank.id)} showPrice={false} />)}
        </div>
      </div>;
  };
  const renderStepContent = () => {
    if (step === 1 || step === 2) {
      const stepTitle = step === 1 ? "Mevcut Rankınızı Seçin" : "Hedef Rankınızı Seçin";
      if (isMobile) {
        return renderMobileRankSelector(stepTitle, step);
      } else {
        return renderDesktopRankGrid(stepTitle);
      }
    } else if (step === 3) {
      const current = valorantRanks.find(r => r.id === currentRank);
      const target = valorantRanks.find(r => r.id === targetRank);
      return <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Sipariş Özeti</h2>
          
          <div className="glass-card p-6 md:p-8 rounded-xl mb-8 bg-valorant-black/50 border border-valorant-gray/30">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <span className="text-sm text-gray-400 mb-2">Mevcut Rank</span>
                <div className="flex items-center">
                  <img src={current?.image} alt={current?.name} className="w-12 h-12 md:w-16 md:h-16 mr-2" />
                  <span className="text-lg md:text-xl font-bold text-white">{current?.name}</span>
                </div>
              </div>
              
              <div className="flex items-center text-valorant-green my-2 md:my-0">
                <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <span className="text-sm text-gray-400 mb-2">Hedef Rank</span>
                <div className="flex items-center">
                  <img src={target?.image} alt={target?.name} className="w-12 h-12 md:w-16 md:h-16 mr-2" />
                  <span className="text-lg md:text-xl font-bold text-white">{target?.name}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-valorant-gray/30">
              <div className="space-y-4 mb-6">
                <h3 className="text-white font-medium text-lg">Ek Hizmetler</h3>
                
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="priority" checked={priorityOrder} onCheckedChange={checked => setPriorityOrder(checked === true)} className="data-[state=checked]:bg-valorant-green border-valorant-gray/50" />
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-valorant-green" />
                      <label htmlFor="priority" className="text-sm font-medium text-white cursor-pointer">
                        Extra Öncelikli Sipariş (+%20)
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox id="streaming" checked={streaming} onCheckedChange={checked => setStreaming(checked === true)} className="data-[state=checked]:bg-valorant-green border-valorant-gray/50" />
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-valorant-green" />
                      <label htmlFor="streaming" className="text-sm font-medium text-white cursor-pointer">
                        Yayın (+%10)
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox id="offline" checked={offlineMode} onCheckedChange={checked => setOfflineMode(checked === true)} className="data-[state=checked]:bg-valorant-green border-valorant-gray/50" />
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-5 h-5 text-valorant-green" />
                      <label htmlFor="offline" className="text-sm font-medium text-white cursor-pointer">
                        Ücretsiz Çevrimdışı Mod
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="font-medium text-gray-400">Toplam Tutar:</div>
                  <div className="text-2xl md:text-3xl font-bold text-white flex items-center">
                    {formatCurrency(finalPrice, currency)}
                    <button onClick={toggleCurrency} className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded">
                      {currency === 'TRY' ? 'USD' : 'TRY'}
                    </button>
                  </div>
                  
                  {(priorityOrder || streaming) && <div className="text-sm text-gray-400 mt-1">
                      Baz fiyat: {formatCurrency(basePrice, currency)}
                    </div>}
                </div>
                
                <Button className="bg-valorant-green hover:bg-valorant-darkGreen text-white px-6 py-5 text-base md:text-lg rounded-lg w-full md:w-auto" onClick={handlePurchase}>
                  Şimdi Satın Al <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-valorant-black p-4 md:p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-3 md:mb-4">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-valorant-green mr-2 md:mr-3" />
                <h3 className="text-lg md:text-xl font-bold text-white">Güvenli Boost</h3>
              </div>
              <p className="text-sm md:text-base text-gray-400">
                %100 güvenli boost sistemi ile hesap bilgileriniz şifrelenerek korunur.
              </p>
            </div>
            
            <div className="bg-valorant-black p-4 md:p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-3 md:mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-valorant-green mr-2 md:mr-3" />
                <h3 className="text-lg md:text-xl font-bold text-white">Pro Oyuncular</h3>
              </div>
              <p className="text-sm md:text-base text-gray-400">
                Tüm boosterlarımız profesyonel ve deneyimli oyunculardan oluşur.
              </p>
            </div>
            
            <div className="bg-valorant-black p-4 md:p-6 rounded-lg border border-valorant-gray/30">
              <div className="flex items-center mb-3 md:mb-4">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-valorant-green mr-2 md:mr-3" />
                <h3 className="text-lg md:text-xl font-bold text-white">Hızlı Teslimat</h3>
              </div>
              <p className="text-sm md:text-base text-gray-400">
                Siparişleriniz en kısa sürede tamamlanarak hesabınız teslim edilir.
              </p>
            </div>
          </div>
        </div>;
    }
  };
  return <section className="bg-valorant-black py-12 md:py-20" id="rank-boost">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Valorant <span className="gradient-text">Rank Boost</span> Hizmeti
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            İstediğiniz ranka hızlı ve güvenli bir şekilde ulaşmanızı sağlıyoruz.
          </p>
        </div>

        <div className="bg-valorant-black/70 shadow-xl rounded-2xl backdrop-blur-sm p-4 md:p-6 border border-valorant-gray/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map(s => <div key={s} className={`w-3 h-3 rounded-full ${s === step ? 'bg-valorant-green' : s < step ? 'bg-valorant-green/50' : 'bg-valorant-gray/30'}`} />)}
            </div>
            
            {step > 1 && <Button variant="outline" onClick={handleBack} className="border-valorant-gray/50 hover:bg-valorant-gray/20 text-green-600">
                <ChevronLeft className="w-4 h-4 mr-2" /> Geri
              </Button>}
          </div>

          {renderStepContent()}
        </div>
      </div>
    </section>;
};
export default RankBoost;