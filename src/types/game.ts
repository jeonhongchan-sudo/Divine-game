export type Rarity =
  | 'OG'
  | 'CELESTIAL'
  | 'ETERNAL'
  | 'DIVINE'
  | 'PIOUS'
  | 'SECRET'
  | 'MYTHIC'
  | 'LEGENDARY'
  | 'EPIC'
  | 'RARE'
  | 'UNCOMMON'
  | 'COMMON';

export interface RarityConfig {
  id: Rarity;
  nameKr: string;
  nominalRate: number; // User specified rate in %
  normalizedRate: number; // Normalized to 100%
  color: string;
  badgeBg: string;
  borderClass: string;
  glowClass: string;
  textColor: string;
  gradient: string;
  description: string;
}

export interface GachaCard {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  element: '빛' | '어둠' | '화염' | '물' | '바람' | '대지' | '공허' | '신성' | '태초' | '천상';
  combatPower: number;
  goldPerSec: number;
  luckBonus: number;
  lore: string;
  quote: string;
  iconType: string;
  themeHue: string;
}

export interface InventoryItem {
  cardId: string;
  count: number;
  starLevel: number; // 1 to 5
  firstUnlockedAt: number;
  isFavorite?: boolean;
}

export type RollEngineMode = 'waterfall' | 'normalized';

export interface GachaStats {
  totalPulls: number;
  pullsByRarity: Record<Rarity, number>;
  divinePityCount: number;
  highestRarityPulled?: Rarity;
  firstDivineAtPull?: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  rewardGems: number;
  rewardGold: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}
