import React from 'react';
import {
  BarChart3,
  X,
  Sparkles,
  Percent,
} from 'lucide-react';
import { GachaStats, RollEngineMode } from '../types/game';
import {
  RARITIES,
  RARITY_ORDER,
  TOTAL_NOMINAL_WEIGHT,
  RARITY_ODDS_TEXT,
  RARITY_RATE_DISPLAY,
} from '../data/rarityConfig';

interface ProbabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GachaStats;
  engineMode: RollEngineMode;
  onChangeEngineMode: (mode: RollEngineMode) => void;
}

export const ProbabilityModal: React.FC<ProbabilityModalProps> = ({
  isOpen,
  onClose,
  stats,
  engineMode,
  onChangeEngineMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              12단계 소환 공식 확률표 및 실시간 통계
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Roll Engine Mode Selector */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-slate-300">
                확률 판정 알고리즘 선택
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  onClick={() => onChangeEngineMode('waterfall')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    engineMode === 'waterfall'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  순차 판정 모드 (추천: 독립 확률 온전 보존)
                </button>
                <button
                  onClick={() => onChangeEngineMode('normalized')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    engineMode === 'normalized'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  가중치 정규화 모드
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {engineMode === 'waterfall'
                ? '순차 판정 모드: OG(0.00000000032%), 천상(0.00000001%), 영원한(0.000005%), 경건한(0.0001%), 신성(0.05%), 비밀(1%) 등 요청하신 고유 확률을 독립 추첨하여 정밀하게 보장합니다.'
                : `가중치 정규화 모드: 설정된 모든 확률의 총합(${TOTAL_NOMINAL_WEIGHT.toFixed(2)}%)을 100% 비율로 환산하여 단일 주사위 롤로 배분합니다.`}
            </p>
          </div>

          {/* Official Probabilities Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                12단계 전체 등급별 설정 확률 및 기대 배수
              </h4>
              <span className="text-xs font-mono-num text-slate-400">
                총 소환 횟수: <strong className="text-white">{stats.totalPulls.toLocaleString()}</strong>회
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">등급 (Rarity)</th>
                    <th className="py-2.5 px-3">설정 확률 (%)</th>
                    <th className="py-2.5 px-3">기대 등장 배수 (Odds)</th>
                    <th className="py-2.5 px-3">획득 횟수</th>
                    <th className="py-2.5 px-4 text-right">실제 출현율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {RARITY_ORDER.map((rarity) => {
                    const config = RARITIES[rarity];
                    const pulls = stats.pullsByRarity[rarity] || 0;
                    const realizedRate =
                      stats.totalPulls > 0
                        ? ((pulls / stats.totalPulls) * 100).toFixed(6)
                        : '0.000000';

                    return (
                      <tr key={rarity} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-4 font-sans font-bold flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] truncate max-w-[120px] ${config.badgeBg}`}>
                            {config.nameKr}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-bold">
                          {RARITY_RATE_DISPLAY[rarity]}
                        </td>
                        <td className="py-2.5 px-3 text-amber-300 font-semibold">
                          {RARITY_ODDS_TEXT[rarity]}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-semibold">
                          {pulls.toLocaleString()}회
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-sky-400">
                          {Number(realizedRate) > 0.001
                            ? `${Number(realizedRate).toFixed(2)}%`
                            : `${realizedRate}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pity & Guarantee Info */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              천장 보장 시스템 (Pity System)
            </h4>
            <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
              <li>
                <strong>신성(0.05%) 확정 천장</strong>: 연속 1,000,000회 동안 신성 등급이 소환되지 않을 경우 1,000,000회차에 신성 카드가 100% 확정 등장합니다.
              </li>
              <li>
                <strong>1초당 +1억 다이아 무제한 충전</strong> 시스템으로 1,000회 연속 소환 및 룰렛 소환을 막힘없이 즐기실 수 있습니다.
              </li>
            </ul>
          </div>
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
