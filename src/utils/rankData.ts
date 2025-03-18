
export type RankTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'ascendant' | 'immortal' | 'radiant';

export interface RankInfo {
  id: number;
  name: string;
  tier: RankTier;
  division: number;
  image: string;
}

export const rankPrices = {
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

export const valorantRanks: RankInfo[] = [
  // Iron Ranks
  { id: 1, name: 'Demir 1', tier: 'iron', division: 1, image: '/ranks/iron1.png' },
  { id: 2, name: 'Demir 2', tier: 'iron', division: 2, image: '/ranks/iron2.png' },
  { id: 3, name: 'Demir 3', tier: 'iron', division: 3, image: '/ranks/iron3.png' },
  
  // Bronze Ranks
  { id: 4, name: 'Bronz 1', tier: 'bronze', division: 1, image: '/ranks/bronze1.png' },
  { id: 5, name: 'Bronz 2', tier: 'bronze', division: 2, image: '/ranks/bronze2.png' },
  { id: 6, name: 'Bronz 3', tier: 'bronze', division: 3, image: '/ranks/bronze3.png' },
  
  // Silver Ranks
  { id: 7, name: 'Gümüş 1', tier: 'silver', division: 1, image: '/ranks/silver1.png' },
  { id: 8, name: 'Gümüş 2', tier: 'silver', division: 2, image: '/ranks/silver2.png' },
  { id: 9, name: 'Gümüş 3', tier: 'silver', division: 3, image: '/ranks/silver3.png' },
  
  // Gold Ranks
  { id: 10, name: 'Altın 1', tier: 'gold', division: 1, image: '/ranks/gold1.png' },
  { id: 11, name: 'Altın 2', tier: 'gold', division: 2, image: '/ranks/gold2.png' },
  { id: 12, name: 'Altın 3', tier: 'gold', division: 3, image: '/ranks/gold3.png' },
  
  // Platinum Ranks
  { id: 13, name: 'Platin 1', tier: 'platinum', division: 1, image: '/ranks/platinum1.png' },
  { id: 14, name: 'Platin 2', tier: 'platinum', division: 2, image: '/ranks/platinum2.png' },
  { id: 15, name: 'Platin 3', tier: 'platinum', division: 3, image: '/ranks/platinum3.png' },
  
  // Diamond Ranks
  { id: 16, name: 'Elmas 1', tier: 'diamond', division: 1, image: '/ranks/diamond1.png' },
  { id: 17, name: 'Elmas 2', tier: 'diamond', division: 2, image: '/ranks/diamond2.png' },
  { id: 18, name: 'Elmas 3', tier: 'diamond', division: 3, image: '/ranks/diamond3.png' },
  
  // Ascendant Ranks
  { id: 19, name: 'Yükselen 1', tier: 'ascendant', division: 1, image: '/ranks/ascendant1.png' },
  { id: 20, name: 'Yükselen 2', tier: 'ascendant', division: 2, image: '/ranks/ascendant2.png' },
  { id: 21, name: 'Yükselen 3', tier: 'ascendant', division: 3, image: '/ranks/ascendant3.png' },
  
  // Immortal Ranks
  { id: 22, name: 'Ölümsüz 1', tier: 'immortal', division: 1, image: '/ranks/immortal1.png' },
  { id: 23, name: 'Ölümsüz 2', tier: 'immortal', division: 2, image: '/ranks/immortal2.png' },
  { id: 24, name: 'Ölümsüz 3', tier: 'immortal', division: 3, image: '/ranks/immortal3.png' },
  
  // Radiant
  { id: 25, name: 'Radyant', tier: 'radiant', division: 1, image: '/ranks/radiant.png' },
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
  
  // Calculate ranks between current and target
  const ranksBetween = valorantRanks.filter(r => r.id > currentRank && r.id <= targetRank);
  
  // Sum up prices for each rank tier transition
  for (const rank of ranksBetween) {
    totalPrice += rankPrices[rank.tier] / 3; // Divide by 3 for divisions within tier
  }
  
  return Math.round(totalPrice);
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
