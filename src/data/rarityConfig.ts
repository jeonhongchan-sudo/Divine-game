import { Rarity, RarityConfig } from '../types/game';

// Rates requested:
// OG: 0.00000000032% (1 / 312,500,000,000)
// 천상: 0.00000001% (1 / 10,000,000,000)
// 영원한: 0.000005% (1 / 20,000,000)
// 경건한: 0.0001% (1 / 1,000,000)
// 신성: 0.05% (1 / 2,000)
// 비밀: 1.0% (1 / 100)
// 신화적인: 6.5%
// 전설: 16.0%
// 에픽: 21.0%
// 레어: 29.0%
// 드문: 36.0%
// 일반: 45.0%

export const TOTAL_NOMINAL_WEIGHT =
  0.00000000032 +
  0.00000001 +
  0.000005 +
  0.0001 +
  0.05 +
  1.0 +
  6.5 +
  16.0 +
  21.0 +
  29.0 +
  36.0 +
  45.0; // ~154.55010501032

export const RARITY_ORDER: Rarity[] = [
  'OG',
  'CELESTIAL',
  'ETERNAL',
  'PIOUS',
  'DIVINE',
  'SECRET',
  'MYTHIC',
  'LEGENDARY',
  'EPIC',
  'RARE',
  'UNCOMMON',
  'COMMON',
];

export const RARITY_ODDS_TEXT: Record<Rarity, string> = {
  OG: '1 / 3,125억',
  CELESTIAL: '1 / 100억',
  ETERNAL: '1 / 2,000만',
  PIOUS: '1 / 100만',
  DIVINE: '1 / 2,000',
  SECRET: '1 / 100',
  MYTHIC: '1 / 15.4',
  LEGENDARY: '1 / 6.25',
  EPIC: '1 / 4.76',
  RARE: '1 / 3.45',
  UNCOMMON: '1 / 2.78',
  COMMON: '1 / 2.22',
};

export const RARITY_RATE_DISPLAY: Record<Rarity, string> = {
  OG: '0.00000000032%',
  CELESTIAL: '0.00000001%',
  ETERNAL: '0.000005%',
  PIOUS: '0.0001%',
  DIVINE: '0.05%',
  SECRET: '1.0%',
  MYTHIC: '6.5%',
  LEGENDARY: '16.0%',
  EPIC: '21.0%',
  RARE: '29.0%',
  UNCOMMON: '36.0%',
  COMMON: '45.0%',
};

export const RARITIES: Record<Rarity, RarityConfig> = {
  OG: {
    id: 'OG',
    nameKr: 'OG',
    nominalRate: 0.00000000032,
    normalizedRate: (0.00000000032 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#38bdf8',
    badgeBg: 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 text-slate-950 font-black tracking-widest border border-white',
    borderClass: 'border-2 border-cyan-300 shadow-[0_0_45px_rgba(56,189,248,0.8)] ring-2 ring-emerald-300',
    glowClass: 'shadow-[0_0_50px_rgba(56,189,248,0.9)]',
    textColor: 'text-cyan-300 font-black',
    gradient: 'from-cyan-950/60 via-emerald-950/50 to-slate-950',
    description: '0.00000000032% (1/3,125억) 확률의 우주 정점 궁극의 오리지널 원형.',
  },
  CELESTIAL: {
    id: 'CELESTIAL',
    nameKr: '천상',
    nominalRate: 0.00000001,
    normalizedRate: (0.00000001 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#e879f9',
    badgeBg: 'bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 text-slate-950 font-black',
    borderClass: 'border-2 border-fuchsia-400 shadow-[0_0_35px_rgba(232,121,249,0.7)] ring-1 ring-purple-300/60',
    glowClass: 'shadow-[0_0_40px_rgba(232,121,249,0.7)]',
    textColor: 'text-fuchsia-300 font-extrabold',
    gradient: 'from-fuchsia-950/50 via-purple-900/40 to-slate-950',
    description: '0.00000001% (1/100억) 확률. 은하 성좌를 다스리는 천상계의 절대 군주들.',
  },
  ETERNAL: {
    id: 'ETERNAL',
    nameKr: '영원한',
    nominalRate: 0.000005,
    normalizedRate: (0.000005 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#67e8f9',
    badgeBg: 'bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 text-slate-950 font-black',
    borderClass: 'border-2 border-cyan-400 shadow-[0_0_30px_rgba(103,232,249,0.6)] ring-1 ring-cyan-200',
    glowClass: 'shadow-[0_0_35px_rgba(103,232,249,0.6)]',
    textColor: 'text-cyan-200 font-extrabold',
    gradient: 'from-cyan-950/50 via-sky-950/40 to-slate-950',
    description: '0.000005% (1/2,000만) 확률. 시간의 흐름을 멈춘 영겁의 불멸자들.',
  },
  PIOUS: {
    id: 'PIOUS',
    nameKr: '경건한',
    nominalRate: 0.0001,
    normalizedRate: (0.0001 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#fed7aa',
    badgeBg: 'bg-gradient-to-r from-amber-100 via-orange-200 to-yellow-100 text-slate-950 font-extrabold border border-amber-300',
    borderClass: 'border-2 border-amber-200/90 shadow-[0_0_25px_rgba(254,215,170,0.6)]',
    glowClass: 'shadow-[0_0_25px_rgba(254,215,170,0.6)]',
    textColor: 'text-amber-200 font-bold',
    gradient: 'from-amber-950/40 via-orange-950/30 to-slate-950',
    description: '0.0001% (1/100만) 확률. 지고한 신앙과 숭고한 헌신이 빚어낸 성스러운 기적.',
  },
  DIVINE: {
    id: 'DIVINE',
    nameKr: '신성',
    nominalRate: 0.05,
    normalizedRate: (0.05 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#facc15',
    badgeBg: 'bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 text-slate-950 font-black',
    borderClass: 'border-2 border-amber-300 shadow-[0_0_35px_rgba(250,204,21,0.6)] ring-2 ring-white/50',
    glowClass: 'shadow-[0_0_40px_rgba(253,224,71,0.7)]',
    textColor: 'text-amber-300 font-extrabold',
    gradient: 'from-amber-500/20 via-yellow-300/30 to-purple-500/20',
    description: '0.05% (1/2,000) 확률. 우주를 초월한 전지전능의 창조 영역.',
  },
  SECRET: {
    id: 'SECRET',
    nameKr: '비밀',
    nominalRate: 1.0,
    normalizedRate: (1.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#818cf8',
    badgeBg: 'bg-indigo-950 text-indigo-200 border border-indigo-400 font-bold',
    borderClass: 'border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)]',
    glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.6)]',
    textColor: 'text-indigo-300 font-bold',
    gradient: 'from-indigo-900/40 via-purple-950/40 to-slate-950',
    description: '1.0% (1/100) 확률. 차원 왜곡 뒤편에 감춰진 미지의 금기 영역.',
  },
  MYTHIC: {
    id: 'MYTHIC',
    nameKr: '신화적인',
    nominalRate: 6.5,
    normalizedRate: (6.5 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#f43f5e',
    badgeBg: 'bg-rose-950 text-rose-200 border border-rose-500 font-bold',
    borderClass: 'border border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.45)]',
    glowClass: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    textColor: 'text-rose-400 font-bold',
    gradient: 'from-rose-950/40 via-red-900/30 to-slate-900',
    description: '6.5% 확률. 고대 서사시 속에만 전해지는 불멸의 존재들.',
  },
  LEGENDARY: {
    id: 'LEGENDARY',
    nameKr: '전설',
    nominalRate: 16.0,
    normalizedRate: (16.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#f59e0b',
    badgeBg: 'bg-amber-950 text-amber-200 border border-amber-500 font-bold',
    borderClass: 'border border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    textColor: 'text-amber-400 font-bold',
    gradient: 'from-amber-950/40 via-yellow-900/20 to-slate-900',
    description: '16.0% 확률. 대륙 전역에 명성을 떨치는 황금빛 영웅과 보구.',
  },
  EPIC: {
    id: 'EPIC',
    nameKr: '에픽',
    nominalRate: 21.0,
    normalizedRate: (21.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#a855f7',
    badgeBg: 'bg-purple-950 text-purple-200 border border-purple-500/60',
    borderClass: 'border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
    glowClass: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    textColor: 'text-purple-400 font-semibold',
    gradient: 'from-purple-950/30 to-slate-900',
    description: '21.0% 확률. 강력한 마력과 정수를 품은 비범한 존재들.',
  },
  RARE: {
    id: 'RARE',
    nameKr: '레어',
    nominalRate: 29.0,
    normalizedRate: (29.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#0ea5e9',
    badgeBg: 'bg-sky-950 text-sky-200 border border-sky-500/50',
    borderClass: 'border border-sky-500/40 shadow-[0_0_8px_rgba(14,165,233,0.2)]',
    glowClass: 'shadow-[0_0_8px_rgba(14,165,233,0.25)]',
    textColor: 'text-sky-400 font-semibold',
    gradient: 'from-sky-950/30 to-slate-900',
    description: '29.0% 확률. 숙련된 실력과 희소성을 지닌 존재들.',
  },
  UNCOMMON: {
    id: 'UNCOMMON',
    nameKr: '드문',
    nominalRate: 36.0,
    normalizedRate: (36.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#10b981',
    badgeBg: 'bg-emerald-950 text-emerald-200 border border-emerald-600/40',
    borderClass: 'border border-emerald-500/30',
    glowClass: 'shadow-[0_0_6px_rgba(16,185,129,0.15)]',
    textColor: 'text-emerald-400 font-medium',
    gradient: 'from-emerald-950/20 to-slate-900',
    description: '36.0% 확률. 흔하지 않은 잠재력을 지닌 모험가들.',
  },
  COMMON: {
    id: 'COMMON',
    nameKr: '일반',
    nominalRate: 45.0,
    normalizedRate: (45.0 / TOTAL_NOMINAL_WEIGHT) * 100,
    color: '#94a3b8',
    badgeBg: 'bg-slate-800 text-slate-300 border border-slate-700',
    borderClass: 'border border-slate-700/60',
    glowClass: '',
    textColor: 'text-slate-300',
    gradient: 'from-slate-800/40 to-slate-900',
    description: '45.0% 확률. 가장 널리 발견되는 친숙한 동료와 기본 장비.',
  },
};
