
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RankBoost = () => {
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [targetRank, setTargetRank] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [priorityOrder, setPriorityOrder] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // New state for tier-division selection
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [currentDivision, setCurrentDivision] = useState<number | null>(null);
  const [targetTier, setTargetTier] = useState<string | null>(null);
  const [targetDivision, setTargetDivision] = useState<number | null>(null);
  
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
  
  // Group ranks by tier for the new selection UI
  const rankTiers = Array.from(new Set(valorantRanks.map(rank => rank.tier)));
  
  // Get divisions for a specific tier
  const getDivisionsForTier = (tier: string) => {
    return valorantRanks.filter(rank => rank.tier === tier);
  };
  
  // Handle tier selection
  const handleTierSelect = (tier: string, isTarget: boolean) => {
    if (isTarget) {
      setTargetTier(tier);
      setTargetDivision(null);
    } else {
      setCurrentTier(tier);
      setCurrentDivision(null);
    }
  };
  
  // Handle division selection
  const handleDivisionSelect = (rankId: number, isTarget: boolean) => {
    const selectedRank = valorantRanks.find(r => r.id === rankId);
    
    if (isTarget) {
      setTargetDivision(selectedRank?.division || null);
      setTargetRank(rankId);
    } else {
      setCurrentDivision(selectedRank?.division || null);
      setCurrentRank(rankId);
    }
  };
  
  // Find rank ID from tier and division
  const findRankId = (tier: string | null, division: number | null) => {
    if (!tier || division === null) return null;
    const rank = valorantRanks.find(r => r.tier === tier && r.division === division);
    return rank?.id || null;
  };
  
  // Update currentRank and targetRank when tier and division change
  useEffect(() => {
    if (currentTier && currentDivision !== null) {
      const rankId = findRankId(currentTier, currentDivision);
      if (rankId) setCurrentRank(rankId);
    }
    
    if (targetTier && targetDivision !== null) {
      const rankId = findRankId(targetTier, targetDivision);
      if (rankId) setTargetRank(rankId);
    }
  }, [currentTier, currentDivision, targetTier, targetDivision]);
  
  // Calculate price based on rank selections
  useEffect(() => {
    if (currentRank && targetRank) {
      if (targetRank <= currentRank) {
        // Don't update price if target rank is lower than current rank
        return;
      }
      
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
  
  // Validate rank selections
  const validateRankSelection = () => {
    if (!currentRank || !targetRank) {
      toast({
        title: "Hata",
        description: "Lütfen mevcut ve hedef rankınızı seçin.",
        variant: "destructive"
      });
      return false;
    }
    
    if (targetRank <= currentRank) {
      toast({
        title: "Hata",
        description: "Hedef rank, mevcut rankınızdan yüksek olmalıdır.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
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
    
    if (!validateRankSelection()) return;
    
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
  
  // Render tier selection dropdown
  const renderTierSelector = (isTarget: boolean) => {
    const selectedTier = isTarget ? targetTier : currentTier;
    const label = isTarget ? "Hedef Tier" : "Mevcut Tier";
    
    return (
      <div className="w-full">
        <label className="text-sm font-medium text-white mb-2 block">{label}</label>
        <Select value={selectedTier || undefined} onValueChange={(value) => handleTierSelect(value, isTarget)}>
          <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
            <SelectValue placeholder="Tier seçin" />
          </SelectTrigger>
          <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
            {rankTiers.map(tier => (
              <SelectItem key={tier} value={tier} className="flex items-center capitalize">
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  // Render division selection dropdown
  const renderDivisionSelector = (isTarget: boolean) => {
    const selectedTier = isTarget ? targetTier : currentTier;
    const selectedDivision = isTarget ? targetDivision : currentDivision;
    const label = isTarget ? "Hedef Division" : "Mevcut Division";
    
    if (!selectedTier) return null;
    
    const divisions = getDivisionsForTier(selectedTier);
    
    return (
      <div className="w-full">
        <label className="text-sm font-medium text-white mb-2 block">{label}</label>
        <Select 
          value={selectedDivision?.toString() || undefined} 
          onValueChange={(value) => {
            const rank = divisions.find(d => d.division === parseInt(value));
            if (rank) handleDivisionSelect(rank.id, isTarget);
          }}
        >
          <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
            <SelectValue placeholder="Division seçin" />
          </SelectTrigger>
          <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
            {divisions.map(rank => (
              <SelectItem key={rank.id} value={rank.division.toString()} className="flex items-center">
                <div className="flex items-center">
                  <img src={rank.image} alt={rank.name} className="w-6 h-6 mr-2" />
                  <span>{rank.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  // Render the new compact rank selection UI
  const renderRankSelectors = () => {
    // Get current and target rank objects
    const current = valorantRanks.find(r => r.id === currentRank);
    const target = valorantRanks.find(r => r.id === targetRank);
    
    return (
      <div className="glass-card p-6 rounded-xl mb-8 bg-valorant-black/50 border border-valorant-gray/30">
        <h3 className="text-xl font-bold text-white mb-4">Rank Boost Seçimi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Rank Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Mevcut Rankınız</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderTierSelector(false)}
              {renderDivisionSelector(false)}
            </div>
            
            {current && (
              <div className="flex items-center mt-2 bg-valorant-black/40 p-3 rounded-lg">
                <img src={current.image} alt={current.name} className="w-10 h-10 mr-2" />
                <span className="text-white">{current.name}</span>
              </div>
            )}
          </div>
          
          {/* Target Rank Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Hedef Rankınız</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderTierSelector(true)}
              {renderDivisionSelector(true)}
            </div>
            
            {target && (
              <div className="flex items-center mt-2 bg-valorant-black/40 p-3 rounded-lg">
                <img src={target.image} alt={target.name} className="w-10 h-10 mr-2" />
                <span className="text-white">{target.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {currentRank && targetRank && targetRank > currentRank && (
          <div className="mt-6 pt-6 border-t border-valorant-gray/30">
            <div className="flex justify-between items-center">
              <div className="font-medium text-white">Tahmini Fiyat:</div>
              <div className="text-2xl font-bold text-white flex items-center">
                {formatCurrency(basePrice, currency)}
                <button onClick={toggleCurrency} className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded">
                  {currency === 'TRY' ? 'USD' : 'TRY'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render options
  const renderOptions = () => {
    if (!currentRank || !targetRank || targetRank <= currentRank) return null;
    
    return (
      <div className="glass-card p-6 rounded-xl mb-8 bg-valorant-black/50 border border-valorant-gray/30">
        <h3 className="text-xl font-bold text-white mb-4">Extra Seçenekler</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="priority" 
              checked={priorityOrder} 
              onCheckedChange={checked => setPriorityOrder(checked === true)} 
              className="data-[state=checked]:bg-valorant-green border-valorant-gray/50"
            />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-valorant-green" />
              <label htmlFor="priority" className="text-sm font-medium text-white cursor-pointer">
                Extra Öncelikli Sipariş (+%20)
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="streaming" 
              checked={streaming} 
              onCheckedChange={checked => setStreaming(checked === true)} 
              className="data-[state=checked]:bg-valorant-green border-valorant-gray/50"
            />
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-valorant-green" />
              <label htmlFor="streaming" className="text-sm font-medium text-white cursor-pointer">
                Yayın (+%10)
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="offline" 
              checked={offlineMode} 
              onCheckedChange={checked => setOfflineMode(checked === true)} 
              className="data-[state=checked]:bg-valorant-green border-valorant-gray/50"
            />
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-valorant-green" />
              <label htmlFor="offline" className="text-sm font-medium text-white cursor-pointer">
                Ücretsiz Çevrimdışı Mod
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-valorant-gray/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-white">Toplam Tutar:</div>
              {(priorityOrder || streaming) && (
                <div className="text-sm text-gray-400 mt-1">
                  Baz fiyat: {formatCurrency(basePrice, currency)}
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-white flex items-center">
              {formatCurrency(finalPrice, currency)}
              <button onClick={toggleCurrency} className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded">
                {currency === 'TRY' ? 'USD' : 'TRY'}
              </button>
            </div>
          </div>
          
          <Button 
            className="bg-valorant-green hover:bg-valorant-darkGreen text-white px-6 py-5 text-base rounded-lg w-full mt-4" 
            onClick={handlePurchase}
          >
            Şimdi Satın Al <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };
  
  // Render information cards
  const renderInfoCards = () => {
    return (
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
    );
  };
  
  return (
    <section className="bg-valorant-black py-12 md:py-20" id="rank-boost">
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
          {renderRankSelectors()}
          {renderOptions()}
          {renderInfoCards()}
        </div>
      </div>
    </section>
  );
};

export default RankBoost;
