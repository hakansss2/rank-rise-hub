
import React from 'react';
import { RankInfo, getRankDivisionPrice, formatCurrency } from '@/utils/rankData';
import { Card } from '@/components/ui/card';
import Image from './image';

interface RankCardProps {
  rank: RankInfo;
  isSelected?: boolean;
  onClick?: () => void;
  showTier?: boolean;
  showPrice?: boolean;
  currency?: 'TRY' | 'USD';
}

const RankCard: React.FC<RankCardProps> = ({ 
  rank, 
  isSelected = false, 
  onClick,
  showTier = false,
  showPrice = false,
  currency = 'TRY'
}) => {
  const rankPrice = getRankDivisionPrice(rank.tier, rank.division);
  const formattedPrice = formatCurrency(rankPrice, currency);

  return (
    <Card 
      className={`relative p-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer hover-scale ${
        isSelected 
          ? 'border-valorant-green bg-valorant-green/10 shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
          : 'border-valorant-gray/30 hover:border-valorant-green/50 bg-valorant-black'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full ${
            isSelected ? 'bg-valorant-green/20' : 'bg-gray-800/40'
          } filter blur-md`}></div>
          <Image 
            src={rank.image} 
            alt={rank.name} 
            placeholder="https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8a627ec4743a8f8a/5eb7cf70bab1845bb576da25/TX_CompetitiveTier_Large_16.png" 
            className="relative z-10 w-14 h-14 object-contain" 
          />
        </div>
        
        <h3 className="text-lg font-bold text-white">{rank.name}</h3>
        
        {showTier && (
          <span className="text-sm text-gray-400 mt-1 capitalize">{rank.tier}</span>
        )}
        
        {showPrice && (
          <span className="text-sm text-valorant-green font-medium mt-2">{formattedPrice}</span>
        )}
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-valorant-green text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RankCard;
