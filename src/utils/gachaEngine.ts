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
  // 최상위 초희귀 등급(MULTI, SPECIAL, OG, CELESTIAL, ETERNAL, PIOUS, DIVINE)만 강림합니다!
  if (luckMultiplier >= 1e20) {
    const roll = Math.random();
    if (roll < 0.02) return 'EXCELLENT'; // 2% 엑설런트
    if (roll < 0.08) return 'ANCIENT'; // 6% 고대
    if (roll < 0.20) return 'MULTI'; // 12% 멀티
    if (roll < 0.40) return 'SPECIAL'; // 20% 특별
    if (roll < 0.60) return 'OG'; // 20% OG
    if (roll < 0.75) return 'CELESTIAL'; // 15% 천상
    if (roll < 0.85) return 'ETERNAL'; // 10% 영원한
    if (roll < 0.95) return 'PIOUS'; // 10% 경건한
    return 'DIVINE'; // 5% 신성
  }

  if (mode === 'waterfall') {
    // Top-down sequential check: Evaluates strictly from rarest to most common
    const luck = Math.max(1.0, luckMultiplier);

    // 1. EXCELLENT: 5e-82%
    if (Math.random() * 100 < RARITIES.EXCELLENT.nominalRate * luck) {
      return 'EXCELLENT';
    }
    // 2. ANCIENT: 10^-42%
    if (Math.random() * 100 < RARITIES.ANCIENT.nominalRate * luck) {
      return 'ANCIENT';
    }
    // 3. MULTI (멀티): 10^-33%
    if (Math.random() * 100 < RARITIES.MULTI.nominalRate * luck) {
      return 'MULTI';
    }
    // 2. SPECIAL (특별): 9.47e-22%
    if (Math.random() * 100 < RARITIES.SPECIAL.nominalRate * luck) {
      return 'SPECIAL';
    }
    // 3. OG: 0.00000000032% (1 / 3,125억)
    if (Math.random() * 100 < RARITIES.OG.nominalRate * luck) {
      return 'OG';
    }
    // 4. Celestial (천상): 0.00000001% (1 / 100억)
    if (Math.random() * 100 < RARITIES.CELESTIAL.nominalRate * luck) {
      return 'CELESTIAL';
    }
    // 5. Eternal (영원한): 0.00000005%
    if (Math.random() * 100 < RARITIES.ETERNAL.nominalRate * luck) {
      return 'ETERNAL';
    }
    // 6. Pious (경건한): 0.0001% (1 / 100만)
    if (Math.random() * 100 < RARITIES.PIOUS.nominalRate * luck) {
      return 'PIOUS';
    }
    // 7. Divine (신성): 0.05% (1 / 2,000)
    if (Math.random() * 100 < RARITIES.DIVINE.nominalRate * luck) {
      return 'DIVINE';
    }
    // 8. Secret (비밀): 1.0% (1 / 100)
    if (Math.random() * 100 < RARITIES.SECRET.nominalRate * luck) {
      return 'SECRET';
    }
    // 9. Cosmic (우주): 4.0%
    if (Math.random() * 100 < RARITIES.COSMIC.nominalRate * luck) {
      return 'COSMIC';
    }
    // 10. Mythic (신화적인): 6.5%
    if (Math.random() * 100 < RARITIES.MYTHIC.nominalRate * luck) {
      return 'MYTHIC';
    }
    // 11. Legendary (전설): 16%
    if (Math.random() * 100 < RARITIES.LEGENDARY.nominalRate) {
      return 'LEGENDARY';
    }
    // 12. Epic (에픽): 21%
    if (Math.random() * 100 < RARITIES.EPIC.nominalRate) {
      return 'EPIC';
    }
    // 13. Rare (레어): 29%
    if (Math.random() * 100 < RARITIES.RARE.nominalRate) {
      return 'RARE';
    }
    // 14. Uncommon (드문): 36%
    if (Math.random() * 100 < RARITIES.UNCOMMON.nominalRate) {
      return 'UNCOMMON';
    }
    // 15. Common (일반): Fallback / 45%
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
