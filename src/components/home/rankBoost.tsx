import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import { valorantRanks, getRankPrice, formatCurrency, rankTierGroups, getRanksByTier, RankTier } from '@/utils/rankData';
import { Button } from '@/components/ui/button';
import RankCard from '@/components/ui/rankCard';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Clock, Shield, Award, Zap, Video, WifiOff, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const RankBoost = () => {
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [targetRank, setTargetRank] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [currency, setCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [priorityOrder, setPriorityOrder] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedCurrentTier, setSelectedCurrentTier] = useState<RankTier | null>(null);
  const [selectedTargetTier, setSelectedTargetTier] = useState<RankTier | null>(null);
  const [currentTierRanks, setCurrentTierRanks] = useState<any[]>([]);
  const [targetTierRanks, setTargetTierRanks] = useState<any[]>([]);
  const [currentDivisionRef, setCurrentDivisionRef] = useState<HTMLDivElement | null>(null);
  const [targetDivisionRef, setTargetDivisionRef] = useState<HTMLDivElement | null>(null);
  const [targetRankRef, setTargetRankRef] = useState<HTMLDivElement | null>(null);
  
  const orderSummaryRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    deductBalance,
    formatBalance
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
    if (selectedCurrentTier) {
      setCurrentTierRanks(getRanksByTier(selectedCurrentTier));
      
      // Scroll to division selection
      setTimeout(() => {
        if (currentDivisionRef.current) {
          currentDivisionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [selectedCurrentTier]);
  
  useEffect(() => {
    if (selectedTargetTier) {
      setTargetTierRanks(getRanksByTier(selectedTargetTier));
      
      // Scroll to target division selection
      setTimeout(() => {
        if (targetDivisionRef.current) {
          targetDivisionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [selectedTargetTier]);
  
  useEffect(() => {
    if (currentRank && !targetRank) {
      // Scroll to target rank section when current rank is selected
      setTimeout(() => {
        if (targetRankRef.current) {
          targetRankRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [currentRank]);
  
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
      
      // Scroll to order summary when both ranks are selected
      setTimeout(() => {
        if (orderSummaryRef.current) {
          orderSummaryRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [currentRank, targetRank, priorityOrder, streaming, offlineMode]);
  
  const handleSelectTier = (tierId: string, isCurrentRank: boolean) => {
    const tier = tierId as RankTier;
    if (isCurrentRank) {
      setSelectedCurrentTier(tier);
      setCurrentRank(null); // Reset current rank selection
    } else {
      setSelectedTargetTier(tier);
      setTargetRank(null); // Reset target rank selection
    }
  };
  
  const handleSelectDivision = (rankId: number, isCurrentRank: boolean) => {
    if (isCurrentRank) {
      setCurrentRank(rankId);
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
    }
  };
  
  const handleMobileSelect = (value: string, isCurrentRank: boolean, isTier: boolean) => {
    if (isTier) {
      handleSelectTier(value, isCurrentRank);
    } else {
      handleSelectDivision(parseInt(value), isCurrentRank);
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
      // Check if user has enough balance
      const success = await deductBalance(finalPrice);
      
      if (!success) {
        toast({
          title: "Yetersiz Bakiye",
          description: "Bakiyeniz yetersiz. Lütfen bakiye yükleyiniz.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
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
  
  const renderDesktopRankSelector = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Mevcut Rankınız</h2>
          
          {currentRank ? (
            <div className="flex flex-col items-center justify-center mb-6">
              <RankCard 
                rank={valorantRanks.find(r => r.id === currentRank)!} 
                isSelected={true}
                showTier={true}
              />
              <Button 
                variant="outline" 
                className="mt-4 text-valorant-green border-valorant-green hover:bg-valorant-green/10"
                onClick={() => {
                  setCurrentRank(null);
                  setSelectedCurrentTier(null);
                }}
              >
                Tekrar Seç
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6">
                {rankTierGroups.map(tier => {
                  const firstRankOfTier = getRanksByTier(tier.id as RankTier)[0];
                  return (
                    <div 
                      key={tier.id}
                      className={`relative p-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer border ${
                        selectedCurrentTier === tier.id 
                          ? 'border-2 border-valorant-green bg-valorant-green/10 shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
                          : 'border-valorant-gray/30 hover:border-valorant-green/50 bg-valorant-black'
                      }`}
                      onClick={() => handleSelectTier(tier.id, true)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                          <div className={`absolute inset-0 rounded-full ${
                            selectedCurrentTier === tier.id ? 'bg-valorant-green/20' : 'bg-gray-800/40'
                          } filter blur-md`}></div>
                          <img 
                            src={firstRankOfTier ? firstRankOfTier.image : tier.image} 
                            alt={tier.name} 
                            className="relative z-10 w-14 h-14 object-contain" 
                          />
                        </div>
                        <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedCurrentTier && (
                <div 
                  ref={currentDivisionRef} 
                  className="mt-4 p-4 bg-valorant-black/90 border border-valorant-green/30 rounded-lg"
                >
                  <h3 className="text-white text-center mb-3">Bölüm Seçin</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {getRanksByTier(selectedCurrentTier).map(rank => (
                      <div
                        key={rank.id}
                        className={`p-3 rounded-lg flex flex-col items-center cursor-pointer transition-all duration-200 ${
                          currentRank === rank.id 
                            ? 'bg-valorant-green/20 border-2 border-valorant-green scale-105' 
                            : 'hover:bg-valorant-gray/20 border border-transparent hover:border-valorant-green/50'
                        }`}
                        onClick={() => handleSelectDivision(rank.id, true)}
                      >
                        <img src={rank.image} alt={rank.name} className="w-12 h-12 mb-1" />
                        <span className="text-sm text-white">{rank.division}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {!currentRank && selectedCurrentTier && (
            <div className="flex items-center justify-center mt-4">
              <div className="bg-valorant-black/50 px-4 py-2 rounded-lg border border-valorant-green/50">
                <p className="text-valorant-green text-center animate-pulse">
                  Lütfen bir bölüm seçin
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="animate-fade-in" ref={targetRankRef}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Hedef Rankınız</h2>
          
          {targetRank ? (
            <div className="flex flex-col items-center justify-center mb-6">
              <RankCard 
                rank={valorantRanks.find(r => r.id === targetRank)!} 
                isSelected={true}
                showTier={true}
              />
              <Button 
                variant="outline" 
                className="mt-4 text-valorant-green border-valorant-green hover:bg-valorant-green/10"
                onClick={() => {
                  setTargetRank(null);
                  setSelectedTargetTier(null);
                }}
              >
                Tekrar Seç
              </Button>
            </div>
          ) : (
            <>
              {currentRank ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6">
                    {rankTierGroups.map(tier => {
                      const firstRankOfTier = getRanksByTier(tier.id as RankTier)[0];
                      const currentRankObj = valorantRanks.find(r => r.id === currentRank);
                      const isTierSelectable = currentRankObj ? 
                        rankTierGroups.findIndex(t => t.id === tier.id) >= 
                        rankTierGroups.findIndex(t => t.id === currentRankObj.tier) : true;
                      
                      return (
                        <div 
                          key={tier.id}
                          className={`relative p-4 rounded-lg transition-all duration-300 ease-in-out border ${
                            !isTierSelectable 
                              ? 'border-red-500/30 bg-valorant-black/50 opacity-50 cursor-not-allowed' 
                              : selectedTargetTier === tier.id 
                                ? 'border-2 border-valorant-green bg-valorant-green/10 shadow-[0_0_15px_rgba(22,163,74,0.3)] cursor-pointer' 
                                : 'border-valorant-gray/30 hover:border-valorant-green/50 bg-valorant-black cursor-pointer'
                          }`}
                          onClick={() => isTierSelectable && handleSelectTier(tier.id, false)}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                              <div className={`absolute inset-0 rounded-full ${
                                selectedTargetTier === tier.id ? 'bg-valorant-green/20' : 'bg-gray-800/40'
                              } filter blur-md`}></div>
                              <img 
                                src={firstRankOfTier ? firstRankOfTier.image : tier.image} 
                                alt={tier.name} 
                                className="relative z-10 w-14 h-14 object-contain" 
                              />
                            </div>
                            <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div 
                    ref={targetDivisionRef} 
                    className="mt-4 p-4 bg-valorant-black/90 border border-valorant-green/30 rounded-lg"
                  >
                    <h3 className="text-white text-center mb-3">Hedef Bölüm Seçin</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {targetTierRanks.map(rank => {
                        const isRankSelectable = rank.id > (currentRank || 0);
                        
                        return (
                          <div
                            key={rank.id}
                            className={`p-3 rounded-lg flex flex-col items-center transition-all duration-200 ${
                              !isRankSelectable 
                                ? 'opacity-50 cursor-not-allowed border border-red-500/30'
                                : targetRank === rank.id 
                                  ? 'bg-valorant-green/20 border-2 border-valorant-green scale-105 cursor-pointer'
                                  : 'hover:bg-valorant-gray/20 border border-transparent hover:border-valorant-green/50 cursor-pointer'
                            }`}
                            onClick={() => isRankSelectable && handleSelectDivision(rank.id, false)}
                          >
                            <img src={rank.image} alt={rank.name} className="w-12 h-12 mb-1" />
                            <span className="text-sm text-white">{rank.division}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="bg-valorant-black/50 px-6 py-4 rounded-lg border border-yellow-500/50 text-center">
                    <p className="text-yellow-400 text-lg mb-2">
                      Önce mevcut rankınızı seçmelisiniz
                    </p>
                    <p className="text-gray-400">
                      Sol taraftan mevcut rankınızı seçtikten sonra hedef rankınızı seçebilirsiniz
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {!targetRank && selectedTargetTier && currentRank && (
            <div className="flex items-center justify-center mt-4">
              <div className="bg-valorant-black/50 px-4 py-2 rounded-lg border border-valorant-green/50">
                <p className="text-valorant-green text-center animate-pulse">
                  Lütfen hedef bölüm seçin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderMobileRankSelector = () => {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-4">Mevcut Rankınız</h3>
          
          {currentRank ? (
            <div className="flex flex-col items-center justify-center mb-4">
              <RankCard 
                rank={valorantRanks.find(r => r.id === currentRank)!} 
                isSelected={true}
                showTier={true}
              />
              <Button 
                variant="outline" 
                className="mt-3 text-sm text-valorant-green border-valorant-green hover:bg-valorant-green/10"
                onClick={() => {
                  setCurrentRank(null);
                  setSelectedCurrentTier(null);
                }}
              >
                Tekrar Seç
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Select 
                value={selectedCurrentTier || ""} 
                onValueChange={(value) => handleMobileSelect(value, true, true)}
              >
                <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
                  <SelectValue placeholder="Rank tier seçin" />
                </SelectTrigger>
                <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
                  {rankTierGroups.map(tier => {
                    const firstRankOfTier = getRanksByTier(tier.id as RankTier)[0];
                    return (
                      <SelectItem key={tier.id} value={tier.id} className="flex items-center">
                        <div className="flex items-center">
                          <img 
                            src={firstRankOfTier ? firstRankOfTier.image : tier.image} 
                            alt={tier.name} 
                            className="w-6 h-6 mr-2" 
                          />
                          <span>{tier.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedCurrentTier && (
                <Select 
                  value={currentRank?.toString() || ""} 
                  onValueChange={(value) => handleMobileSelect(value, true, false)}
                >
                  <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
                    {currentTierRanks.map(rank => (
                      <SelectItem key={rank.id} value={rank.id.toString()} className="flex items-center">
                        <div className="flex items-center">
                          <img src={rank.image} alt={rank.name} className="w-6 h-6 mr-2" />
                          <span>{rank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          {!currentRank && selectedCurrentTier && (
            <div className="mt-3 text-valorant-green text-sm animate-pulse">
              <p>Lütfen bölüm seçiniz</p>
            </div>
          )}
        </div>
        
        <div className="animate-fade-in" ref={targetRankRef}>
          <h3 className="text-xl font-bold text-white mb-4">Hedef Rankınız</h3>
          
          {targetRank ? (
            <div className="flex flex-col items-center justify-center mb-4">
              <RankCard 
                rank={valorantRanks.find(r => r.id === targetRank)!} 
                isSelected={true}
                showTier={true}
              />
              <Button 
                variant="outline" 
                className="mt-3 text-sm text-valorant-green border-valorant-green hover:bg-valorant-green/10"
                onClick={() => {
                  setTargetRank(null);
                  setSelectedTargetTier(null);
                }}
              >
                Tekrar Seç
              </Button>
            </div>
          ) : currentRank ? (
            <div className="space-y-3">
              <Select 
                value={selectedTargetTier || ""} 
                onValueChange={(value) => handleMobileSelect(value, false, true)}
              >
                <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
                  <SelectValue placeholder="Rank tier seçin" />
                </SelectTrigger>
                <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
                  {rankTierGroups.map(tier => {
                    const firstRankOfTier = getRanksByTier(tier.id as RankTier)[0];
                    const currentRankObj = valorantRanks.find(r => r.id === currentRank);
                    const isTierSelectable = currentRankObj ? 
                      rankTierGroups.findIndex(t => t.id === tier.id) >= 
                      rankTierGroups.findIndex(t => t.id === currentRankObj.tier) : true;
                    
                    return (
                      <SelectItem 
                        key={tier.id} 
                        value={tier.id} 
                        className={`flex items-center ${!isTierSelectable ? 'opacity-50' : ''}`}
                        disabled={!isTierSelectable}
                      >
                        <div className="flex items-center">
                          <img 
                            src={firstRankOfTier ? firstRankOfTier.image : tier.image} 
                            alt={tier.name} 
                            className="w-6 h-6 mr-2" 
                          />
                          <span>{tier.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedTargetTier && (
                <Select 
                  value={targetRank?.toString() || ""} 
                  onValueChange={(value) => handleMobileSelect(value, false, false)}
                >
                  <SelectTrigger className="w-full bg-valorant-black border-valorant-gray/50 text-white">
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-valorant-black border-valorant-gray/50 text-white">
                    {targetTierRanks.map(rank => {
                      const isRankSelectable = rank.id > (currentRank || 0);
                      return (
                        <SelectItem 
                          key={rank.id} 
                          value={rank.id.toString()} 
                          className={`flex items-center ${!isRankSelectable ? 'opacity-50' : ''}`}
                          disabled={!isRankSelectable}
                        >
                          <div className="flex items-center">
                            <img src={rank.image} alt={rank.name} className="w-6 h-6 mr-2" />
                            <span>{rank.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="bg-valorant-black/50 px-4 py-3 rounded-lg border border-yellow-500/50 text-center">
              <p className="text-yellow-400 text-sm">
                Önce mevcut rankınızı seçmelisiniz
              </p>
            </div>
          )}
          
          {!targetRank && selectedTargetTier && (
            <div className="mt-3 text-valorant-green text-sm animate-pulse">
              <p>Lütfen hedef bölüm seçiniz</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderOrderSummary = () => {
    if (!currentRank || !targetRank) {
      return null;
    }
    
    const current = valorantRanks.find(r => r.id === currentRank);
    const target = valorantRanks.find(r => r.id === targetRank);
    
    return (
      <div ref={orderSummaryRef} className="animate-fade-in mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sipariş Özeti</h2>
        
        <div className="glass-card p-4 sm:p-6 md:p-8 rounded-xl mb-8 bg-valorant-black/50 border border-valorant-gray/30">
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
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start">
                  {formatCurrency(finalPrice, currency)}
                  <button onClick={toggleCurrency} className="ml-2 text-xs bg-valorant-green/20 text-valorant-green px-2 py-1 rounded">
                    {currency === 'TRY' ? 'USD' : 'TRY'}
                  </button>
                </div>
                
                {(priorityOrder || streaming) && <div className="text-sm text-gray-400 mt-1">
                    Baz fiyat: {formatCurrency(basePrice, currency)}
                  </div>}
                
                {isAuthenticated && (
                  <div className="flex items-center justify-center md:justify-start mt-2 text-valorant-green font-medium">
                    <Wallet className="w-4 h-4 mr-1" />
                    Bakiyeniz: {isAuthenticated && user ? formatBalance(currency) : '0'}
                  </div>
                )}
              </div>
              
              <Button className="bg-valorant-green hover:bg-valorant-darkGreen text-white px-6 py-5 text-base md:text-lg rounded-lg w-full md:w-auto" onClick={handlePurchase}>
                {isAuthenticated ? 'Şimdi Satın Al' : 'Giriş Yap ve Satın Al'} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
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
          {isMobile ? renderMobileRankSelector() : renderDesktopRankSelector()}
          {renderOrderSummary()}
        </div>
      </div>
    </section>
  );
};

export default RankBoost;
