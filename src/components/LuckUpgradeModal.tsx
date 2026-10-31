import React, { useState } from 'react';
import {
  Sparkles,
  Coins,
  TrendingUp,
  X,
  Zap,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { formatLuck } from '../utils/gachaEngine';

interface LuckUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  coinLuckLevel: number;
  onUpgrade: (times: number) => void;
  cardLuckBonus: number;
  godLuckBonus?: number;
}

export const LuckUpgradeModal: React.FC<LuckUpgradeModalProps> = ({
  isOpen,
  onClose,
  gold,
  coinLuckLevel,
  onUpgrade,
  cardLuckBonus,
  godLuckBonus = 0,
}) => {
  if (!isOpen) return null;

  // Formula:
  // Base cost = 1,000 gold
  // Cost for level L: Math.round(1000 * Math.pow(1.12, L))
  // Luck bonus per level: +1.5%
  const getCostForLevel = (lvl: number) => Math.round(1000 * Math.pow(1.12, lvl));
  const currentCost = getCostForLevel(coinLuckLevel);
  const currentCoinLuck = Number((coinLuckLevel * 1.5).toFixed(1));
  const totalLuck = godLuckBonus + cardLuckBonus + currentCoinLuck;

  // Compute cost for 10 levels
  let cost10 = 0;
  for (let i = 0; i < 10; i++) {
    cost10 += getCostForLevel(coinLuckLevel + i);
  }

  // Compute max affordable levels
  let maxAffordable = 0;
  let maxCost = 0;
  let tempGold = gold;
  let tempLvl = coinLuckLevel;
  while (true) {
    const nextCost = getCostForLevel(tempLvl);
    if (tempGold >= nextCost) {
      tempGold -= nextCost;
      maxCost += nextCost;
      maxAffordable++;
      tempLvl++;
      if (maxAffordable >= 100) break; // cap per click
    } else {
      break;
    }
  }

  const handleUpgradeAction = (times: number) => {
    onUpgrade(times);
    sound.playCoin();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#facc15', '#fbbf24', '#34d399', '#ffffff'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>황금 행운의 신단</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Lv.{coinLuckLevel}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                코인(골드)을 바쳐 영구적인 소환 행운 보너스를 강화합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Display Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-emerald-950/20 border border-amber-500/30 shadow-inner">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">코인 행운</span>
                <span className="text-lg font-black text-amber-400 font-mono-num">
                  +{currentCoinLuck}%
                </span>
                <span className="text-[10px] text-slate-500 block">Lv.{coinLuckLevel}</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">도감 행운</span>
                <span className="text-lg font-black text-sky-400 font-mono-num">
                  +{cardLuckBonus.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block">카드 수집 효과</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">총합 행운</span>
                <span className={`text-base font-black font-mono-num ${totalLuck >= 1e20 ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300' : 'text-emerald-400'}`}>
                  +{formatLuck(totalLuck)}
                </span>
                <span className="text-[10px] text-emerald-500/80 block font-bold">
                  {totalLuck >= 1e20 ? '우주적 초월 배율 활성' : `확률 배율 ${((100 + totalLuck) / 100).toFixed(2)}x`}
                </span>
              </div>
            </div>

            {godLuckBonus >= 1e20 && (
              <div className="mt-3 pt-3 border-t border-amber-500/30 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  초월 신의 행운 (1,000,000,000,000,000,000,000,000%)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                  영구 활성화됨
                </span>
              </div>
            )}
          </div>

          {/* Current Wealth */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono-num">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-400" />
              보유 코인(골드):
            </span>
            <span className="text-sm font-black text-amber-300">
              {gold.toLocaleString()} 코인
            </span>
          </div>

          {/* Upgrade Buttons */}
          <div className="space-y-2.5">
            {/* 1 Level Upgrade */}
            <button
              onClick={() => handleUpgradeAction(1)}
              disabled={gold < currentCost}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                gold >= currentCost
                  ? 'border-amber-500/70 bg-gradient-to-r from-amber-500/15 to-slate-900 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] text-slate-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200">
                    행운 1단계 강화 (+1.5%)
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono-num">
                    Lv.{coinLuckLevel} → Lv.{coinLuckLevel + 1} (+{(currentCoinLuck + 1.5).toFixed(1)}%)
                  </div>
                </div>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-xs font-black text-amber-300 block">
                  {currentCost.toLocaleString()} 코인
                </span>
                <span className="text-[10px] text-slate-400">1회 강화</span>
              </div>
            </button>

            {/* 10 Levels Upgrade */}
            <button
              onClick={() => handleUpgradeAction(10)}
              disabled={gold < cost10}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                gold >= cost10
                  ? 'border-sky-500/70 bg-gradient-to-r from-sky-500/15 to-slate-900 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] text-slate-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-400/20 text-sky-300">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200">
                    행운 10단계 일괄 강화 (+15.0%)
                  </div>
                  <div className="text-[11px] text-sky-300 font-mono-num">
                    Lv.{coinLuckLevel} → Lv.{coinLuckLevel + 10} (+{(currentCoinLuck + 15.0).toFixed(1)}%)
                  </div>
                </div>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-xs font-black text-amber-300 block">
                  {cost10.toLocaleString()} 코인
                </span>
                <span className="text-[10px] text-slate-400">10회 강화</span>
              </div>
            </button>

            {/* Max Upgrade */}
            <button
              onClick={() => handleUpgradeAction(maxAffordable)}
              disabled={maxAffordable === 0}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                maxAffordable > 0
                  ? 'border-emerald-500/70 bg-gradient-to-r from-emerald-500/15 to-slate-900 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)] text-slate-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-400/20 text-emerald-300">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200">
                    최대 가능 일괄 강화 ({maxAffordable}단계)
                  </div>
                  <div className="text-[11px] text-emerald-300 font-mono-num">
                    +{(maxAffordable * 1.5).toFixed(1)}% 추가 행운 획득
                  </div>
                </div>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-xs font-black text-amber-300 block">
                  {maxCost.toLocaleString()} 코인
                </span>
                <span className="text-[10px] text-slate-400">Max 강화</span>
              </div>
            </button>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 <span className="text-amber-300 font-bold">행운 보너스 안내:</span> 코인으로 올린 행운은 영구 지속되며, 소환 시 모든 등급(희귀, 에픽, 전설, 신화, 비밀, 신성, 경건한, 영원한, 천상, OG)의 획득 확률에 가산 배율로 반영됩니다.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
