import React, { useState } from 'react';
import { BookOpen, Trophy, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { GachaCard, InventoryItem, Rarity } from '../types/game';
import { GACHA_CARDS, CARDS_BY_RARITY } from '../data/cards';
import { RARITIES, RARITY_ORDER, RARITY_RATE_DISPLAY } from '../data/rarityConfig';
import { CardItem } from './CardItem';

interface CodexViewProps {
  unlockedIds: Set<string>;
  inventory: Record<string, InventoryItem>;
  onSelectCard: (card: GachaCard, item?: InventoryItem) => void;
}

export const CodexView: React.FC<CodexViewProps> = ({
  unlockedIds,
  inventory,
  onSelectCard,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');

  const totalCards = GACHA_CARDS.length;
  const unlockedCount = unlockedIds.size;
  const completionPercentage = ((unlockedCount / totalCards) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header and Progress Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">
                삼라만상 수집 도감
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              차원의 모든 카드 32종을 수집하여 영구적인 행운 및 골드 생산 보너스를 획득하세요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">도감 수집률</span>
              <span className="font-mono-num text-2xl font-black text-amber-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden sm:block" />
            <div className="text-right font-mono-num text-xs text-slate-300">
              <span className="block font-bold">
                {unlockedCount} / {totalCards}
              </span>
              <span className="text-slate-500">수집 완료</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full mt-4 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Tier Badges Mini Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-1.5 mt-4 pt-4 border-t border-slate-800/80">
          {RARITY_ORDER.map((rarity) => {
            const config = RARITIES[rarity];
            const cardsInTier = CARDS_BY_RARITY[rarity] || [];
            const tierUnlockedCount = cardsInTier.filter((c) =>
              unlockedIds.has(c.id)
            ).length;
            const isCompleted = tierUnlockedCount === cardsInTier.length && cardsInTier.length > 0;

            return (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`p-1.5 rounded-lg text-left transition-all cursor-pointer ${
                  selectedRarity === rarity
                    ? 'ring-2 ring-amber-400 bg-slate-800'
                    : 'bg-slate-950/60 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold truncate ${config.textColor}`}>
                    {config.nameKr}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="font-mono-num text-[11px] font-semibold text-slate-300 block mt-0.5">
                  {tierUnlockedCount}/{cardsInTier.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rarity Sections */}
      <div className="space-y-8">
        {RARITY_ORDER.filter(
          (r) => selectedRarity === 'ALL' || selectedRarity === r
        ).map((rarity) => {
          const config = RARITIES[rarity];
          const cardsInTier = CARDS_BY_RARITY[rarity] || [];
          const unlockedInThisTier = cardsInTier.filter((c) =>
            unlockedIds.has(c.id)
          ).length;

          return (
            <div
              key={rarity}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-black ${config.badgeBg}`}
                  >
                    {config.nameKr} 등급
                  </span>
                  <span className="text-xs text-slate-400">
                    기본 확률 {RARITY_RATE_DISPLAY[rarity]}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-num">
                    · {unlockedInThisTier} / {cardsInTier.length} 수집됨
                  </span>
                </div>

                <p className="text-xs text-slate-400">{config.description}</p>
              </div>

              {/* Cards row for this tier */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cardsInTier.map((card) => {
                  const isUnlocked = unlockedIds.has(card.id);
                  const invItem = inventory[card.id];

                  return (
                    <CardItem
                      key={card.id}
                      card={card}
                      count={invItem ? invItem.count : 0}
                      starLevel={invItem ? invItem.starLevel : 1}
                      isUnlocked={isUnlocked}
                      onClick={() => onSelectCard(card, invItem)}
                      showStats={isUnlocked}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
