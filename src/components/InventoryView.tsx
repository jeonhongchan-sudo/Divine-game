import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Sparkles,
  Star,
  Swords,
  Coins,
  Check,
  History,
  Compass,
  Hourglass,
  Trophy,
  Sun,
  Crown,
  Flame,
  Wand2,
  Gem,
  Box,
} from 'lucide-react';
import { InventoryItem, Rarity, GachaCard } from '../types/game';
import { CARDS_MAP } from '../data/cards';
import { RELICS_MAP } from '../data/relics';
import { RARITIES, RARITY_ORDER } from '../data/rarityConfig';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';

interface InventoryViewProps {
  inventory: Record<string, InventoryItem>;
  onSelectCard: (card: GachaCard, item: InventoryItem) => void;
  onUpgradeStar: (cardId: string) => void;
  onBatchSellCommons: () => void;
  ownedRelicIds?: Set<string>;
  luckyBlockCount: number;
  onOpenLuckyBlock: () => void;
}

type SortOption = 'rarity' | 'power' | 'count' | 'star' | 'name';

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onSelectCard,
  onUpgradeStar,
  onBatchSellCommons,
  ownedRelicIds = new Set(),
  luckyBlockCount,
  onOpenLuckyBlock,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('rarity');

  // Total combat power and GPS calculation
  const { totalCombatPower, totalGps, totalCardsCount, uniqueCount } = useMemo(() => {
    let cp = 0;
    let gps = 0;
    let totalCount = 0;
    let unique = 0;

    Object.values(inventory).forEach((item) => {
      const card = CARDS_MAP[item.cardId];
      if (card) {
        unique++;
        totalCount += item.count;
        const starMultiplier = 1 + (item.starLevel - 1) * 0.25;
        cp += Math.round(card.combatPower * starMultiplier);
        gps += Math.round(card.goldPerSec * starMultiplier);
      }
    });

    return {
      totalCombatPower: cp,
      totalGps: gps,
      totalCardsCount: totalCount,
      uniqueCount: unique,
    };
  }, [inventory]);

  // Filtered and sorted cards list
  const filteredItems = useMemo(() => {
    return Object.values(inventory)
      .filter((item) => {
        const card = CARDS_MAP[item.cardId];
        if (!card) return false;
        if (selectedRarity !== 'ALL' && card.rarity !== selectedRarity) return false;
        if (
          searchQuery.trim() &&
          !card.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !card.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const cardA = CARDS_MAP[a.cardId];
        const cardB = CARDS_MAP[b.cardId];
        if (!cardA || !cardB) return 0;

        if (sortOption === 'rarity') {
          const rA = RARITY_ORDER.indexOf(cardA.rarity);
          const rB = RARITY_ORDER.indexOf(cardB.rarity);
          if (rA !== rB) return rA - rB;
          return cardB.combatPower - cardA.combatPower;
        }
        if (sortOption === 'power') {
          const multA = 1 + (a.starLevel - 1) * 0.25;
          const multB = 1 + (b.starLevel - 1) * 0.25;
          return cardB.combatPower * multB - cardA.combatPower * multA;
        }
        if (sortOption === 'count') {
          return b.count - a.count;
        }
        if (sortOption === 'star') {
          return b.starLevel - a.starLevel;
        }
        if (sortOption === 'name') {
          return cardA.name.localeCompare(cardB.name);
        }
        return 0;
      });
  }, [inventory, selectedRarity, searchQuery, sortOption]);

  // Count common & uncommon cards eligible for selling
  const sellableCommonsCount = useMemo(() => {
    return Object.values(inventory).reduce((acc, item) => {
      const card = CARDS_MAP[item.cardId];
      if (card && (card.rarity === 'COMMON' || card.rarity === 'UNCOMMON')) {
        // Keep at least 1 copy, sell the rest
        if (item.count > 1) {
          acc += item.count - 1;
        }
      }
      return acc;
    }, 0);
  }, [inventory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">총 보유 카드 수</span>
          <span className="font-mono-num text-xl font-black text-slate-100">
            {totalCardsCount.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">
              ({uniqueCount}종)
            </span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">총 합산 전투력 (CP)</span>
          <span className="font-mono-num text-xl font-black text-rose-400 flex items-center gap-1.5">
            <Swords className="h-4 w-4" />
            {totalCombatPower.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">초당 자동 골드 (GPS)</span>
          <span className="font-mono-num text-xl font-black text-amber-400 flex items-center gap-1.5">
            <Coins className="h-4 w-4" />
            +{totalGps.toLocaleString()}/s
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">중복 하위 카드</span>
            <span className="font-mono-num text-sm font-bold text-slate-300">
              {sellableCommonsCount}장 분해 가능
            </span>
          </div>
          <button
            onClick={onBatchSellCommons}
            disabled={sellableCommonsCount === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/50 rounded-lg hover:bg-rose-900/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>일괄 분해</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        {/* Rarity Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedRarity('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedRarity === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            전체 보기
          </button>
          {RARITY_ORDER.map((rarity) => {
            const config = RARITIES[rarity];
            const isSelected = selectedRarity === rarity;
            return (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? config.badgeBg
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {config.nameKr}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="카드 이름 검색..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="rarity">희귀도순</option>
              <option value="power">전투력순</option>
              <option value="count">보유량순</option>
              <option value="star">성급(각성)순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">
            배낭에 해당하는 카드가 없습니다.
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            소환의 제단에서 카드를 소환하거나 검색 필터를 변경해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredItems.map((item) => {
            const card = CARDS_MAP[item.cardId];
            if (!card) return null;
            const canUpgrade = item.count >= 2 && item.starLevel < 5;

            return (
              <div key={item.cardId} className="flex flex-col">
                <CardItem
                  card={card}
                  count={item.count}
                  starLevel={item.starLevel}
                  isUnlocked={true}
                  onClick={() => onSelectCard(card, item)}
                  showStats={true}
                />

                {/* Upgrade Button if 2+ copies */}
                {canUpgrade && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgradeStar(item.cardId);
                    }}
                    className="mt-1.5 py-1 px-2 text-[11px] font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>성급 각성 ({item.starLevel}★ → {item.starLevel + 1}★)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Relics & Special Items Section */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <History className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-100 font-cinzel">수집된 유물 및 특별 아이템 (Relics)</h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            {ownedRelicIds.size + (luckyBlockCount > 0 ? 1 : 0)}종 보유 중
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lucky Block Item in Relic Slot */}
          {luckyBlockCount > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/40 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">x{luckyBlockCount}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                  <Box className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">신비한 럭키 블럭</h4>
                  <p className="text-[10px] text-amber-400/80 font-bold">소모성 보물 상자</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                개봉 시 2천만 골드/다이아, 또는 초고등급 카드를 획득할 수 있는 신비한 상자입니다.
              </p>

              <button
                onClick={onOpenLuckyBlock}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-lg shadow-amber-500/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3 w-3" />
                <span>지금 개봉하기</span>
              </button>
            </div>
          )}

          {/* Regular Relics */}
          {Array.from(ownedRelicIds).map((relicId) => {
            const relic = RELICS_MAP[relicId];
            if (!relic) return null;
            const rarity = RARITIES[relic.rarity];
            
            const RelicIcon = (() => {
              switch(relic.iconType) {
                case 'Compass': return Compass;
                case 'Hourglass': return Hourglass;
                case 'Trophy': return Trophy;
                case 'Sun': return Sun;
                case 'Crown': return Crown;
                case 'Gem': return Gem;
                case 'Flame': return Flame;
                case 'Wand2': return Wand2;
                default: return Gem;
              }
            })();

            return (
              <div key={relicId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-emerald-500/40 transition-colors group">
                <div className={`p-3 rounded-lg bg-opacity-10 bg-current ${rarity?.textColor}`}>
                  <RelicIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">{relic.name}</h4>
                  <p className="text-[10px] text-emerald-400 font-bold mb-0.5">{relic.effect}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{relic.description}</p>
                </div>
              </div>
            );
          })}

          {/* Empty Slot Placeholder if no relics/lucky blocks */}
          {ownedRelicIds.size === 0 && luckyBlockCount === 0 && (
            <div className="col-span-full py-12 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
              <History className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-bold">수집된 유물이 없습니다. 상점에서 유물을 획득해 보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
