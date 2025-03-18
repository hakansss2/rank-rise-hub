
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-valorant-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-valorant-black via-valorant-black/90 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full">
          <Image
            src="/hero-background.jpg"
            alt="Valorant"
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
          
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 font-heading transform transition-all duration-700 delay-200 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <span className="block">Valorant Rankınızı</span>
            <span className="gradient-text">Profesyonellere</span> 
            <span className="block">Yükseltmeyi Bırakın</span>
          </h1>
          
          <p className={`text-xl text-gray-300 mb-8 max-w-xl transform transition-all duration-700 delay-400 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Güvenli, hızlı ve profesyonel Valorant rank boost hizmetimizle istediğiniz lige ulaşmanız artık çok kolay.
          </p>
          
          <div className={`flex flex-wrap gap-4 transform transition-all duration-700 delay-600 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <Link to="/ranks">
              <Button className="bg-valorant-green hover:bg-valorant-darkGreen text-white font-medium py-6 px-8 rounded-md text-lg transition-all duration-300 ease-in-out shadow-[0_5px_15px_rgba(22,163,74,0.3)]">
                Hemen Rank Atlayın
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 font-medium py-6 px-8 rounded-md text-lg transition-all duration-300 ease-in-out">
                Giriş Yap
              </Button>
            </Link>
          </div>
          
          <div className={`mt-12 grid grid-cols-3 gap-8 max-w-lg transform transition-all duration-700 delay-800 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-valorant-green mb-2">500+</div>
              <div className="text-gray-400 text-sm">Tamamlanan Sipariş</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-valorant-green mb-2">50+</div>
              <div className="text-gray-400 text-sm">Profesyonel Booster</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-valorant-green mb-2">%100</div>
              <div className="text-gray-400 text-sm">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-valorant-black to-transparent z-10"></div>
    </div>
  );
};

export default Hero;
