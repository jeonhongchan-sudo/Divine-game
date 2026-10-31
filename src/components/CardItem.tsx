import React from 'react';
import { GachaCard, Rarity } from '../types/game';
import { RARITIES } from '../data/rarityConfig';
import {
  Sparkles,
  Clock,
  Flame,
  Crown,
  Binary,
  Eye,
  Ghost,
  Music,
  Zap,
  Scale,
  Snowflake,
  Shield,
  Wand2,
  Sword,
  Leaf,
  Target,
  FlaskConical,
  Compass,
  Circle,
  Bell,
  Star,
  Swords,
  Coins,
} from 'lucide-react';

interface CardItemProps {
  card: GachaCard;
  count?: number;
  starLevel?: number;
  isUnlocked?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  compact?: boolean;
  isHighlighted?: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Sparkles,
  Clock,
  Flame,
  Crown,
  Binary,
  Eye,
  Ghost,
  Music,
  Zap,
  Scale,
  Snowflake,
  Shield,
  Wand2,
  Sword,
  Leaf,
  Target,
  FlaskConical,
  Compass,
  Circle,
  Bell,
};

export const CardItem: React.FC<CardItemProps> = ({
  card,
  count = 1,
  starLevel = 1,
  isUnlocked = true,
  onClick,
  showStats = true,
  compact = false,
  isHighlighted = false,
}) => {
  const rarityConfig = RARITIES[card.rarity];
  const IconComponent = ICON_MAP[card.iconType] || Sparkles;

  // Multiplier from star level (each star adds 25% power)
  const starMultiplier = 1 + (starLevel - 1) * 0.25;
  const currentCP = Math.round(card.combatPower * starMultiplier);
  const currentGPS = Math.round(card.goldPerSec * starMultiplier);

  // Special effects for apex & high tiers
  const isOg = card.rarity === 'OG';
  const isCelestial = card.rarity === 'CELESTIAL';
  const isEternal = card.rarity === 'ETERNAL';
  const isDivine = card.rarity === 'DIVINE';
  const isPious = card.rarity === 'PIOUS';
  const isSecret = card.rarity === 'SECRET';
  const isMythic = card.rarity === 'MYTHIC';

  if (!isUnlocked) {
    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center transition-all ${
          onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900' : ''
        } ${compact ? 'min-h-[140px]' : 'min-h-[220px]'}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-600 mb-2">
          <HelpCircleIcon className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500">미발견 카드</p>
        <span className={`text-[11px] font-medium mt-1 ${rarityConfig.textColor}`}>
          [{rarityConfig.nameKr}]
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-b ${rarityConfig.gradient} ${
        rarityConfig.borderClass
      } p-3 transition-all duration-200 select-none ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''
      } ${
        isOg
          ? 'animate-pulse ring-2 ring-cyan-300 shadow-[0_0_35px_rgba(56,189,248,0.7)]'
          : isCelestial
          ? 'ring-2 ring-fuchsia-400 shadow-[0_0_25px_rgba(232,121,249,0.6)]'
          : isEternal
          ? 'ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.5)]'
          : isDivine
          ? 'animate-divine-shimmer ring-2 ring-amber-300/80'
          : isPious
          ? 'ring-1 ring-amber-200 shadow-[0_0_15px_rgba(254,215,170,0.4)]'
          : isSecret
          ? 'animate-secret'
          : ''
      } ${compact ? 'p-2' : 'p-3.5'}`}
      style={{
        boxShadow: isHighlighted ? `0 0 25px ${rarityConfig.color}` : undefined,
      }}
    >
      {/* OG cyber matrix scanline overlay */}
      {isOg && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px] opacity-30" />
      )}

      {/* Celestial nebula starry overlay */}
      {isCelestial && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-400/20 via-purple-500/10 to-transparent opacity-80" />
      )}

      {/* Divine celestial rays background overlay */}
      {isDivine && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent opacity-80" />
      )}

      {/* Secret void interference scanline */}
      {isSecret && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.06)_1px,transparent_1px)] bg-[size:100%_4px]" />
      )}

      {/* Top row: Rarity badge & Element & Count */}
      <div className="relative z-10 flex items-center justify-between gap-1 text-xs mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-tight whitespace-nowrap shrink-0 shadow-sm ${rarityConfig.badgeBg}`}
        >
          {rarityConfig.nameKr}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-slate-300 font-medium px-1.5 py-0.2 rounded bg-black/40 border border-white/10">
            {card.element}
          </span>
          {count > 1 && (
            <span className="font-mono-num text-[11px] font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40">
              x{count}
            </span>
          )}
        </div>
      </div>

      {/* Card Visual / Emblem */}
      <div className="relative z-10 my-1 flex flex-col items-center justify-center">
        <div
          className={`relative flex items-center justify-center rounded-xl bg-slate-950/70 border border-white/10 shadow-inner transition-transform group-hover:scale-105 ${
            compact ? 'h-14 w-14' : 'h-20 w-20'
          }`}
          style={{ borderColor: `${rarityConfig.color}60` }}
        >
          {/* Pulsing ring for high tiers */}
          {(isDivine || isMythic || isSecret) && (
            <div
              className="absolute inset-0 rounded-xl opacity-30 animate-ping"
              style={{ backgroundColor: rarityConfig.color }}
            />
          )}

          <IconComponent
            className={`${compact ? 'h-7 w-7' : 'h-10 w-10'}`}
            style={{ color: rarityConfig.color }}
          />

          {isDivine && (
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-200 animate-spin" />
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < starLevel
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-800 text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Info */}
      <div className="relative z-10 mt-1.5 text-center">
        <p className="text-[11px] font-medium text-slate-400 truncate tracking-tight">
          {card.title}
        </p>
        <h4 className="text-sm font-bold text-slate-100 truncate tracking-tight">
          {card.name}
        </h4>

        {/* Stats strip */}
        {showStats && !compact && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-around text-[11px] font-mono-num text-slate-300">
            <div className="flex items-center gap-1" title="전투력 (CP)">
              <Swords className="h-3 w-3 text-rose-400" />
              <span>{currentCP.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title="초당 골드 (GPS)">
              <Coins className="h-3 w-3 text-amber-400" />
              <span>+{currentGPS}/s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HelpCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);
