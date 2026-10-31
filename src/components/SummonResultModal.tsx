import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  RotateCcw,
  Check,
  Flame,
  Trophy,
  FastForward,
  Play,
  Pause,
  Zap,
  Gem,
  Volume2,
  ChevronRight,
  Crown,
  Eye,
} from 'lucide-react';
import { PullResult } from '../utils/gachaEngine';
import { Rarity, GachaCard } from '../types/game';
import { RARITIES, RARITY_ORDER, RARITY_RATE_DISPLAY } from '../data/rarityConfig';
import { GACHA_CARDS } from '../data/cards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';

const HIGH_RARITIES: Rarity[] = [
  'OG',
  'CELESTIAL',
  'ETERNAL',
  'PIOUS',
  'DIVINE',
  'SECRET',
  'MYTHIC',
  'LEGENDARY',
];

interface SummonResultModalProps {
  results: PullResult[];
  onClose: () => void;
  onPullAgain: (count: number) => void;
  gems: number;
}

export const SummonResultModal: React.FC<SummonResultModalProps> = ({
  results,
  onClose,
  onPullAgain,
  gems,
}) => {
  // Mode: 'roulette' (spin card by card) or 'summary' (all cards view)
  const [viewMode, setViewMode] = useState<'roulette' | 'summary'>('roulette');

  // Roulette progression state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [revealedItems, setRevealedItems] = useState<PullResult[]>([]);
  const [hasLandedCurrent, setHasLandedCurrent] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<'normal' | 'fast'>('normal');

  // Reel DOM and positioning
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);
  const [reelTranslateX, setReelTranslateX] = useState<number>(0);
  const [transitionStyle, setTransitionStyle] = useState<string>('none');
  const [tickerTilted, setTickerTilted] = useState<boolean>(false);

  // Target card for current roulette step
  const currentResult = results[currentIndex] || results[0];
  const TARGET_INDEX = 24; // Index where winning card sits in the 30-card reel
  const CARD_WIDTH = 136; // px per card
  const CARD_GAP = 12; // px gap
  const CARD_STEP = CARD_WIDTH + CARD_GAP;

  // Measure container width for pixel-perfect centering
  useEffect(() => {
    const updateWidth = () => {
      if (reelContainerRef.current) {
        setContainerWidth(reelContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Generate roulette strip with target card fixed at TARGET_INDEX
  const reelCards = useMemo(() => {
    const strip: GachaCard[] = [];
    const pool = GACHA_CARDS;

    for (let i = 0; i < 30; i++) {
      if (i === TARGET_INDEX) {
        strip.push(currentResult.card);
      } else {
        const randCard = pool[Math.floor(Math.random() * pool.length)];
        strip.push(randCard);
      }
    }
    return strip;
  }, [currentIndex, currentResult.card]);

  // Execute a single roulette spin for currentIndex
  const startSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setHasLandedCurrent(false);

    // Reset reel to beginning without animation
    setTransitionStyle('none');
    setReelTranslateX(0);

    const spinDuration = spinSpeed === 'fast' ? 1000 : 1800;

    // Small timeout to allow browser to paint reset position
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Calculate exact center alignment
        // Center of target card: TARGET_INDEX * CARD_STEP + (CARD_WIDTH / 2)
        // Offset to align with center: Center - (containerWidth / 2)
        const targetCenter = TARGET_INDEX * CARD_STEP + CARD_WIDTH / 2;
        const finalOffset = targetCenter - containerWidth / 2;

        setTransitionStyle(
          `transform ${spinDuration}ms cubic-bezier(0.12, 0.85, 0.22, 1)`
        );
        setReelTranslateX(-finalOffset);

        // Schedule tick sounds during the spin
        const totalTicks = 22;
        const startTime = Date.now();

        const tickTimers: NodeJS.Timeout[] = [];
        for (let i = 1; i <= totalTicks; i++) {
          // Non-linear easing for ticks to decelerate with the wheel
          const progress = i / totalTicks;
          const delay = Math.pow(progress, 2.2) * (spinDuration - 80);

          const t = setTimeout(() => {
            sound.playTick(1.2 - progress * 0.4);
            setTickerTilted((prev) => !prev);
          }, delay);
          tickTimers.push(t);
        }

        // On spin complete
        setTimeout(() => {
          setIsSpinning(false);
          setHasLandedCurrent(true);
          sound.playWheelLock();

          // Play card reveal sound tuned to rarity
          sound.playReveal(currentResult.card.rarity);

          // Confetti for high tiers
          if (
            ['OG', 'CELESTIAL', 'ETERNAL', 'PIOUS', 'DIVINE', 'SECRET'].includes(
              currentResult.card.rarity
            )
          ) {
            confetti({
              particleCount: currentResult.card.rarity === 'OG' ? 180 : 90,
              spread: 90,
              origin: { y: 0.55 },
              colors: ['#38bdf8', '#facc15', '#e879f9', '#34d399', '#ffffff'],
            });
          }

          // Add to revealed list if not already added
          setRevealedItems((prev) => {
            if (prev.some((p) => p.rollIndex === currentResult.rollIndex)) return prev;
            return [...prev, currentResult];
          });
        }, spinDuration + 50);
      }, 50);
    });
  };

  // Start spinning on card change or on initial open
  useEffect(() => {
    if (viewMode === 'roulette') {
      startSpin();
    }
  }, [currentIndex, viewMode]);

  // Auto-advance to next card if enabled
  useEffect(() => {
    if (!autoAdvance || !hasLandedCurrent || isSpinning || viewMode !== 'roulette') {
      return;
    }

    const waitDelay = spinSpeed === 'fast' ? 600 : 1200;
    const timer = setTimeout(() => {
      if (currentIndex < results.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // All cards completed! Transition to summary
        setViewMode('summary');
      }
    }, waitDelay);

    return () => clearTimeout(timer);
  }, [hasLandedCurrent, autoAdvance, currentIndex, results.length, isSpinning, viewMode, spinSpeed]);

  // Skip roulette straight to summary
  const handleSkipToSummary = () => {
    setRevealedItems(results);
    setViewMode('summary');
    sound.playTap();
  };

  // Manual next card
  const handleNextCard = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setViewMode('summary');
    }
    sound.playTap();
  };

  // Check highest rarity in the batch for summary banners
  const hasOg = results.some((r) => r.card.rarity === 'OG');
  const hasCelestial = results.some((r) => r.card.rarity === 'CELESTIAL');
  const hasEternal = results.some((r) => r.card.rarity === 'ETERNAL');
  const hasDivine = results.some((r) => r.card.rarity === 'DIVINE');
  const hasPious = results.some((r) => r.card.rarity === 'PIOUS');
  const hasSecret = results.some((r) => r.card.rarity === 'SECRET');

  // Counts by rarity for summary
  const countsByRarity = results.reduce((acc, curr) => {
    acc[curr.card.rarity] = (acc[curr.card.rarity] || 0) + 1;
    return acc;
  }, {} as Record<Rarity, number>);

  const is100Pull = results.length >= 100;
  const is10Pull = results.length === 10;
  const isSingle = results.length === 1;

  const againCost = isSingle ? 100 : Math.round(results.length * 90);
  const canPullAgain = gems >= againCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>
                  {viewMode === 'roulette'
                    ? '🎰 운명의 룰렛 소환'
                    : isSingle
                    ? '소환 결과'
                    : is10Pull
                    ? '10회 소환 완료'
                    : `${results.length}회 대량 소환 통계`}
                </span>
                {viewMode === 'roulette' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono-num font-bold">
                    {currentIndex + 1} / {results.length}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'roulette' && results.length > 1 && (
              <button
                onClick={handleSkipToSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-400/30 transition-all cursor-pointer shadow-sm hover:scale-102"
                title="남은 룰렛 연출을 건너뛰고 전체 결과를 확인합니다"
              >
                <FastForward className="h-3.5 w-3.5" />
                <span>전체 즉시 확인</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: ROULETTE STAGE (룰렛처럼 돌다가 하나씩 등장하는 모드)        */}
        {/* ========================================================================= */}
        {viewMode === 'roulette' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Progress Bar for multi-pull */}
            {results.length > 1 && (
              <div className="w-full">
                <div className="flex justify-between items-center text-xs font-mono-num text-slate-400 mb-1.5">
                  <span className="font-bold text-sky-400">
                    소환 진행도 ({currentIndex + 1} / {results.length})
                  </span>
                  <span>{Math.round(((currentIndex + 1) / results.length) * 100)}% 완료</span>
                </div>
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / results.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* ROULETTE WHEEL REEL CASING */}
            <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] p-3 overflow-hidden">
              {/* Center Needle Pointers */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                <div
                  className={`w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] transition-transform duration-75 ${
                    tickerTilted ? 'rotate-[-8deg] scale-110' : 'rotate-0'
                  }`}
                />
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                <div
                  className={`w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[16px] border-b-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] transition-transform duration-75 ${
                    tickerTilted ? 'rotate-[8deg] scale-110' : 'rotate-0'
                  }`}
                />
              </div>

              {/* Vertical Laser Crosshair / Target Line */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400/90 via-sky-400/70 to-amber-400/90 shadow-[0_0_12px_rgba(251,191,36,1)] z-20 pointer-events-none" />

              {/* Vignette Shading on Left and Right Edges */}
              <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

              {/* Reel Viewport Container */}
              <div ref={reelContainerRef} className="w-full overflow-hidden py-3">
                <div
                  className="flex items-center"
                  style={{
                    transform: `translateX(${reelTranslateX}px)`,
                    transition: transitionStyle,
                    gap: `${CARD_GAP}px`,
                  }}
                >
                  {reelCards.map((card, idx) => {
                    const rarityConfig = RARITIES[card.rarity];
                    const isTargetCard = idx === TARGET_INDEX;
                    return (
                      <div
                        key={idx}
                        className={`shrink-0 flex flex-col items-center justify-between p-3 rounded-xl border bg-slate-900/95 transition-all duration-300 ${
                          rarityConfig.borderClass
                        } ${
                          isTargetCard && hasLandedCurrent
                            ? `scale-105 ${rarityConfig.glowClass} ring-2 ring-white/60 bg-gradient-to-b ${rarityConfig.gradient}`
                            : 'opacity-85'
                        }`}
                        style={{
                          width: `${CARD_WIDTH}px`,
                          height: '185px',
                        }}
                      >
                        {/* Top Rarity Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${rarityConfig.badgeBg}`}
                        >
                          {rarityConfig.nameKr}
                        </span>

                        {/* Card Icon & Glow */}
                        <div className="my-auto flex flex-col items-center">
                          <div
                            className={`p-3 rounded-xl ${
                              isTargetCard && hasLandedCurrent ? 'animate-bounce' : ''
                            }`}
                            style={{ color: card.themeHue }}
                          >
                            <Sparkles className="h-8 w-8" />
                          </div>
                          <span className="text-xs font-black text-slate-100 text-center line-clamp-1 mt-1">
                            {card.name}
                          </span>
                          <span className="text-[10px] text-slate-400 text-center line-clamp-1">
                            {card.title}
                          </span>
                        </div>

                        {/* Card Odds / CP */}
                        <div className="w-full pt-1.5 border-t border-slate-800 text-center">
                          <span className="text-[10px] font-mono-num text-slate-400">
                            {RARITY_RATE_DISPLAY[card.rarity]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REVEALED CARD SPOTLIGHT & GEMINI CELEBRATION */}
            {hasLandedCurrent && (
              <div className="animate-fade-in space-y-4">
                {/* Rarity Special Celebration Notice */}
                {currentResult.card.rarity === 'OG' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/30 via-emerald-400/30 to-amber-400/30 border-2 border-cyan-300 shadow-[0_0_35px_rgba(56,189,248,0.7)] text-center animate-pulse">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
                      ⚡ 0.00000000032% 궁극의 OG 등급 강림 ⚡
                    </span>
                    <h4 className="text-lg font-black text-white">
                      [OG] {currentResult.card.name} 획득!
                    </h4>
                  </div>
                )}

                {currentResult.card.rarity === 'CELESTIAL' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500/30 via-purple-500/30 to-indigo-500/30 border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(232,121,249,0.6)] text-center animate-pulse">
                    <span className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                      ✨ 0.00000001% 은하 천상(CELESTIAL) 강림 ✨
                    </span>
                    <h4 className="text-lg font-black text-white">
                      [천상] {currentResult.card.name} 획득!
                    </h4>
                  </div>
                )}

                {currentResult.card.rarity === 'ETERNAL' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/30 via-sky-500/30 to-blue-500/30 border-2 border-cyan-400 shadow-[0_0_25px_rgba(103,232,249,0.5)] text-center animate-pulse">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-200">
                      ❄️ 0.000005% 영원의 불멸(ETERNAL) 출현 ❄️
                    </span>
                    <h4 className="text-lg font-black text-white">
                      [영원한] {currentResult.card.name} 획득!
                    </h4>
                  </div>
                )}

                {currentResult.card.rarity === 'PIOUS' && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-200/20 via-orange-300/30 to-yellow-200/20 border-2 border-amber-200 shadow-[0_0_20px_rgba(254,215,170,0.4)] text-center animate-pulse">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
                      🕊️ 0.0001% 거룩한 은총(PIOUS) 강림 🕊️
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      [경건한] {currentResult.card.name} 획득!
                    </h4>
                  </div>
                )}

                {/* Divine Celebration */}
                {currentResult.card.rarity === 'DIVINE' && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-purple-500/20 border-2 border-amber-300 shadow-[0_0_35px_rgba(250,204,21,0.5)] text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                        ★ 0.05% 기적의 강림: 신성(DIVINE) ★
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white">
                      신성 영웅 [{currentResult.card.name}]이(가) 소환되었습니다!
                    </h4>

                    <div className="mt-2.5 p-3 rounded-lg bg-slate-950/70 border border-amber-400/40 text-xs text-amber-100 italic leading-relaxed text-left flex items-start gap-2.5">
                      <div>
                        <p>{currentResult.card.lore}</p>
                        <p className="mt-1.5 text-amber-400/80 font-bold not-italic">{currentResult.card.quote}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Lore & Status Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-black ${
                          RARITIES[currentResult.card.rarity].badgeBg
                        }`}
                      >
                        {RARITIES[currentResult.card.rarity].nameKr}
                      </span>
                      <span className="text-sm font-black text-slate-100">
                        {currentResult.card.name}
                      </span>
                      {currentResult.isNew ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950">
                          ✨ 도감 신규 등록!
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          중복 획득 ({currentResult.newStarLevel}★)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">
                      {currentResult.card.lore}
                    </p>
                  </div>

                  {/* Navigation Button for Next Card */}
                  <div className="flex items-center gap-2">
                    {currentIndex < results.length - 1 ? (
                      <button
                        onClick={handleNextCard}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md hover:scale-102"
                      >
                        <span>다음 카드 소환</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSkipToSummary}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-lg hover:scale-102 font-black"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>전체 소환 결과 확인</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM REVEALED TRAY: Shows cards revealed one by one */}
            {results.length > 1 && (
              <div className="mt-auto pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">
                    획득한 카드 목록 ({revealedItems.length} / {results.length}장 공개됨)
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Speed Toggle */}
                    <button
                      onClick={() =>
                        setSpinSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'))
                      }
                      className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      속도: {spinSpeed === 'normal' ? '1x (일반)' : '2x (빠름)'}
                    </button>

                    {/* Auto Next Toggle */}
                    <button
                      onClick={() => setAutoAdvance((prev) => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        autoAdvance
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {autoAdvance ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      <span>자동 넘김: {autoAdvance ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* Miniature Cards Scroller */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {revealedItems.map((res, i) => {
                    const cfg = RARITIES[res.card.rarity];
                    return (
                      <div
                        key={i}
                        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${cfg.borderClass} bg-slate-950/70 text-xs font-mono-num animate-fade-in`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.badgeBg}`} />
                        <span className="font-bold text-slate-200 text-[11px] truncate max-w-[90px]">
                          {res.card.name}
                        </span>
                        {res.isNew && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                            NEW
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {revealedItems.length === 0 && (
                    <span className="text-xs text-slate-500 py-1">
                      룰렛이 멈추면 카드가 차례대로 이곳에 등록됩니다...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: GRAND SUMMARY (전체 결과 요약)                               */}
        {/* ========================================================================= */}
        {viewMode === 'summary' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Top Celebrations for High Rarity in Batch */}
            {hasOg && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/30 via-emerald-400/30 to-amber-400/30 border-2 border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.7)] text-center animate-pulse">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  ⚡ 0.00000000032% (1/3,125억) 궁극의 원형 ⚡
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  전설의 OG(ORIGIN) 등급 카드가 강림했습니다!
                </h2>
              </div>
            )}

            {hasCelestial && !hasOg && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-fuchsia-500/30 via-purple-500/30 to-indigo-500/30 border-2 border-fuchsia-400 shadow-[0_0_35px_rgba(232,121,249,0.6)] text-center animate-pulse">
                <span className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                  ✨ 0.00000001% (1/100억) 은하 천상 강림 ✨
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  천상(CELESTIAL) 등급 영웅이 소환되었습니다!
                </h2>
              </div>
            )}

            {hasEternal && !hasOg && !hasCelestial && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/30 via-sky-500/30 to-blue-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(103,232,249,0.5)] text-center animate-pulse">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-200">
                  ❄️ 0.000005% (1/2,000만) 영원의 불멸 ❄️
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  영원한(ETERNAL) 등급 존재가 모습을 드러냈습니다!
                </h2>
              </div>
            )}

            {hasDivine && !hasOg && !hasCelestial && !hasEternal && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-purple-500/20 border-2 border-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.4)] text-center animate-pulse">
                <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                  ★ 0.05% 기적 강림 ★
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  신성(DIVINE) 등급 영웅이 소환되었습니다!
                </h2>
              </div>
            )}

            {hasPious && !hasOg && !hasCelestial && !hasEternal && !hasDivine && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-200/20 via-orange-300/30 to-yellow-200/20 border-2 border-amber-200 shadow-[0_0_25px_rgba(254,215,170,0.4)] text-center animate-pulse">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
                  🕊️ 0.0001% 거룩한 은총 🕊️
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  경건한(PIOUS) 등급 카드가 소환되었습니다!
                </h2>
              </div>
            )}

            {hasSecret && !hasOg && !hasCelestial && !hasEternal && !hasDivine && !hasPious && (
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.4)] text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  ◈ 1.0% 금기 발견 ◈
                </span>
                <h2 className="text-xl font-bold text-indigo-100 mt-0.5">
                  비밀(SECRET) 등급 카드가 모습을 드러냈습니다!
                </h2>
              </div>
            )}

            {/* SINGLE PULL SUMMARY */}
            {isSingle && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-56 sm:w-64">
                  <CardItem
                    card={results[0].card}
                    starLevel={results[0].newStarLevel}
                    isUnlocked={true}
                    showStats={true}
                  />
                </div>
                <div className="mt-4 text-center max-w-md">
                  {results[0].isNew ? (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ✨ 도감 신규 등록! ✨
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      중복 획득 (각성 성급: {results[0].newStarLevel}★)
                    </span>
                  )}
                  <p className="mt-3 text-xs italic text-slate-400">{results[0].card.lore}</p>
                  <p className="mt-1 text-xs text-amber-300/80 font-medium">{results[0].card.quote}</p>
                </div>
              </div>
            )}

            {/* 10-PULL SUMMARY GRID */}
            {is10Pull && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {results.map((res, idx) => (
                    <div key={idx} className="relative">
                      <CardItem
                        card={res.card}
                        starLevel={res.newStarLevel}
                        isUnlocked={true}
                        showStats={false}
                        compact={true}
                      />
                      {res.isNew && (
                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950 shadow-sm z-20">
                          NEW
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rarity Summary Strip */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2">
                  {RARITY_ORDER.map((rarity) => {
                    const count = countsByRarity[rarity] || 0;
                    if (count === 0) return null;
                    const config = RARITIES[rarity];
                    return (
                      <span
                        key={rarity}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono-num ${config.badgeBg}`}
                      >
                        {config.nameKr}: {count}개
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 100/1000 PULL RAPID STATISTICAL SUMMARY */}
            {is100Pull && (
              <div className="space-y-6">
                {/* 12 Rarity Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RARITY_ORDER.map((rarity) => {
                    const count = countsByRarity[rarity] || 0;
                    const config = RARITIES[rarity];
                    const percentage = ((count / results.length) * 100).toFixed(1);
                    return (
                      <div
                        key={rarity}
                        className={`p-3 rounded-xl border ${config.borderClass} bg-slate-950/60 flex items-center justify-between`}
                      >
                        <div>
                          <span className={`text-xs font-bold block ${config.textColor}`}>
                            {config.nameKr}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            목표: {RARITY_RATE_DISPLAY[rarity]}
                          </span>
                        </div>
                        <div className="text-right font-mono-num">
                          <span className="text-lg font-black text-slate-100 block">{count}개</span>
                          <span className="text-xs text-slate-400 block">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* High Rarity Spotlight */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    주요 획득 카드 (전설 이상)
                  </h4>
                  {results.filter((r) => HIGH_RARITIES.includes(r.card.rarity)).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {results
                        .filter((r) => HIGH_RARITIES.includes(r.card.rarity))
                        .map((res, idx) => (
                          <CardItem
                            key={idx}
                            card={res.card}
                            starLevel={res.newStarLevel}
                            isUnlocked={true}
                            showStats={false}
                            compact={true}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-3 text-center bg-slate-950/40 rounded-lg">
                      전설 이상 등급은 이번 회차에서 등장하지 않았습니다. (에픽 이하 획득)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400 font-mono-num">
            보유 다이아: <span className="font-bold text-sky-400">{gems.toLocaleString()}</span>개
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {viewMode === 'summary' && (
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setRevealedItems([]);
                  setViewMode('roulette');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                <span>룰렛 연출 다시보기</span>
              </button>
            )}

            <button
              onClick={() => {
                onPullAgain(results.length);
                setCurrentIndex(0);
                setRevealedItems([]);
                setViewMode('roulette');
              }}
              disabled={!canPullAgain}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                canPullAgain
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>
                다시 {results.length}회 룰렛 소환 ({againCost.toLocaleString()} 다이아)
              </span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
