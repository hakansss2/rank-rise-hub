
export type RankTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant';

export interface RankInfo {
  id: number;
  name: string;
  tier: RankTier;
  division: number;
  image: string;
}

// Base prices for each rank tier
export const rankBasePrices = {
  iron: 150,
  bronze: 200,
  silver: 250,
  gold: 300,
  platinum: 400,
  diamond: 500,
  ascendant: 700,
  immortal: 1000,
  radiant: 2000,
};

// Division multipliers (division 1 is cheapest, division 3 is most expensive)
const divisionMultipliers = {
  1: 0.8,  // 20% discount for division 1
  2: 1.0,  // Base price for division 2
  3: 1.2,  // 20% premium for division 3
};

// Get price for a specific rank with its division
export function getRankDivisionPrice(tier: RankTier, division: number): number {
  const basePrice = rankBasePrices[tier];
  const multiplier = divisionMultipliers[division as 1 | 2 | 3] || 1.0;
  return Math.round(basePrice * multiplier);
}

// Updated URLs with real Valorant rank images
export const rankImagesUrls = {
  // Iron ranks
  'iron1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/3/smallicon.png',
  'iron2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/4/smallicon.png',
  'iron3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/5/smallicon.png',
  
  // Bronze ranks
  'bronze1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/6/smallicon.png',
  'bronze2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/7/smallicon.png',
  'bronze3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/8/smallicon.png',
  
  // Silver ranks
  'silver1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/9/smallicon.png',
  'silver2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/10/smallicon.png',
  'silver3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/11/smallicon.png',
  
  // Gold ranks
  'gold1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/12/smallicon.png',
  'gold2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/13/smallicon.png',
  'gold3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/14/smallicon.png',
  
  // Platinum ranks
  'platinum1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/15/smallicon.png',
  'platinum2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/smallicon.png',
  'platinum3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/17/smallicon.png',
  
  // Diamond ranks
  'diamond1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/18/smallicon.png',
  'diamond2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/19/smallicon.png',
  'diamond3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/smallicon.png',
  
  // Ascendant ranks
  'ascendant1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/smallicon.png',
  'ascendant2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/smallicon.png',
  'ascendant3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/23/smallicon.png',
  
  // Immortal ranks
  'immortal1': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/smallicon.png',
  'immortal2': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/25/smallicon.png',
  'immortal3': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/26/smallicon.png',
  
  // Radiant
  'radiant': 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/smallicon.png'
};

export const valorantRanks: RankInfo[] = [
  // Iron Ranks
  { id: 1, name: 'Demir 1', tier: 'iron', division: 1, image: rankImagesUrls.iron1 },
  { id: 2, name: 'Demir 2', tier: 'iron', division: 2, image: rankImagesUrls.iron2 },
  { id: 3, name: 'Demir 3', tier: 'iron', division: 3, image: rankImagesUrls.iron3 },
  
  // Bronze Ranks
  { id: 4, name: 'Bronz 1', tier: 'bronze', division: 1, image: rankImagesUrls.bronze1 },
  { id: 5, name: 'Bronz 2', tier: 'bronze', division: 2, image: rankImagesUrls.bronze2 },
  { id: 6, name: 'Bronz 3', tier: 'bronze', division: 3, image: rankImagesUrls.bronze3 },
  
  // Silver Ranks
  { id: 7, name: 'Gümüş 1', tier: 'silver', division: 1, image: rankImagesUrls.silver1 },
  { id: 8, name: 'Gümüş 2', tier: 'silver', division: 2, image: rankImagesUrls.silver2 },
  { id: 9, name: 'Gümüş 3', tier: 'silver', division: 3, image: rankImagesUrls.silver3 },
  
  // Gold Ranks
  { id: 10, name: 'Altın 1', tier: 'gold', division: 1, image: rankImagesUrls.gold1 },
  { id: 11, name: 'Altın 2', tier: 'gold', division: 2, image: rankImagesUrls.gold2 },
  { id: 12, name: 'Altın 3', tier: 'gold', division: 3, image: rankImagesUrls.gold3 },
  
  // Platinum Ranks
  { id: 13, name: 'Platin 1', tier: 'platinum', division: 1, image: rankImagesUrls.platinum1 },
  { id: 14, name: 'Platin 2', tier: 'platinum', division: 2, image: rankImagesUrls.platinum2 },
  { id: 15, name: 'Platin 3', tier: 'platinum', division: 3, image: rankImagesUrls.platinum3 },
  
  // Diamond Ranks
  { id: 16, name: 'Elmas 1', tier: 'diamond', division: 1, image: rankImagesUrls.diamond1 },
  { id: 17, name: 'Elmas 2', tier: 'diamond', division: 2, image: rankImagesUrls.diamond2 },
  { id: 18, name: 'Elmas 3', tier: 'diamond', division: 3, image: rankImagesUrls.diamond3 },
  
  // Ascendant Ranks
  { id: 19, name: 'Yükselen 1', tier: 'ascendant', division: 1, image: rankImagesUrls.ascendant1 },
  { id: 20, name: 'Yükselen 2', tier: 'ascendant', division: 2, image: rankImagesUrls.ascendant2 },
  { id: 21, name: 'Yükselen 3', tier: 'ascendant', division: 3, image: rankImagesUrls.ascendant3 },
  
  // Immortal Ranks
  { id: 22, name: 'Ölümsüz 1', tier: 'immortal', division: 1, image: rankImagesUrls.immortal1 },
  { id: 23, name: 'Ölümsüz 2', tier: 'immortal', division: 2, image: rankImagesUrls.immortal2 },
  { id: 24, name: 'Ölümsüz 3', tier: 'immortal', division: 3, image: rankImagesUrls.immortal3 },
  
  // Radiant
  { id: 25, name: 'Radyant', tier: 'radiant', division: 1, image: rankImagesUrls.radiant },
];

export function getRankById(id: number): RankInfo | undefined {
  return valorantRanks.find(rank => rank.id === id);
}

export function getRankPrice(currentRank: number, targetRank: number): number {
  if (currentRank >= targetRank) return 0;
  
  let totalPrice = 0;
  const current = valorantRanks.find(r => r.id === currentRank);
  const target = valorantRanks.find(r => r.id === targetRank);
  
  if (!current || !target) return 0;
  
  // Calculate prices for each rank in between
  for (let i = currentRank + 1; i <= targetRank; i++) {
    const rank = valorantRanks.find(r => r.id === i);
    if (rank) {
      totalPrice += getRankDivisionPrice(rank.tier, rank.division);
    }
  }
  
  return totalPrice;
}

// Currency conversion (example rates)
export const currencyRates = {
  TRY: 1,
  USD: 0.031 // 1 TRY = 0.031 USD
};

export function convertCurrency(amount: number, from: keyof typeof currencyRates, to: keyof typeof currencyRates): number {
  const valueInBase = amount / currencyRates[from];
  return valueInBase * currencyRates[to];
}

export function formatCurrency(amount: number, currency: 'TRY' | 'USD'): string {
  if (currency === 'TRY') {
    return `${amount.toLocaleString('tr-TR')} ₺`;
  } else {
    return `$${amount.toLocaleString('en-US')}`;
  }
}
