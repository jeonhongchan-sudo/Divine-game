/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  GachaCard,
  InventoryItem,
  GachaStats,
  Achievement,
  Rarity,
  RollEngineMode,
  ShopItem,
  ShopState,
} from './types/game';
import { GACHA_CARDS, CARDS_MAP, CARDS_BY_RARITY } from './data/cards';
import { RARITIES, RARITY_ORDER } from './data/rarityConfig';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import {
  rollSingleRarity,
  getRandomCardForRarity,
  PullResult,
} from './utils/gachaEngine';
import { generateShopItems } from './utils/shopEngine';
import { sound } from './utils/audio';

import { Header, ActiveTab } from './components/Header';
import { SummonAltar } from './components/SummonAltar';
import { SummonResultModal } from './components/SummonResultModal';
import { InventoryView } from './components/InventoryView';
import { CodexView } from './components/CodexView';
import { ProbabilityModal } from './components/ProbabilityModal';
import { AchievementsModal } from './components/AchievementsModal';
import { CardDetailModal } from './components/CardDetailModal';
import { LuckUpgradeModal } from './components/LuckUpgradeModal';
import { SecretCodeModal } from './components/SecretCodeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ShopView } from './components/ShopView';
import { RotateCcw, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'divine_gacha_save_v1';

export default function App() {
  // Primary Game Currencies
  const [gold, setGold] = useState<number>(5000);
  const [gems, setGems] = useState<number>(100); // Modest starting balance!

  // Inventory & Collection State
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // Statistics State
  const [stats, setStats] = useState<GachaStats>({
    totalPulls: 0,
    pullsByRarity: {
      EXCELLENT: 0,
      ANCIENT: 0,
      MULTI: 0,
      SPECIAL: 0,
      OG: 0,
      CELESTIAL: 0,
      ETERNAL: 0,
      PIOUS: 0,
      DIVINE: 0,
      SECRET: 0,
      COSMIC: 0,
      MYTHIC: 0,
      LEGENDARY: 0,
      EPIC: 0,
      RARE: 0,
      UNCOMMON: 0,
      COMMON: 0,
    },
    divinePityCount: 0,
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Settings & Toggles
  const [activeTab, setActiveTab] = useState<ActiveTab>('summon');
  const [engineMode, setEngineMode] = useState<RollEngineMode>('waterfall');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoRollActive, setAutoRollActive] = useState<boolean>(false);
  const [stopOnHighRarity, setStopOnHighRarity] = useState<boolean>(true);
  const [fastSkip, setFastSkip] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Modals & Inspection
  const [currentResults, setCurrentResults] = useState<PullResult[] | null>(null);
  const [resultsTitle, setResultsTitle] = useState<string | null>(null);
  const [inspectCard, setInspectCard] = useState<{
    card: GachaCard;
    item?: InventoryItem;
  } | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isLuckModalOpen, setIsLuckModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Coin Luck Level (Upgraded with coins/gold)
  const [coinLuckLevel, setCoinLuckLevel] = useState<number>(0);

  // Ultra God Luck (사용자 요청: 행운 1,000,000,000)
  const [godLuckBonus, setGodLuckBonus] = useState<number>(1000000000);

  const [recentHighTierPulls, setRecentHighTierPulls] = useState<
    Array<{ name: string; rarity: Rarity; time: string }>
  >([]);

  // Relics State
  const [ownedRelicIds, setOwnedRelicIds] = useState<Set<string>>(new Set());

  // Lucky Block Count
  const [luckyBlockCount, setLuckyBlockCount] = useState<number>(0);

  // Shop State
  const [shopState, setShopState] = useState<ShopState>({
    items: [],
    nextRestockAt: Date.now() + 5 * 60 * 1000,
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.gold === 'number') setGold(parsed.gold);
        if (typeof parsed.gems === 'number') setGems(parsed.gems);
        if (typeof parsed.coinLuckLevel === 'number') setCoinLuckLevel(parsed.coinLuckLevel);
        if (typeof parsed.godLuckBonus === 'number') setGodLuckBonus(parsed.godLuckBonus);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.unlockedIds && Array.isArray(parsed.unlockedIds)) {
          setUnlockedIds(new Set(parsed.unlockedIds));
        }
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.engineMode) setEngineMode(parsed.engineMode);
        if (parsed.shopState) setShopState(parsed.shopState);
        if (parsed.ownedRelicIds && Array.isArray(parsed.ownedRelicIds)) {
          setOwnedRelicIds(new Set(parsed.ownedRelicIds));
        }
        if (typeof parsed.luckyBlockCount === 'number') setLuckyBlockCount(parsed.luckyBlockCount);
      }
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        gold,
        gems,
        coinLuckLevel,
        godLuckBonus,
        inventory,
        unlockedIds: Array.from(unlockedIds),
        stats,
        achievements,
        engineMode,
        shopState,
        ownedRelicIds: Array.from(ownedRelicIds),
        luckyBlockCount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [gold, gems, coinLuckLevel, godLuckBonus, inventory, unlockedIds, stats, achievements, engineMode, shopState, ownedRelicIds, luckyBlockCount]);

  // Compute Total GPS, Card Luck and Coin Luck Bonus
  const { totalGps, cardLuckBonus } = useMemo(() => {
    let gps = 0;
    let luck = 0;
    Object.values(inventory).forEach((item) => {
      const card = CARDS_MAP[item.cardId];
      if (card) {
        const starMultiplier = 1 + (item.starLevel - 1) * 0.25;
        gps += Math.round(card.goldPerSec * starMultiplier);
        luck += card.luckBonus;
      }
    });
    return { totalGps: gps, cardLuckBonus: luck };
  }, [inventory]);

  const relicLuckBonus = useMemo(() => {
    let bonus = 0;
    ownedRelicIds.forEach(id => {
      if (id === 'relic-3') bonus += 20; // 축복받은 루비
    });
    return bonus;
  }, [ownedRelicIds]);

  const coinLuckBonus = Number((coinLuckLevel * 1.5).toFixed(1));
  const totalLuckBonus = godLuckBonus + cardLuckBonus + coinLuckBonus + relicLuckBonus;

  useEffect(() => {
    const interval = setInterval(() => {
      setGems((prev) => prev + 1);
      setGold((prev) => prev + (totalGps > 0 ? totalGps : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalGps]);

  // Shop Restock Logic
  useEffect(() => {
    const checkRestock = () => {
      if (Date.now() >= shopState.nextRestockAt || shopState.items.length === 0) {
        setShopState((prev) => ({
          items: generateShopItems(),
          nextRestockAt: Date.now() + 5 * 60 * 1000,
        }));
      }
    };

    checkRestock();
    const interval = setInterval(checkRestock, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [shopState.nextRestockAt, shopState.items.length]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playTap();
  };

  // Add Free Gems button (+1,000,000,000 / 10억 다이아)
  const handleAddFreeGems = () => {
    setGems((prev) => prev + 1000);
    sound.playCoin();
  };

  // Manual Gold Tap
  const handleGoldClick = () => {
    const earned = Math.max(10, Math.round(totalGps * 0.2));
    setGold((prev) => prev + earned);
    sound.playTap();
  };

  // Upgrade Coin Luck using gold
  const handleUpgradeCoinLuck = (times: number) => {
    if (times <= 0) return;
    const getCostForLevel = (lvl: number) => Math.round(1000 * Math.pow(1.12, lvl));
    let requiredGold = 0;
    for (let i = 0; i < times; i++) {
      requiredGold += getCostForLevel(coinLuckLevel + i);
    }
    if (gold >= requiredGold) {
      setGold((prev) => prev - requiredGold);
      setCoinLuckLevel((prev) => prev + times);
      sound.playCoin();
    }
  };

  // Core Pull Function
  const executePull = useCallback(
    (count: number, isAuto: boolean = false) => {
      let cost = count === 1 ? 100 : Math.round(count * 90);
      
      // Special cost for 10,000 pulls
      if (count === 10000) {
        cost = 900000;
      }
      
      if (gems < cost) {
        if (isAuto) {
          setAutoRollActive(false);
        }
        return false;
      }

      setGems((prev) => prev - cost);
      setIsRolling(true);
      setResultsTitle(null); // Reset to default

      const pullResults: PullResult[] = [];
      const newInventory = { ...inventory };
      const newUnlockedIds = new Set(unlockedIds);
      const newPullsByRarity = { ...stats.pullsByRarity };
      let newPityCount = stats.divinePityCount;
      const newRecentLogs: Array<{ name: string; rarity: Rarity; time: string }> = [];

      for (let i = 0; i < count; i++) {
        newPityCount++;
        const luckMultiplier = 1 + totalLuckBonus / 100;
        const rarity = rollSingleRarity(engineMode, luckMultiplier, newPityCount);

        if (rarity === 'DIVINE') {
          newPityCount = 0; // reset divine pity
        }

        newPullsByRarity[rarity] = (newPullsByRarity[rarity] || 0) + 1;
        const card = getRandomCardForRarity(rarity);

        const isNew = !newUnlockedIds.has(card.id);
        newUnlockedIds.add(card.id);

        let previousStarLevel = 1;
        let newStarLevel = 1;

        if (newInventory[card.id]) {
          previousStarLevel = newInventory[card.id].starLevel;
          newStarLevel = previousStarLevel;
          newInventory[card.id] = {
            ...newInventory[card.id],
            count: newInventory[card.id].count + 1,
          };
        } else {
          newInventory[card.id] = {
            cardId: card.id,
            count: 1,
            starLevel: 1,
            firstUnlockedAt: Date.now(),
          };
        }

        // Log if high tier
        if (
          ['EXCELLENT', 'ANCIENT', 'MULTI', 'SPECIAL', 'OG', 'CELESTIAL', 'ETERNAL', 'PIOUS', 'DIVINE', 'SECRET', 'MYTHIC'].includes(
            rarity
          )
        ) {
          const nowStr = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          newRecentLogs.unshift({
            name: card.name,
            rarity,
            time: nowStr,
          });
        }

        pullResults.push({
          card,
          isNew,
          previousStarLevel,
          newStarLevel,
          rollIndex: i,
        });
      }

      // Update state
      setInventory(newInventory);
      setUnlockedIds(newUnlockedIds);
      setStats((prev) => ({
        ...prev,
        totalPulls: prev.totalPulls + count,
        pullsByRarity: newPullsByRarity,
        divinePityCount: newPityCount,
      }));

      if (newRecentLogs.length > 0) {
        setRecentHighTierPulls((prev) => [...newRecentLogs, ...prev].slice(0, 10));
      }

      // Check achievements
      setAchievements((prev) =>
        prev.map((ach) => {
          let currentProgress = ach.progress;
          if (ach.id === 'first-pull') {
            currentProgress = Math.min(1, currentProgress + count);
          } else if (ach.id === 'pull-100' || ach.id === 'pull-1000') {
            currentProgress = Math.min(ach.maxProgress, stats.totalPulls + count);
          } else if (ach.id === 'first-mythic' && newPullsByRarity.MYTHIC > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-secret' && newPullsByRarity.SECRET > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-pious' && newPullsByRarity.PIOUS > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-divine' && newPullsByRarity.DIVINE > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-eternal' && newPullsByRarity.ETERNAL > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-celestial' && newPullsByRarity.CELESTIAL > 0) {
            currentProgress = 1;
          } else if (ach.id === 'first-og' && newPullsByRarity.OG > 0) {
            currentProgress = 1;
          } else if (ach.id === 'collect-25' || ach.id === 'collect-all') {
            currentProgress = Math.min(ach.maxProgress, newUnlockedIds.size);
          }
          return {
            ...ach,
            progress: currentProgress,
          };
        })
      );

      // Check auto-stop condition
      const drawnHighTier = pullResults.some((r) =>
        ['EXCELLENT', 'ANCIENT', 'MULTI', 'SPECIAL', 'OG', 'CELESTIAL', 'ETERNAL', 'PIOUS', 'DIVINE', 'SECRET', 'MYTHIC'].includes(
          r.card.rarity
        )
      );

      if (isAuto && stopOnHighRarity && drawnHighTier) {
        setAutoRollActive(false);
      }

      // Display reveal modal if not auto-rolling or fast-skip is off
      if (!isAuto || (isAuto && drawnHighTier)) {
        setCurrentResults(pullResults);
      }

      setIsRolling(false);
      return true;
    },
    [gems, inventory, unlockedIds, stats, totalLuckBonus, engineMode, stopOnHighRarity]
  );

  // Auto Roll Effect Loop
  useEffect(() => {
    if (!autoRollActive) return;

    const interval = setInterval(() => {
      const ok = executePull(1, true);
      if (!ok) {
        setAutoRollActive(false);
      }
    }, fastSkip ? 200 : 800);

    return () => clearInterval(interval);
  }, [autoRollActive, executePull, fastSkip]);

  // Upgrade card star level
  const handleUpgradeStar = (cardId: string) => {
    const item = inventory[cardId];
    if (!item || item.count < 2 || item.starLevel >= 5) return;

    setInventory((prev) => ({
      ...prev,
      [cardId]: {
        ...item,
        count: item.count - 1, // Consumes 1 duplicate
        starLevel: item.starLevel + 1,
      },
    }));

    sound.playReveal('LEGENDARY');
  };

  // Buy Shop Item
  const handleBuyShopItem = (itemId: string) => {
    const item = shopState.items.find((i) => i.id === itemId);
    if (!item || item.isSoldOut || gold < item.cost) {
      sound.playError();
      return;
    }

    setGold((prev) => prev - item.cost);
    sound.playCoin();

    // Mark as sold out
    setShopState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, isSoldOut: true } : i)),
    }));

    if (item.type === 'card' && item.cardId) {
      const card = CARDS_MAP[item.cardId];
      if (card) {
        setInventory((prev) => {
          const inv = { ...prev };
          if (inv[card.id]) {
            inv[card.id] = { ...inv[card.id], count: inv[card.id].count + 1 };
          } else {
            inv[card.id] = {
              cardId: card.id,
              count: 1,
              starLevel: 1,
              firstUnlockedAt: Date.now(),
            };
          }
          return inv;
        });
        setUnlockedIds((prev) => {
          const next = new Set(prev);
          next.add(card.id);
          return next;
        });
        sound.playReveal(card.rarity);
      }
    } else if (item.type === 'resource' && item.resourceType === 'gems') {
      setGems((prev) => prev + (item.amount || 0));
    } else if (item.type === 'luck') {
      setGodLuckBonus((prev) => prev + (item.amount || 0));
    } else if (item.type === 'relic' && item.relicId) {
      setOwnedRelicIds((prev) => {
        const next = new Set(prev);
        next.add(item.relicId!);
        return next;
      });
      sound.playReveal('MYTHIC'); // Play fanfare for relic
    } else if (item.type === 'lucky_block') {
      setLuckyBlockCount(prev => prev + 1);
      sound.playTap();
      alert('🍀 럭키 블럭이 배낭에 추가되었습니다!');
    }
  };

  // Open Lucky Block Logic
  const handleOpenLuckyBlock = () => {
    if (luckyBlockCount <= 0) return;

    setLuckyBlockCount(prev => prev - 1);
    sound.playTap();

    // Random reward from Lucky Block (User request: 20M Gold/Gems, 0.0005% SPECIAL, 1% OG, 50% COMMON)
    const roll = Math.random() * 100;
    
    if (roll < 0.0005) {
      // SPECIAL rarity card (0.0005%)
      const card = getRandomCardForRarity('SPECIAL');
      const isNew = !unlockedIds.has(card.id);
      setInventory(prev => {
        const inv = { ...prev };
        if (inv[card.id]) {
          inv[card.id] = { ...inv[card.id], count: inv[card.id].count + 1 };
        } else {
          inv[card.id] = { cardId: card.id, count: 1, starLevel: 1, firstUnlockedAt: Date.now() };
        }
        return inv;
      });
      setUnlockedIds(prev => {
        const next = new Set(prev);
        next.add(card.id);
        return next;
      });
      
      // Use result modal for cards
      setResultsTitle('🍀 럭키 블럭 개봉 결과');
      setCurrentResults([{
        card,
        isNew,
        previousStarLevel: 1,
        newStarLevel: 1,
        rollIndex: 0
      }]);
      sound.playReveal('SPECIAL');
    } else if (roll < 1.0005) {
      // OG rarity card (1%)
      const card = getRandomCardForRarity('OG');
      const isNew = !unlockedIds.has(card.id);
      setInventory(prev => {
        const inv = { ...prev };
        if (inv[card.id]) {
          inv[card.id] = { ...inv[card.id], count: inv[card.id].count + 1 };
        } else {
          inv[card.id] = { cardId: card.id, count: 1, starLevel: 1, firstUnlockedAt: Date.now() };
        }
        return inv;
      });
      setUnlockedIds(prev => {
        const next = new Set(prev);
        next.add(card.id);
        return next;
      });
      
      setResultsTitle('🍀 럭키 블럭 개봉 결과');
      setCurrentResults([{
        card,
        isNew,
        previousStarLevel: 1,
        newStarLevel: 1,
        rollIndex: 0
      }]);
      sound.playReveal('OG');
    } else if (roll < 51.0005) {
      // COMMON rarity card (50%)
      const card = getRandomCardForRarity('COMMON');
      const isNew = !unlockedIds.has(card.id);
      setInventory(prev => {
        const inv = { ...prev };
        if (inv[card.id]) {
          inv[card.id] = { ...inv[card.id], count: inv[card.id].count + 1 };
        } else {
          inv[card.id] = { cardId: card.id, count: 1, starLevel: 1, firstUnlockedAt: Date.now() };
        }
        return inv;
      });
      setUnlockedIds(prev => {
        const next = new Set(prev);
        next.add(card.id);
        return next;
      });
      
      setResultsTitle('🍀 럭키 블럭 개봉 결과');
      setCurrentResults([{
        card,
        isNew,
        previousStarLevel: 1,
        newStarLevel: 1,
        rollIndex: 0
      }]);
      sound.playReveal('COMMON');
    } else {
      // Currency reward: 20,000,000 Gold AND 20,000,000 Gems (~48.9995%)
      const amount = 20000000;
      setGold(prev => prev + amount);
      setGems(prev => prev + amount);
      alert(`🍀 럭키 블럭 결과: [${amount.toLocaleString()} 코인 & 다이아] 가 떴습니다!`);
    }
  };

  // Batch sell duplicates of common & uncommon
  const handleBatchSellCommons = () => {
    let soldCount = 0;
    let earnedGold = 0;

    const updated = { ...inventory };
    Object.values(updated).forEach((item) => {
      const card = CARDS_MAP[item.cardId];
      if (card && (card.rarity === 'COMMON' || card.rarity === 'UNCOMMON')) {
        if (item.count > 1) {
          const excess = item.count - 1;
          soldCount += excess;
          const price = card.rarity === 'COMMON' ? 50 : 150;
          earnedGold += excess * price;
          updated[item.cardId] = {
            ...item,
            count: 1, // Keep 1 copy
          };
        }
      }
    });

    if (soldCount > 0) {
      setInventory(updated);
      setGold((prev) => prev + earnedGold);
      sound.playCoin();
    }
  };

  // Claim Achievement
  const handleClaimReward = (id: string) => {
    const ach = achievements.find((a) => a.id === id);
    if (!ach || ach.isUnlocked || ach.progress < ach.maxProgress) return;

    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isUnlocked: true } : a))
    );
    setGems((prev) => prev + ach.rewardGems);
    setGold((prev) => prev + ach.rewardGold);
    sound.playReveal('EPIC');
  };

  // Redeem Secret Code for Celestial Card (Code: 998807)
  const handleRedeemSecretCode = (
    inputCode: string
  ): { success: boolean; message: string; cardName?: string } => {
    const cleanCode = inputCode.trim();
    if (cleanCode !== '998807') {
      return {
        success: false,
        message: '유효하지 않은 코드입니다. 천상 비전 코드(998807)를 정확히 입력해 주세요.',
      };
    }

    const celestialCards = CARDS_BY_RARITY['CELESTIAL'] || [];
    if (celestialCards.length === 0) {
      return {
        success: false,
        message: '천상 등급 카드를 찾을 수 없습니다.',
      };
    }

    // Pick an uncollected Celestial card first if available, else pick random
    const uncollected = celestialCards.filter((c) => !unlockedIds.has(c.id));
    const card =
      uncollected.length > 0
        ? uncollected[Math.floor(Math.random() * uncollected.length)]
        : celestialCards[Math.floor(Math.random() * celestialCards.length)];

    const isNew = !unlockedIds.has(card.id);
    const newUnlockedIds = new Set(unlockedIds);
    newUnlockedIds.add(card.id);

    let previousStarLevel = 1;
    let newStarLevel = 1;
    const newInventory = { ...inventory };

    if (newInventory[card.id]) {
      previousStarLevel = newInventory[card.id].starLevel;
      newStarLevel = previousStarLevel;
      newInventory[card.id] = {
        ...newInventory[card.id],
        count: newInventory[card.id].count + 1,
      };
    } else {
      newInventory[card.id] = {
        cardId: card.id,
        count: 1,
        starLevel: 1,
        firstUnlockedAt: Date.now(),
      };
    }

    const newPullsByRarity = { ...stats.pullsByRarity };
    newPullsByRarity['CELESTIAL'] = (newPullsByRarity['CELESTIAL'] || 0) + 1;

    const nowStr = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setRecentHighTierPulls((prev) => [
      {
        name: `[암호 998807] ${card.name}`,
        rarity: 'CELESTIAL' as Rarity,
        time: nowStr,
      },
      ...prev,
    ].slice(0, 10));

    setInventory(newInventory);
    setUnlockedIds(newUnlockedIds);
    setStats((prev) => ({
      ...prev,
      pullsByRarity: newPullsByRarity,
    }));

    // Trigger celebration reveal modal with roulette & cosmic aura
    setCurrentResults([
      {
        card,
        isNew,
        previousStarLevel,
        newStarLevel,
        rollIndex: 0,
      },
    ]);

    sound.playReveal('CELESTIAL');

    return {
      success: true,
      message: `🌟 천상(CELESTIAL) 등급 [${card.name}] 카드 획득 완료!`,
      cardName: card.name,
    };
  };

  // Reset Game Data
  const handleResetGame = () => {
    if (
      window.confirm(
        '정말 모든 소환 및 수집 데이터를 초기화하시겠습니까? (처음부터 다시 시작합니다)'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setGold(5000);
      setGems(100);
      setInventory({});
      setUnlockedIds(new Set());
      setStats({
        totalPulls: 0,
        pullsByRarity: {
          EXCELLENT: 0,
          ANCIENT: 0,
          MULTI: 0,
          SPECIAL: 0,
          OG: 0,
          CELESTIAL: 0,
          ETERNAL: 0,
          PIOUS: 0,
          DIVINE: 0,
          SECRET: 0,
          COSMIC: 0,
          MYTHIC: 0,
          LEGENDARY: 0,
          EPIC: 0,
          RARE: 0,
          UNCOMMON: 0,
          COMMON: 0,
        },
        divinePityCount: 0,
      });
      setAchievements(INITIAL_ACHIEVEMENTS);
      setRecentHighTierPulls([]);
      setCoinLuckLevel(0);
      setGodLuckBonus(1000000000);
      setLuckyBlockCount(0);
      sound.playTap();
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'stats') setIsRatesModalOpen(true);
          if (tab === 'achievements') setIsAchievementsModalOpen(true);
          sound.playTap();
        }}
        gold={gold}
        gems={gems}
        totalGps={totalGps}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onAddFreeGems={handleAddFreeGems}
        onGoldClick={handleGoldClick}
        onOpenLuckModal={() => setIsLuckModalOpen(true)}
        coinLuckBonus={coinLuckBonus}
        totalLuckBonus={totalLuckBonus}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'summon' && (
          <SummonAltar
            gems={gems}
            gold={gold}
            onPull={(count) => executePull(count, false)}
            isRolling={isRolling}
            autoRollActive={autoRollActive}
            onToggleAutoRoll={() => {
              setAutoRollActive((prev) => !prev);
              sound.playTap();
            }}
            stopOnHighRarity={stopOnHighRarity}
            onToggleStopOnHighRarity={() =>
              setStopOnHighRarity((prev) => !prev)
            }
            fastSkip={fastSkip}
            onToggleFastSkip={() => setFastSkip((prev) => !prev)}
            pityCount={stats.divinePityCount}
            totalLuckBonus={totalLuckBonus}
            coinLuckLevel={coinLuckLevel}
            coinLuckBonus={coinLuckBonus}
            onOpenLuckModal={() => setIsLuckModalOpen(true)}
            onQuickUpgradeLuck={handleUpgradeCoinLuck}
            recentHighTierPulls={recentHighTierPulls}
            onOpenRates={() => setIsRatesModalOpen(true)}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onSelectCard={(card, item) => setInspectCard({ card, item })}
            onUpgradeStar={handleUpgradeStar}
            onBatchSellCommons={handleBatchSellCommons}
            ownedRelicIds={ownedRelicIds}
            luckyBlockCount={luckyBlockCount}
            onOpenLuckyBlock={handleOpenLuckyBlock}
          />
        )}

        {activeTab === 'codex' && (
          <CodexView
            unlockedIds={unlockedIds}
            inventory={inventory}
            onSelectCard={(card, item) => setInspectCard({ card, item })}
          />
        )}

        {activeTab === 'stats' && (
          <div className="py-8 text-center">
            <SummonAltar
              gems={gems}
              gold={gold}
              onPull={(count) => executePull(count, false)}
              isRolling={isRolling}
              autoRollActive={autoRollActive}
              onToggleAutoRoll={() => setAutoRollActive((prev) => !prev)}
              stopOnHighRarity={stopOnHighRarity}
              onToggleStopOnHighRarity={() =>
                setStopOnHighRarity((prev) => !prev)
              }
              fastSkip={fastSkip}
              onToggleFastSkip={() => setFastSkip((prev) => !prev)}
              pityCount={stats.divinePityCount}
              totalLuckBonus={totalLuckBonus}
              coinLuckLevel={coinLuckLevel}
              coinLuckBonus={coinLuckBonus}
              onOpenLuckModal={() => setIsLuckModalOpen(true)}
              onQuickUpgradeLuck={handleUpgradeCoinLuck}
              recentHighTierPulls={recentHighTierPulls}
              onOpenRates={() => setIsRatesModalOpen(true)}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="py-8 text-center">
            <SummonAltar
              gems={gems}
              gold={gold}
              onPull={(count) => executePull(count, false)}
              isRolling={isRolling}
              autoRollActive={autoRollActive}
              onToggleAutoRoll={() => setAutoRollActive((prev) => !prev)}
              stopOnHighRarity={stopOnHighRarity}
              onToggleStopOnHighRarity={() =>
                setStopOnHighRarity((prev) => !prev)
              }
              fastSkip={fastSkip}
              onToggleFastSkip={() => setFastSkip((prev) => !prev)}
              pityCount={stats.divinePityCount}
              totalLuckBonus={totalLuckBonus}
              coinLuckLevel={coinLuckLevel}
              coinLuckBonus={coinLuckBonus}
              onOpenLuckModal={() => setIsLuckModalOpen(true)}
              onQuickUpgradeLuck={handleUpgradeCoinLuck}
              recentHighTierPulls={recentHighTierPulls}
              onOpenRates={() => setIsRatesModalOpen(true)}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'shop' && (
          <ShopView
            shopState={shopState}
            gold={gold}
            onBuy={handleBuyShopItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            신성 가차 시뮬레이터 · 공식 확률: OG 0.00000000032% · 천상 0.00000001% · 영원한 0.000005% · 경건한 0.0001% · 신성 0.05% · 비밀 1% · 신화 6.5% · 전설 16% · 에픽 21% · 레어 29% · 드문 36% · 일반 45%
          </p>

          <button
            onClick={handleResetGame}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>데이터 초기화</span>
          </button>
        </div>
      </footer>

      {/* Reveal Modal */}
      {currentResults && (
        <SummonResultModal
          results={currentResults}
          title={resultsTitle || undefined}
          onClose={() => {
            setCurrentResults(null);
            setResultsTitle(null);
          }}
          onPullAgain={(count) => executePull(count, false)}
          gems={gems}
        />
      )}

      {/* Probability Modal */}
      <ProbabilityModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        stats={stats}
        engineMode={engineMode}
        onChangeEngineMode={(mode) => setEngineMode(mode)}
      />

      {/* Achievements Modal */}
      {isAchievementsModalOpen && (
        <AchievementsModal
          achievements={achievements}
          onClaimReward={handleClaimReward}
          onClose={() => setIsAchievementsModalOpen(false)}
        />
      )}

      {/* Card Detail Modal */}
      {inspectCard && (
        <CardDetailModal
          card={inspectCard.card}
          item={inspectCard.item}
          onClose={() => setInspectCard(null)}
          onUpgradeStar={handleUpgradeStar}
        />
      )}

      {/* Luck Upgrade Modal (코인으로 행운 올리기) */}
      <LuckUpgradeModal
        isOpen={isLuckModalOpen}
        onClose={() => setIsLuckModalOpen(false)}
        gold={gold}
        coinLuckLevel={coinLuckLevel}
        onUpgrade={handleUpgradeCoinLuck}
        cardLuckBonus={cardLuckBonus}
        godLuckBonus={godLuckBonus}
      />

      {/* Secret Code Modal (천상 코드 998807) */}
      <SecretCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onRedeem={handleRedeemSecretCode}
      />

      <OfflineIndicator />
    </div>
  );
}
