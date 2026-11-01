import React, { useState, useEffect } from 'react';
import { ShopState, ShopItem } from '../types/game';
import { ShoppingCart, Clock, Gem, Coins, TrendingUp, Lock, CheckCircle2, Compass, Hourglass, Trophy, Sun, Crown, Flame, Wand2, Box } from 'lucide-react';
import { CARDS_MAP } from '../data/cards';
import { RELICS_MAP } from '../data/relics';
import { RARITIES } from '../data/rarityConfig';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';

interface ShopViewProps {
  shopState: ShopState;
  gold: number;
  onBuy: (itemId: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ shopState, gold, onBuy }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const diff = shopState.nextRestockAt - Date.now();
      if (diff <= 0) {
        setTimeLeft('새 상품이 곧 입고됩니다...');
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}분 ${secs}초 후 제입고`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shopState.nextRestockAt]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      {/* Shop Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShoppingCart className="w-48 h-48 text-amber-400 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <Coins className="w-3.5 h-3.5" />
              <span>프리미엄 코인 상점</span>
            </div>
            <h1 className="text-3xl font-black text-slate-100 font-cinzel tracking-tight">
              SECRET COIN SHOP
            </h1>
            <p className="text-sm text-slate-400 max-w-md">
              매 5분마다 무작위 희귀 카드와 소환에 필요한 필수 자원들이 새롭게 입고됩니다. 
              코인을 모아 전설적인 영웅을 직접 영입하세요.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono-num">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{timeLeft}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-black">{gold.toLocaleString()} 코인 보유 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {shopState.items.map((item) => {
          const isAffordable = gold >= item.cost;
          const card = item.type === 'card' && item.cardId ? CARDS_MAP[item.cardId] : null;
          const relic = item.type === 'relic' && item.relicId ? RELICS_MAP[item.relicId] : null;
          const rarity = card ? RARITIES[card.rarity] : relic ? RARITIES[relic.rarity] : null;

          const RelicIcon = relic ? (() => {
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
          })() : null;

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-2xl bg-slate-900 border transition-all duration-300 overflow-hidden ${
                item.isSoldOut 
                  ? 'border-slate-800 grayscale' 
                  : 'border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10'
              }`}
            >
              {/* Item Preview */}
              <div className="p-4 flex-1">
                {item.type === 'card' && card && (
                  <div className="scale-90 origin-top mb-2">
                    <CardItem card={card} isUnlocked={true} compact={true} />
                  </div>
                )}

                {item.type === 'resource' && (
                  <div className="h-40 flex flex-col items-center justify-center gap-3 bg-slate-950/50 rounded-xl mb-4 border border-slate-800/50">
                    <div className="p-4 rounded-full bg-sky-500/10 border border-sky-500/20">
                      <Gem className="w-12 h-12 text-sky-400 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-slate-100">{item.amount?.toLocaleString()}개</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">다이아 패키지</p>
                    </div>
                  </div>
                )}

                {item.type === 'luck' && (
                  <div className="h-40 flex flex-col items-center justify-center gap-3 bg-slate-950/50 rounded-xl mb-4 border border-slate-800/50">
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <TrendingUp className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-slate-100">+{item.amount}%</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">영구 행운 강화</p>
                    </div>
                  </div>
                )}

                {item.type === 'relic' && relic && (
                  <div className="h-40 flex flex-col items-center justify-center gap-3 bg-slate-950/50 rounded-xl mb-4 border border-slate-800/50">
                    <div className={`p-4 rounded-full bg-opacity-10 border bg-current border-current ${rarity?.textColor}`}>
                      {RelicIcon && <RelicIcon className="w-12 h-12" />}
                    </div>
                    <div className="text-center px-2">
                      <span className={`text-xs font-black uppercase tracking-tighter ${rarity?.textColor}`}>{rarity?.nameKr} 유물</span>
                      <p className="text-[10px] text-emerald-400 font-bold mt-1">{relic.effect}</p>
                    </div>
                  </div>
                )}

                {item.type === 'lucky_block' && (
                  <div className="h-40 flex flex-col items-center justify-center gap-3 bg-slate-950/50 rounded-xl mb-4 border border-slate-800/50">
                    <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Box className="w-12 h-12 text-amber-400 animate-bounce" />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-amber-400">럭키 블럭</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">무작위 대박 보상</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">
                    {item.type === 'card' && card ? card.name : 
                     item.type === 'resource' ? `${item.amount?.toLocaleString()} 다이아` : 
                     item.type === 'relic' && relic ? relic.name :
                     item.type === 'lucky_block' ? '미지의 럭키 블럭' :
                     `행운 보너스 +${item.amount}%`}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {item.type === 'card' && card ? card.title : 
                     item.type === 'resource' ? '소환에 필요한 다이아몬드 꾸러미' : 
                     item.type === 'relic' && relic ? relic.description :
                     item.type === 'lucky_block' ? '배낭에 보관되며, 언제든 개봉하여 대박 보상을 노릴 수 있습니다.' :
                     '영구적으로 소환 행운 수치를 높입니다.'}
                  </p>
                </div>
              </div>

              {/* Purchase Footer */}
              <div className={`p-4 border-t ${item.isSoldOut ? 'border-slate-800 bg-slate-950/50' : 'border-slate-800 bg-slate-900/50'}`}>
                <button
                  onClick={() => {
                    if (!item.isSoldOut && isAffordable) {
                      onBuy(item.id);
                    } else if (!isAffordable) {
                      sound.playError();
                    }
                  }
                  }
                  disabled={item.isSoldOut}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    item.isSoldOut 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isAffordable
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  {item.isSoldOut ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>품절됨</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.cost.toLocaleString()} 코인 구매</span>
                    </>
                  )}
                </button>
                {!item.isSoldOut && !isAffordable && (
                  <p className="text-[10px] text-rose-400 font-bold text-center mt-2">
                    코인이 부족합니다 ({(item.cost - gold).toLocaleString()} 더 필요)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 py-4 italic">
        <Lock className="w-3 h-3" />
        <span>모든 구매 상품은 즉시 보관함에 지급되며 환불이 불가능합니다.</span>
      </div>
    </div>
  );
};
