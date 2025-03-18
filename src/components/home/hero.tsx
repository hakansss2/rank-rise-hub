
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { useAuth } from '@/context/AuthContext';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  const scrollToRankBoost = () => {
    const rankBoostSection = document.getElementById('rank-boost');
    if (rankBoostSection) {
      rankBoostSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-valorant-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-valorant-black via-valorant-black/90 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full">
          <Image 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1080" 
            alt="Valorant Background" 
            className="w-full h-full object-cover object-center opacity-40" 
            placeholder="/placeholder.svg" 
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className={`transform transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <span className="inline-block bg-valorant-green/20 border border-valorant-green/30 text-valorant-green px-4 py-1 rounded-full text-sm font-medium mb-5">
              VALORANT RANK BOOST
            </span>
          </div>
          
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 font-heading transform transition-all duration-700 delay-200 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <span className="block">Valorant Rankınızı</span>
            <span className="gradient-text">Profesyonellere</span> 
            <span className="block">Yükseltmeyi Bırakın</span>
          </h1>
          
          <p className={`text-lg sm:text-xl text-gray-300 mb-8 max-w-xl transform transition-all duration-700 delay-400 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Güvenli, hızlı ve profesyonel Valorant rank boost hizmetimizle istediğiniz lige ulaşmanız artık çok kolay.
          </p>
          
          <div className={`flex flex-wrap gap-4 transform transition-all duration-700 delay-600 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <Button 
              className="bg-valorant-green hover:bg-valorant-darkGreen text-white font-medium py-6 px-8 rounded-md text-lg transition-all duration-300 ease-in-out shadow-[0_5px_15px_rgba(22,163,74,0.3)]"
              onClick={scrollToRankBoost}
            >
              Hemen Rank Atlayın
            </Button>
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" className="border-white text-white font-medium py-6 px-8 rounded-md text-lg transition-all duration-300 ease-in-out bg-zinc-950 hover:bg-zinc-800">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
          
          <div className={`mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg transform transition-all duration-700 delay-800 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-valorant-green mb-2">500+</div>
              <div className="text-xs sm:text-sm text-gray-400">Tamamlanan Sipariş</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-valorant-green mb-2">50+</div>
              <div className="text-xs sm:text-sm text-gray-400">Profesyonel Booster</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-valorant-green mb-2">%100</div>
              <div className="text-xs sm:text-sm text-gray-400">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-valorant-black to-transparent z-10"></div>
    </div>;
};

export default Hero;
