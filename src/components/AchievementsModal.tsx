import React from 'react';
import { Trophy, CheckCircle2, Gem, Coins, X } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClaimReward: (id: string) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClaimReward,
  onClose,
}) => {
  const completedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              업적 및 보상 ({completedCount}/{achievements.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {achievements.map((ach) => {
            const isCompleted = ach.progress >= ach.maxProgress;
            const canClaim = isCompleted && !ach.isUnlocked;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  ach.isUnlocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : canClaim
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">{ach.title}</h4>
                    {ach.isUnlocked && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        완료됨
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.desc}</p>

                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (ach.progress / ach.maxProgress) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono-num text-slate-400">
                      {ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Reward & Button */}
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-mono-num">
                    <div className="flex items-center justify-end gap-1 text-sky-400 font-bold">
                      <Gem className="h-3.5 w-3.5" />
                      <span>+{ach.rewardGems.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
                      <Coins className="h-3.5 w-3.5" />
                      <span>+{ach.rewardGold.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onClaimReward(ach.id)}
                    disabled={!canClaim}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      canClaim
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md animate-bounce'
                        : ach.isUnlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {ach.isUnlocked ? '수령 완료' : canClaim ? '보상 수령' : '진행 중'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
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
