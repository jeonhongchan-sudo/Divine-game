import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Play,
  Square,
  ShieldAlert,
  Flame,
  CheckCircle,
  Gem,
  BarChart3,
  ChevronRight,
  Coins,
  TrendingUp,
  Key,
} from 'lucide-react';
import { Rarity } from '../types/game';
import { RARITIES, RARITY_ORDER, RARITY_RATE_DISPLAY } from '../data/rarityConfig';
import { sound } from '../utils/audio';
import { formatLuck } from '../utils/gachaEngine';

interface SummonAltarProps {
  gems: number;
  gold: number;
  onPull: (count: number) => void;
  isRolling: boolean;
  autoRollActive: boolean;
  onToggleAutoRoll: () => void;
  stopOnHighRarity: boolean;
  onToggleStopOnHighRarity: () => void;
  fastSkip: boolean;
  onToggleFastSkip: () => void;
  pityCount: number;
  totalLuckBonus: number;
  coinLuckLevel: number;
  coinLuckBonus: number;
  onOpenLuckModal: () => void;
  onQuickUpgradeLuck: (times: number) => void;
  recentHighTierPulls: Array<{ name: string; rarity: Rarity; time: string }>;
  onOpenRates: () => void;
  onOpenCodeModal?: () => void;
}

export const SummonAltar: React.FC<SummonAltarProps> = ({
  gems,
  gold,
  onPull,
  isRolling,
  autoRollActive,
  onToggleAutoRoll,
  stopOnHighRarity,
  onToggleStopOnHighRarity,
  fastSkip,
  onToggleFastSkip,
  pityCount,
  totalLuckBonus,
  coinLuckLevel,
  coinLuckBonus,
  onOpenLuckModal,
  onQuickUpgradeLuck,
  recentHighTierPulls,
  onOpenRates,
  onOpenCodeModal,
}) => {
  const [orbPulse, setOrbPulse] = useState(false);
  const nextLuckCost = Math.round(1000 * Math.pow(1.12, coinLuckLevel));

  const handleOrbClick = () => {
    setOrbPulse(true);
    sound.playSummonOrb();
    setTimeout(() => setOrbPulse(false), 500);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-5xl mx-auto">
      {/* Top probability strip banner highlighting the user's exact rates */}
      <div className="w-full mb-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 backdrop-blur-md shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <h2 className="text-sm font-bold text-slate-200">
              확정 설정 확률 (가차 공식 확률표)
            </h2>
          </div>
          <button
            onClick={onOpenRates}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>상세 확률표 및 통계 확인</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 12 Rarity Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-1.5 mt-3 text-center">
          {RARITY_ORDER.map((rarity) => {
            const config = RARITIES[rarity];
            return (
              <div
                key={rarity}
                className={`p-1.5 rounded-lg border ${config.borderClass} bg-slate-950/60`}
              >
                <span className={`block text-[10px] font-bold truncate ${config.textColor}`}>
                  {config.nameKr}
                </span>
                <span className="font-mono-num text-[11px] font-black text-slate-100 truncate block">
                  {RARITY_RATE_DISPLAY[rarity]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Altar / Sphere Area */}
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center my-4 py-8">
        {/* Background glow discs */}
        <div className="absolute h-80 w-80 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Orbiting particle ring */}
        <div
          className={`relative flex items-center justify-center h-64 w-64 rounded-full border border-amber-500/30 transition-all duration-700 ${
            orbPulse || isRolling ? 'scale-105 border-amber-400/80' : ''
          }`}
        >
          {/* Outer dashed ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/30 animate-[spin_25s_linear_infinite]" />
          {/* Inner reverse spin ring */}
          <div className="absolute inset-4 rounded-full border border-rose-400/25 animate-[spin_18s_linear_infinite_reverse]" />

          {/* Central Summon Orb */}
          <button
            onClick={handleOrbClick}
            className={`group relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-300/70 shadow-[0_0_50px_rgba(251,191,36,0.35)] transition-all duration-300 cursor-pointer hover:shadow-[0_0_70px_rgba(251,191,36,0.6)] ${
              isRolling ? 'animate-pulse scale-95 ring-4 ring-amber-400' : ''
            }`}
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <Sparkles className="h-16 w-16 text-amber-300 transition-transform duration-300 group-hover:scale-110" />

            <span className="absolute bottom-4 text-[10px] font-bold text-amber-200/80 tracking-wider">
              {isRolling ? '소환 중...' : '신성의 구체'}
            </span>
          </button>
        </div>

        {/* Altar Pedestal Base */}
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full mb-3" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            신성과 천상의 차원 소환문
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            12단계 등급의 영웅과 보구를 소환하세요. 0.001%의 전설 OG 등급과 0.05% 신성 카드가 강림합니다.
          </p>

          {/* Pity & Luck indicators */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-mono-num text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-500">신성 보장 천장:</span>
              <span className="font-bold text-amber-300">
                {Math.max(0, 1000000 - pityCount).toLocaleString()}회 남음 (100만 회)
              </span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-500">총합 소환 행운:</span>
              <span className={`font-bold ${totalLuckBonus >= 1e20 ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300 animate-pulse' : 'text-emerald-400'}`}>
                +{formatLuck(totalLuckBonus)}
              </span>
            </span>
          </div>

          {totalLuckBonus >= 1e20 && (
            <div className="mt-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-fuchsia-500/20 to-indigo-500/20 border border-amber-400/50 flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-black text-amber-200 tracking-wide">
                우주적 초월 행운 1,000,000,000,000,000,000,000,000% (10²⁴) 가동 중!
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black">
                OG·천상 등급 극대화
              </span>
            </div>
          )}

          {/* Interactive Coin Luck Upgrade Section */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={onOpenLuckModal}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/50 hover:border-amber-400 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <Coins className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>코인으로 행운 올리기</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-num font-black">
                Lv.{coinLuckLevel} (+{coinLuckBonus}%)
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => onQuickUpgradeLuck(1)}
              disabled={gold < nextLuckCost}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer font-mono-num ${
                gold >= nextLuckCost
                  ? 'border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              title="보유 코인으로 행운 1단계를 즉시 강화합니다"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>1회 즉시 강화 ({nextLuckCost.toLocaleString()} 코인)</span>
            </button>

            {onOpenCodeModal && (
              <button
                onClick={onOpenCodeModal}
                className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600/20 via-slate-900 to-purple-600/20 border border-fuchsia-500/50 hover:border-fuchsia-400 text-xs font-bold text-fuchsia-300 transition-all cursor-pointer shadow-md hover:scale-102"
                title="천상(CELESTIAL) 등급 획득 시크릿 코드 입력"
              >
                <Key className="h-3.5 w-3.5 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
                <span>천상 시크릿 코드 [998807]</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summon Action Buttons Strip */}
      <div className="w-full max-w-4xl mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1x Pull */}
        <button
          onClick={() => onPull(1)}
          disabled={isRolling || gems < 100}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-500 transition-all text-slate-200 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-xs sm:text-sm font-bold text-slate-100 mb-1">
            1회 소환
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono-num text-sky-300">
            <Gem className="h-3 w-3 text-sky-400" />
            <span>100 다이아</span>
          </div>
        </button>

        {/* 10x Pull (Discounted) */}
        <button
          onClick={() => onPull(10)}
          disabled={isRolling || gems < 900}
          className={`relative group flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-amber-500/70 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 shadow-sm">
            10% 할인
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-200 mb-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            10회 연속
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono-num text-amber-300">
            <Gem className="h-3 w-3 text-sky-400" />
            <span className="font-bold">900 다이아</span>
          </div>
        </button>

        {/* 100x Mega Pull */}
        <button
          onClick={() => onPull(100)}
          disabled={isRolling || gems < 9000}
          className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border border-rose-500/60 bg-gradient-to-b from-rose-950/30 via-slate-900 to-slate-950 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-sm">
            고속
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-rose-200 mb-1 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            100회 대량
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono-num text-rose-300">
            <Gem className="h-3 w-3 text-sky-400" />
            <span className="font-bold">9,000 다이아</span>
          </div>
        </button>

        {/* 1,000x Ultra Pull */}
        <button
          onClick={() => onPull(1000)}
          disabled={isRolling || gems < 90000}
          className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-cyan-400/80 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all cursor-pointer shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 shadow-sm animate-pulse">
            OG/천상 정조준
          </span>
          <span className="text-xs sm:text-sm font-black text-cyan-200 mb-1 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-cyan-300" />
            1,000회 폭풍
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono-num text-cyan-300">
            <Gem className="h-3 w-3 text-sky-400" />
            <span className="font-bold">90,000 다이아</span>
          </div>
        </button>
      </div>

      {/* Auto Roll & Options Bar */}
      <div className="w-full max-w-3xl mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          {/* Auto Roll Button */}
          <button
            onClick={onToggleAutoRoll}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              autoRollActive
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {autoRollActive ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>자동 소환 중지</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>자동 소환 시작</span>
              </>
            )}
          </button>

          {/* Stop on high tier toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={stopOnHighRarity}
              onChange={onToggleStopOnHighRarity}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>상위 등급(신화~OG) 획득 시 멈춤</span>
          </label>
        </div>

        {/* Fast skip toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={fastSkip}
            onChange={onToggleFastSkip}
            className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
          <span>애니메이션 즉시 스킵</span>
        </label>
      </div>

      {/* Live Recent High-Tier Pulls Ticker */}
      {recentHighTierPulls.length > 0 && (
        <div className="w-full max-w-3xl mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>최근 상위 등급 획득 로그</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {recentHighTierPulls.slice(0, 5).map((log, index) => {
              const rarityConfig = RARITIES[log.rarity];
              return (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800"
                >
                  <span
                    className={`text-[10px] font-bold px-1 rounded ${rarityConfig.badgeBg}`}
                  >
                    {rarityConfig.nameKr}
                  </span>
                  <span className="font-semibold text-slate-200">{log.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono-num">
                    {log.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
