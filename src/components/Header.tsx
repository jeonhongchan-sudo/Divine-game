import React from 'react';
import {
  Sparkles,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Plus,
  Compass,
  Layers,
  BookOpen,
  BarChart3,
  Trophy,
  TrendingUp,
  Key,
  ShoppingCart,
} from 'lucide-react';
import { formatLuck } from '../utils/gachaEngine';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'summon' | 'inventory' | 'codex' | 'stats' | 'achievements' | 'shop';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  gold: number;
  gems: number;
  totalGps: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onAddFreeGems: () => void;
  onGoldClick: () => void;
  onOpenLuckModal?: () => void;
  coinLuckBonus?: number;
  totalLuckBonus?: number;
  onOpenCodeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  gold,
  gems,
  totalGps,
  soundEnabled,
  onToggleSound,
  onAddFreeGems,
  onGoldClick,
  onOpenLuckModal,
  coinLuckBonus = 0,
  totalLuckBonus,
  onOpenCodeModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 p-0.5 shadow-md shadow-amber-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
          </div>
          <button
            onClick={() => onSelectTab('summon')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-cinzel text-lg font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
              DIVINE GACHA
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => onSelectTab('summon')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'summon'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>소환의 제단</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>배낭</span>
          </button>

          <button
            onClick={() => onSelectTab('codex')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'codex'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>수집 도감</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'stats'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>확률표 & 통계</span>
          </button>

          <button
            onClick={() => onSelectTab('achievements')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'achievements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>업적</span>
          </button>

          <button
            onClick={() => onSelectTab('shop')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'shop'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>코인 상점</span>
          </button>
        </nav>

        {/* Zone 3: Currencies & Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Gold meter */}
          <button
            onClick={onGoldClick}
            title="클릭하여 골드 획득! (+초당 자동 생성)"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-amber-500/30 rounded-lg hover:border-amber-400/60 transition-colors cursor-pointer group"
          >
            <Coins className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left font-mono-num leading-tight">
              <span className="text-xs font-bold text-amber-300 block">
                {gold.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                +{totalGps.toLocaleString()}/s
              </span>
            </div>
          </button>

          {/* Coin Luck Upgrade Shortcut */}
          {onOpenLuckModal && (
            <button
              onClick={onOpenLuckModal}
              title="코인으로 행운 올리기 / 초월 행운 확인"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-emerald-500/15 border border-amber-500/40 rounded-lg hover:border-amber-400 hover:shadow-sm text-xs font-bold text-amber-300 transition-all cursor-pointer group"
            >
              <TrendingUp className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>
                행운 +{totalLuckBonus ? formatLuck(totalLuckBonus) : `${coinLuckBonus}%`}
              </span>
            </button>
          )}

          {/* Diamonds (Gems) meter with +100,000,000/s (1억/초) indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-sky-500/40 rounded-lg shadow-sm">
            <Gem className="h-4 w-4 text-sky-400 animate-pulse" />
            <div className="text-left font-mono-num leading-tight">
              <span className="text-xs font-bold text-sky-300 block">
                {gems.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-black block tracking-tight">
                다이아 (+1/s)
              </span>
            </div>
          </div>

          {/* Free Diamond Refill Button */}
          <button
            onClick={onAddFreeGems}
            title="테스트용 다이아 +1,000개 즉시 무료 보충"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/50 rounded-lg hover:bg-emerald-900/60 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+1000 충전</span>
          </button>

          {/* Secret Code (Coupon) Button */}
          {onOpenCodeModal && (
            <button
              onClick={onOpenCodeModal}
              title="천상 등급 시크릿 코드 (998807) 입력"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-fuchsia-600/25 to-purple-600/25 border border-fuchsia-500/50 hover:border-fuchsia-400 rounded-lg text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200 shadow-sm transition-all cursor-pointer group shrink-0"
            >
              <Key className="h-3.5 w-3.5 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">시크릿 코드</span>
              <span className="sm:hidden">코드</span>
            </button>
          )}

          <PWAInstallButton />

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-2 py-1.5 gap-1 text-xs">
        <button
          onClick={() => onSelectTab('summon')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'summon'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          소환 제단
        </button>
        <button
          onClick={() => onSelectTab('inventory')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'inventory'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          배낭
        </button>
        <button
          onClick={() => onSelectTab('codex')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'codex'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          도감
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'stats'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          확률표/통계
        </button>
        <button
          onClick={() => onSelectTab('achievements')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'achievements'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          업적
        </button>
        <button
          onClick={() => onSelectTab('shop')}
          className={`px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-medium ${
            activeTab === 'shop'
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400'
          }`}
        >
          상점
        </button>
        {onOpenCodeModal && (
          <button
            onClick={onOpenCodeModal}
            className="px-3 py-1 rounded-md shrink-0 whitespace-nowrap font-bold text-fuchsia-300 bg-fuchsia-950/60 border border-fuchsia-500/40 flex items-center gap-1"
          >
            <Key className="h-3 w-3 text-fuchsia-400" />
            <span>쿠폰코드</span>
          </button>
        )}
      </div>
    </header>
  );
};
