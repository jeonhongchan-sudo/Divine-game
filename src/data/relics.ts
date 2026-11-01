import { Relic } from '../types/game';

export const RELICS: Relic[] = [
  {
    id: 'relic-1',
    name: '황금빛 나침반',
    description: '전설적인 탐험가가 사용하던 행운의 나침반입니다.',
    effect: '모든 골드 획득량 15% 증가',
    rarity: 'LEGENDARY',
    iconType: 'Compass',
  },
  {
    id: 'relic-2',
    name: '차원의 모래시계',
    description: '시간의 흐름을 아주 미세하게 늦추는 신비한 도구입니다.',
    effect: '다이아 생성 속도 10% 증가 (내부 보너스)',
    rarity: 'MYTHIC',
    iconType: 'Hourglass',
  },
  {
    id: 'relic-3',
    name: '축복받은 루비',
    description: '신성한 에너지가 깃든 붉은 보석입니다.',
    effect: '기본 행운 수치 +20 증가',
    rarity: 'SECRET',
    iconType: 'Gem',
  },
  {
    id: 'relic-4',
    name: '고대 마법사의 지팡이',
    description: '수천 년의 지혜가 담긴 고목 지팡이입니다.',
    effect: '카드 강화 성공 확률 보너스',
    rarity: 'EPIC',
    iconType: 'Wand2',
  },
  {
    id: 'relic-5',
    name: '성스러운 성배',
    description: '천상의 빛을 머금은 순백의 성배입니다.',
    effect: '신성(DIVINE) 등급 강림 확률 미세 증가',
    rarity: 'DIVINE',
    iconType: 'Trophy',
  },
  {
    id: 'relic-6',
    name: '영원한 불꽃의 화로',
    description: '절대 꺼지지 않는 시원의 불꽃을 간직한 화로입니다.',
    effect: '방치 골드 수익 25% 증가',
    rarity: 'ETERNAL',
    iconType: 'Flame',
  },
  {
    id: 'relic-7',
    name: '천상의 왕관',
    description: '은하를 다스리는 자만이 쓸 수 있는 빛나는 왕관입니다.',
    effect: '모든 수집 보너스 효율 1.5배',
    rarity: 'CELESTIAL',
    iconType: 'Crown',
  },
  {
    id: 'relic-8',
    name: '우주의 핵',
    description: '무너진 별의 중심에서 추출한 순수한 에너지체입니다.',
    effect: '전설 이상 카드 획득 시 추가 골드 획득',
    rarity: 'COSMIC',
    iconType: 'Sun',
  },
];

export const RELICS_MAP: Record<string, Relic> = RELICS.reduce((acc, relic) => {
  acc[relic.id] = relic;
  return acc;
}, {} as Record<string, Relic>);

export const RELICS_BY_RARITY: Record<string, Relic[]> = RELICS.reduce((acc, relic) => {
  if (!acc[relic.rarity]) acc[relic.rarity] = [];
  acc[relic.rarity].push(relic);
  return acc;
}, {} as Record<string, Relic[]>);
