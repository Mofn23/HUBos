import { MuscleTierName, MuscleTierInfo, SetLog } from '@/types/workout';

export const TIERS_CATALOG: Record<MuscleTierName, MuscleTierInfo> = {
  hierro: {
    tier: 'hierro',
    label: 'Hierro',
    color: '#8E8E93',
    glowClass: 'shadow-[0_0_15px_rgba(142,142,147,0.3)]',
    level: 1,
    description: 'Iniciando el camino de la disciplina y acondicionamiento.',
  },
  cobre: {
    tier: 'cobre',
    label: 'Cobre',
    color: '#C87D55',
    glowClass: 'shadow-[0_0_15px_rgba(200,125,85,0.35)]',
    level: 2,
    description: 'Bases neuromusculares activadas. Primeras ganancias.',
  },
  plata: {
    tier: 'plata',
    label: 'Plata',
    color: '#D1D1D6',
    glowClass: 'shadow-[0_0_18px_rgba(209,209,214,0.4)]',
    level: 3,
    description: 'Fuerza funcional consolidada y técnica pulida.',
  },
  oro: {
    tier: 'oro',
    label: 'Oro',
    color: '#FFD60A',
    glowClass: 'shadow-[0_0_20px_rgba(255,214,10,0.45)]',
    level: 4,
    description: 'Levantamientos respetables. Levantando tu propio peso corporal.',
  },
  platino: {
    tier: 'platino',
    label: 'Platino',
    color: '#E5E5EA',
    glowClass: 'shadow-[0_0_22px_rgba(229,229,234,0.5)]',
    level: 5,
    description: 'Nivel intermedio-avanzado. Densidad muscular notable.',
  },
  diamante: {
    tier: 'diamante',
    label: 'Diamante',
    color: '#64D2FF',
    glowClass: 'shadow-[0_0_25px_rgba(100,210,255,0.55)]',
    level: 6,
    description: 'Fuerza pesada de élite comercial. Cargas superiores al 90% del gimnasio.',
  },
  zafiro: {
    tier: 'zafiro',
    label: 'Zafiro',
    color: '#0A84FF',
    glowClass: 'shadow-[0_0_28px_rgba(10,132,255,0.6)]',
    level: 7,
    description: 'Poder puro y madurez muscular. Dominio de cargas máximas.',
  },
  legendario: {
    tier: 'legendario',
    label: 'Legendario',
    color: '#BF5AF2',
    glowClass: 'shadow-[0_0_30px_rgba(191,90,242,0.65)]',
    level: 8,
    description: 'Fuerza sobrehumana y proporciones excepcionales.',
  },
  estetico: {
    tier: 'estetico',
    label: 'Estético',
    color: '#34C759',
    glowClass: 'shadow-[0_0_35px_rgba(52,199,89,0.7)]',
    level: 9,
    description: 'Físico esculpido con proporciones clásicas perfectas y vascularización.',
  },
  simetrico: {
    tier: 'simetrico',
    label: 'Simétrico',
    color: '#FF375F',
    glowClass: 'shadow-[0_0_40px_rgba(255,55,95,0.85)]',
    level: 10,
    description: 'La cúspide del Olimpo. Armonía anatómica divina y fuerza total.',
  },
};

export const TIER_ORDER: MuscleTierName[] = [
  'hierro',
  'cobre',
  'plata',
  'oro',
  'platino',
  'diamante',
  'zafiro',
  'legendario',
  'estetico',
  'simetrico',
];

/**
 * Calculates Estimated One Rep Max (1RM) using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export type AnatomicalMuscle =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'gluteos'
  | 'pantorrillas'
  | 'abdomen';

export const ANATOMY_CONFIG: Record<
  AnatomicalMuscle,
  {
    name: string;
    icon: string;
    highlighterMusclesFront: string[];
    highlighterMusclesBack: string[];
    // Standard relative strength multipliers (1RM / BW) for Gold (lvl 4) and Simétrico (lvl 10)
    multiplierGold: number;
    multiplierSymmetric: number;
  }
> = {
  pecho: {
    name: 'Pectorales',
    icon: '🛡️',
    highlighterMusclesFront: ['chest'],
    highlighterMusclesBack: [],
    multiplierGold: 1.0,
    multiplierSymmetric: 1.9,
  },
  espalda: {
    name: 'Espalda & Dorsales',
    icon: '🦅',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['upper-back', 'lower-back', 'trapezius'],
    multiplierGold: 1.3,
    multiplierSymmetric: 2.4,
  },
  hombros: {
    name: 'Deltoides (Hombros)',
    icon: '🥥',
    highlighterMusclesFront: ['front-deltoids'],
    highlighterMusclesBack: ['back-deltoids'],
    multiplierGold: 0.65,
    multiplierSymmetric: 1.25,
  },
  biceps: {
    name: 'Bíceps & Antebrazos',
    icon: '💪',
    highlighterMusclesFront: ['biceps', 'forearm'],
    highlighterMusclesBack: [],
    multiplierGold: 0.5,
    multiplierSymmetric: 0.95,
  },
  triceps: {
    name: 'Tríceps (Herradura)',
    icon: '⚡',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['triceps'],
    multiplierGold: 0.55,
    multiplierSymmetric: 1.05,
  },
  piernas: {
    name: 'Cuádriceps & Femoral',
    icon: '🦵',
    highlighterMusclesFront: ['quadriceps'],
    highlighterMusclesBack: ['hamstring'],
    multiplierGold: 1.4,
    multiplierSymmetric: 2.5,
  },
  gluteos: {
    name: 'Glúteos',
    icon: '🍑',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['gluteal'],
    multiplierGold: 1.5,
    multiplierSymmetric: 2.6,
  },
  pantorrillas: {
    name: 'Pantorrillas (Gemelos)',
    icon: '💎',
    highlighterMusclesFront: ['calves'],
    highlighterMusclesBack: ['calves'],
    multiplierGold: 1.2,
    multiplierSymmetric: 2.2,
  },
  abdomen: {
    name: 'Abdomen & Core',
    icon: '🍫',
    highlighterMusclesFront: ['abs', 'obliques'],
    highlighterMusclesBack: [],
    multiplierGold: 0.4,
    multiplierSymmetric: 0.85,
  },
};

/**
 * Evaluates the tier for a given 1RM relative to user's bodyweight.
 */
export function getTierFor1RM(
  muscle: AnatomicalMuscle,
  best1RM: number,
  userWeightKg: number = 75
): MuscleTierInfo {
  if (best1RM <= 0) {
    return TIERS_CATALOG.hierro;
  }

  const weight = Math.max(45, userWeightKg || 75);
  const ratio = best1RM / weight;
  const config = ANATOMY_CONFIG[muscle];

  // Ratio boundaries
  const goldRatio = config.multiplierGold;
  const symmRatio = config.multiplierSymmetric;

  // Linear progression score from 1 to 10
  const normalized = (ratio / symmRatio) * 10;
  let level = Math.min(10, Math.max(1, Math.round(normalized)));

  // If lifted equal or more than gold ratio, guarantee at least Gold (4)
  if (ratio >= goldRatio && level < 4) {
    level = 4;
  }

  const tierKey = TIER_ORDER[level - 1] || 'hierro';
  return TIERS_CATALOG[tierKey];
}

/**
 * Calculates overall user rank based on all muscle tiers.
 */
export function calculateOverallRank(
  muscleTiers: Record<AnatomicalMuscle, MuscleTierInfo>
): {
  overallTier: MuscleTierInfo;
  averageLevel: number;
  progressToNext: number; // 0 to 100%
} {
  const values = Object.values(muscleTiers);
  if (values.length === 0) {
    return { overallTier: TIERS_CATALOG.hierro, averageLevel: 1, progressToNext: 0 };
  }

  const totalLevel = values.reduce((sum, item) => sum + item.level, 0);
  const avg = totalLevel / values.length;
  const roundedLevel = Math.min(10, Math.max(1, Math.floor(avg)));
  const fraction = avg - roundedLevel;

  const currentTier = TIERS_CATALOG[TIER_ORDER[roundedLevel - 1]] || TIERS_CATALOG.hierro;

  return {
    overallTier: currentTier,
    averageLevel: Math.round(avg * 10) / 10,
    progressToNext: Math.round(fraction * 100),
  };
}

/**
 * Maps exercise target or category to an AnatomicalMuscle.
 */
export function mapTargetToAnatomy(target: string, bodyPart: string): AnatomicalMuscle {
  const t = (target || '').toLowerCase();
  const bp = (bodyPart || '').toLowerCase();

  if (t.includes('pec') || t.includes('chest') || bp === 'chest') return 'pecho';
  if (t.includes('lat') || t.includes('back') || t.includes('spine') || bp === 'back') return 'espalda';
  if (t.includes('delt') || t.includes('shoulder') || bp === 'shoulders') return 'hombros';
  if (t.includes('bicep') || t.includes('brachii')) return 'biceps';
  if (t.includes('tricep')) return 'triceps';
  if (t.includes('glute')) return 'gluteos';
  if (t.includes('calf') || t.includes('calves') || t.includes('gastrocnemius') || t.includes('soleus') || bp === 'lower legs') return 'pantorrillas';
  if (t.includes('quad') || t.includes('hamstring') || t.includes('thigh') || bp === 'upper legs') return 'piernas';
  if (t.includes('abs') || t.includes('waist') || t.includes('oblique') || bp === 'waist') return 'abdomen';

  return 'pecho';
}
