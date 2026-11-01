import { GachaCard, Rarity, ShopItem } from '../types/game';
import { GACHA_CARDS, CARDS_BY_RARITY } from '../data/cards';
import { RELICS } from '../data/relics';

const SHOP_RARITIES: Rarity[] = [
  'COSMIC',
  'MYTHIC',
  'LEGENDARY',
  'EPIC',
  'RARE',
  'UNCOMMON',
];

const RARITY_COSTS: Record<Rarity, number> = {
  EXCELLENT: 999999999,
  ANCIENT: 500000000,
  MULTI: 100000000,
  SPECIAL: 50000000,
  OG: 25000000,
  CELESTIAL: 50000000,
  ETERNAL: 20000000,
  DIVINE: 10000000,
  PIOUS: 5000000,
  SECRET: 2500000,
  COSMIC: 1000000,
  MYTHIC: 500000,
  LEGENDARY: 150000,
  EPIC: 50000,
  RARE: 10000,
  UNCOMMON: 3000,
  COMMON: 1000,
};

export function generateShopItems(): ShopItem[] {
  const items: ShopItem[] = [];

  // Slot 1: Gem pack (Small)
  items.push({
    id: `gem-${Date.now()}-1`,
    type: 'resource',
    resourceType: 'gems',
    amount: 1000,
    cost: 50000,
    isSoldOut: false,
  });

  // Slot 2: Gem pack (Large)
  items.push({
    id: `gem-${Date.now()}-2`,
    type: 'resource',
    resourceType: 'gems',
    amount: 5000,
    cost: 220000,
    isSoldOut: false,
  });

  // Slot 3: Luck Booster
  items.push({
    id: `luck-${Date.now()}`,
    type: 'luck',
    amount: 5,
    cost: 100000,
    isSoldOut: false,
  });

  // Slot 3.5: Lucky Block
  items.push({
    id: `lucky-block-${Date.now()}`,
    type: 'lucky_block',
    cost: 250000,
    isSoldOut: false,
  });

  // Slot 4: Random Relic
  const relicPool = RELICS;
  const randomRelic = relicPool[Math.floor(Math.random() * relicPool.length)];
  items.push({
    id: `relic-${Date.now()}`,
    type: 'relic',
    relicId: randomRelic.id,
    cost: RARITY_COSTS[randomRelic.rarity] * 2 || 200000, // Relics are more expensive
    isSoldOut: false,
  });

  // Slot 5-8: Random Cards with weighted rarity
  for (let i = 0; i < 4; i++) {
    const roll = Math.random();
    let rarity: Rarity = 'RARE';
    
    if (roll < 0.00000001) rarity = 'EXCELLENT';
    else if (roll < 0.000001) rarity = 'ANCIENT';
    else if (roll < 0.0001) rarity = 'MULTI';
    else if (roll < 0.001) rarity = 'SPECIAL';
    else if (roll < 0.005) rarity = 'OG';
    else if (roll < 0.015) rarity = 'CELESTIAL';
    else if (roll < 0.05) rarity = 'DIVINE';
    else if (roll < 0.1) rarity = 'SECRET';
    else if (roll < 0.25) rarity = 'COSMIC';
    else if (roll < 0.45) rarity = 'MYTHIC';
    else if (roll < 0.75) rarity = 'LEGENDARY';
    else rarity = 'EPIC';
    
    const pool = CARDS_BY_RARITY[rarity] || CARDS_BY_RARITY['RARE'];
    const card = pool[Math.floor(Math.random() * pool.length)];

    items.push({
      id: `card-${Date.now()}-${i}`,
      type: 'card',
      cardId: card.id,
      cost: RARITY_COSTS[rarity] || 10000,
      isSoldOut: false,
    });
  }

  return items;
}
