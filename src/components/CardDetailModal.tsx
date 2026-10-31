import React from 'react';
import {
  X,
  Star,
  Swords,
  Coins,
  Sparkles,
  Shield,
  Crown,
  Quote,
} from 'lucide-react';
import { GachaCard, InventoryItem } from '../types/game';
import { RARITIES } from '../data/rarityConfig';
import { CardItem } from './CardItem';

interface CardDetailModalProps {
  card: GachaCard | null;
  item?: InventoryItem;
  onClose: () => void;
  onUpgradeStar?: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  item,
  onClose,
  onUpgradeStar,
}) => {
  if (!card) return null;

  const rarityConfig = RARITIES[card.rarity];
  const starLevel = item ? item.starLevel : 1;
  const count = item ? item.count : 0;
  const starMultiplier = 1 + (starLevel - 1) * 0.25;
  const currentCP = Math.round(card.combatPower * starMultiplier);
  const currentGPS = Math.round(card.goldPerSec * starMultiplier);
  const canUpgrade = count >= 2 && starLevel < 5 && onUpgradeStar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-black ${rarityConfig.badgeBg}`}
            >
              {rarityConfig.nameKr}
            </span>
            <h3 className="text-base font-bold text-slate-100">{card.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Card Preview */}
          <div className="w-56 mb-4">
            <CardItem
              card={card}
              count={count}
              starLevel={starLevel}
              isUnlocked={true}
              showStats={false}
              isHighlighted={true}
            />
          </div>

          {/* Stats Bar */}
          <div className="w-full grid grid-cols-3 gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl font-mono-num text-center mb-4">
            <div>
              <span className="text-[10px] text-slate-500 block">전투력 (CP)</span>
              <span className="text-xs font-bold text-rose-400">
                {currentCP.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">초당 골드 (GPS)</span>
              <span className="text-xs font-bold text-amber-400">
                +{currentGPS}/s
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">행운 보너스</span>
              <span className="text-xs font-bold text-emerald-400">
                +{card.luckBonus}%
              </span>
            </div>
          </div>

          {/* Lore & Quote */}
          <div className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                스토리 & 배경
              </span>
              <p className="text-slate-300 leading-relaxed">{card.lore}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-start gap-2 text-amber-300/90 italic">
              <Quote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>{card.quote}</span>
            </div>
          </div>

          {/* Upgrade Action if duplicates */}
          {canUpgrade && (
            <div className="w-full mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  성급 각성 가능!
                </span>
                <span className="text-[11px] text-slate-400">
                  중복 보유 카드 소모하여 {starLevel + 1}★ 각성 (+25% 능력치)
                </span>
              </div>
              <button
                onClick={() => onUpgradeStar(card.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-md"
              >
                각성 진행
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
