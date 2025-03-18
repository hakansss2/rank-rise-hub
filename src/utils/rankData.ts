
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

// Generate rank images URLs for testing
export const rankImagesUrls = {
  // Iron ranks
  'iron1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt825d0c86c912b0e9/5eb7cf66e6f6795e282ffffb/TX_CompetitiveTier_Large_1.png',
  'iron2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt77fe0c7e257f5f38/5eb7cf66dd8bae6748949349/TX_CompetitiveTier_Large_2.png',
  'iron3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt492118e24ba3372c/5eb7cf6cbd60ff0916c91dfe/TX_CompetitiveTier_Large_3.png',
  
  // Bronze ranks
  'bronze1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltec0d9c162b9dd3a9/5eb7cf6d173491649f039a8a/TX_CompetitiveTier_Large_4.png',
  'bronze2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt7262f709c88ed002/5eb7cf6d6509f3755e8f4334/TX_CompetitiveTier_Large_5.png',
  'bronze3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltc9e6c0f65d4ea982/5eb7cf6e17dae5277e675fe4/TX_CompetitiveTier_Large_6.png',
  
  // Silver ranks
  'silver1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt42e1d6a850ba60ad/5eb7cf6e17dae5277e675fe8/TX_CompetitiveTier_Large_7.png',
  'silver2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt7f29d1aabe7c6b88/5eb7cf6e8334e1754200f8db/TX_CompetitiveTier_Large_8.png',
  'silver3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt65d2d3fd1ab45052/5eb7cf6f17dae5277e675fec/TX_CompetitiveTier_Large_9.png',
  
  // Gold ranks
  'gold1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltfcd1fa2226d0ac1b/5eb7cf6fa55acd7617b1b302/TX_CompetitiveTier_Large_10.png',
  'gold2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5b9ddc822506e109/5eb7cf6fe823d8752eb85dbf/TX_CompetitiveTier_Large_11.png',
  'gold3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5a0edb670b4e2a8c/5eb7cf6fed041c2774d4e482/TX_CompetitiveTier_Large_12.png',
  
  // Platinum ranks
  'platinum1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt290d8c7da30306c0/5eb7cf70e6f6795e282fffc3/TX_CompetitiveTier_Large_13.png',
  'platinum2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltf505c4b0880424eb/5eb7cf70bd02217d785ff221/TX_CompetitiveTier_Large_14.png',
  'platinum3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt29d7c4f6ea159507/5eb7cf707c553f48a9b29cce/TX_CompetitiveTier_Large_15.png',
  
  // Diamond ranks
  'diamond1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt8a627ec4743a8f8a/5eb7cf70bab1845bb576da25/TX_CompetitiveTier_Large_16.png',
  'diamond2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltc7f73a2d16a1d1ac/5eb7cf70d4aeed478c011c15/TX_CompetitiveTier_Large_17.png',
  'diamond3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt50ad97f9ede45ddf/5eb7cf6fe823d8752eb85dc3/TX_CompetitiveTier_Large_18.png',
  
  // Ascendant ranks
  'ascendant1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltb43644f720525ab0/62a2805b58931557ed9f7c9e/TX_CompetitiveTier_Large_24_Ascendant1.png',
  'ascendant2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltaa41e789316792b5/62a28081d65a145cbe803b62/TX_CompetitiveTier_Large_25_Ascendant2.png',
  'ascendant3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt4916b1914babee74/62a28092e0a5a45026ad5c5f/TX_CompetitiveTier_Large_26_Ascendant3.png',
  
  // Immortal ranks
  'immortal1': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt63ea28d4b3a76b50/62a28095e047113facdad43f/TX_CompetitiveTier_Large_27_Immortal1.png',
  'immortal2': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5f7aa25761a78426/5eb7cf71e6f6795e282fffc7/TX_CompetitiveTier_Large_20.png',
  'immortal3': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt39a2da8f648a07e5/5eb7cf7221f0df298845a0ab/TX_CompetitiveTier_Large_21.png',
  
  // Radiant
  'radiant': 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltbcf81f3a1025a91d/5eb7cf73b60a0862fe2f8e37/TX_CompetitiveTier_Large_22.png'
};

// Update rank images with actual URLs
valorantRanks.forEach(rank => {
  const imageKey = `${rank.tier}${rank.division}`;
  if (rankImagesUrls[imageKey as keyof typeof rankImagesUrls]) {
    rank.image = rankImagesUrls[imageKey as keyof typeof rankImagesUrls];
  }
});

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
