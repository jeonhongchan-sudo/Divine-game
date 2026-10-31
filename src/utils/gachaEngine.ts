import { Rarity, GachaCard, RollEngineMode } from '../types/game';
import { CARDS_BY_RARITY } from '../data/cards';
import { RARITIES, TOTAL_NOMINAL_WEIGHT, RARITY_ORDER } from '../data/rarityConfig';

export interface PullResult {
  card: GachaCard;
  isNew: boolean;
  previousStarLevel: number;
  newStarLevel: number;
  rollIndex: number;
}

export function formatLuck(luck: number): string {
  if (luck >= 1e24) {
    return '1,000,000,000,000,000,000,000,000%';
  }
  if (luck >= 1e20) {
    return `${(luck / 1e20).toFixed(1)}해%`;
  }
  if (luck >= 1e16) {
    return `${(luck / 1e16).toFixed(1)}경%`;
  }
  if (luck >= 1e12) {
    return `${(luck / 1e12).toFixed(1)}조%`;
  }
  if (luck >= 1e8) {
    return `${(luck / 1e8).toFixed(1)}억%`;
  }
  if (luck >= 1e4) {
    return `${(luck / 1e4).toFixed(1)}만%`;
  }
  return `${Number(luck.toFixed(1)).toLocaleString()}%`;
}

export function rollSingleRarity(
  mode: RollEngineMode = 'waterfall',
  luckMultiplier: number = 1.0,
  pityCount: number = 0
): Rarity {
  // Pity guarantee:
  // If pityCount >= 1,000,000, guarantee Divine!
  if (pityCount >= 1000000) {
    return 'DIVINE';
  }

  // ULTRA GOD-TIER LUCK (행운 1000000000000000000000000 - 10^24)
  // 1자(10^24) 이상의 초월적 행운 상태에서는 전 우주의 기적이 집중되어
  // 최상위 5대 천상/초희귀 등급(OG, CELESTIAL, ETERNAL, PIOUS, DIVINE)만 강림합니다!
  if (luckMultiplier >= 1e20) {
    const roll = Math.random();
    if (roll < 0.35) return 'OG'; // 35% 확률로 3,125억분의 1 OG 등급 강림!
    if (roll < 0.70) return 'CELESTIAL'; // 35% 확률로 100억분의 1 천상 등급 강림!
    if (roll < 0.85) return 'ETERNAL'; // 15% 확률로 영원한 등급 강림!
    if (roll < 0.95) return 'PIOUS'; // 10% 확률로 경건한 등급 강림!
    return 'DIVINE'; // 5% 확률로 신성 등급 강림!
  }

  if (mode === 'waterfall') {
    // Top-down sequential check: Evaluates strictly from rarest to most common
    const luck = Math.max(1.0, luckMultiplier);

    // 1. OG: 0.00000000032% (1 / 3,125억)
    if (Math.random() * 100 < RARITIES.OG.nominalRate * luck) {
      return 'OG';
    }
    // 2. Celestial (천상): 0.00000001% (1 / 100억)
    if (Math.random() * 100 < RARITIES.CELESTIAL.nominalRate * luck) {
      return 'CELESTIAL';
    }
    // 3. Eternal (영원한): 0.000005% (1 / 2,000만)
    if (Math.random() * 100 < RARITIES.ETERNAL.nominalRate * luck) {
      return 'ETERNAL';
    }
    // 4. Pious (경건한): 0.0001% (1 / 100만)
    if (Math.random() * 100 < RARITIES.PIOUS.nominalRate * luck) {
      return 'PIOUS';
    }
    // 5. Divine (신성): 0.05% (1 / 2,000)
    if (Math.random() * 100 < RARITIES.DIVINE.nominalRate * luck) {
      return 'DIVINE';
    }
    // 6. Secret (비밀): 1.0% (1 / 100)
    if (Math.random() * 100 < RARITIES.SECRET.nominalRate * luck) {
      return 'SECRET';
    }
    // 7. Mythic (신화적인): 6.5%
    if (Math.random() * 100 < RARITIES.MYTHIC.nominalRate * luck) {
      return 'MYTHIC';
    }
    // 8. Legendary (전설): 16%
    if (Math.random() * 100 < RARITIES.LEGENDARY.nominalRate) {
      return 'LEGENDARY';
    }
    // 9. Epic (에픽): 21%
    if (Math.random() * 100 < RARITIES.EPIC.nominalRate) {
      return 'EPIC';
    }
    // 10. Rare (레어): 29%
    if (Math.random() * 100 < RARITIES.RARE.nominalRate) {
      return 'RARE';
    }
    // 11. Uncommon (드문): 36%
    if (Math.random() * 100 < RARITIES.UNCOMMON.nominalRate) {
      return 'UNCOMMON';
    }
    // 12. Common (일반): Fallback / 45%
    return 'COMMON';
  } else {
    // Normalized weight mode
    const roll = Math.random() * TOTAL_NOMINAL_WEIGHT;
    let cumulative = 0;

    for (const r of RARITY_ORDER) {
      cumulative += RARITIES[r].nominalRate;
      if (roll <= cumulative) {
        return r;
      }
    }
    return 'COMMON';
  }
}

export function getRandomCardForRarity(rarity: Rarity): GachaCard {
  const cards = CARDS_BY_RARITY[rarity] || [];
  if (cards.length === 0) {
    throw new Error(`No cards defined for rarity: ${rarity}`);
  }
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}
