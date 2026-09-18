import { MuscleTierName, MuscleTierInfo } from '@/types/workout';
import type { Muscle } from 'react-body-highlighter';

export const TIERS_CATALOG: Record<MuscleTierName, MuscleTierInfo> = {
  // 1. Hierro (Top 100% - 86%)
  hierro_1: {
    tier: 'hierro_1',
    label: 'Hierro I',
    sublevel: 'I',
    percentile: 'Top 100%',
    color: '#8E8E93',
    glowClass: 'shadow-[0_0_15px_rgba(142,142,147,0.3)]',
    level: 1,
    description: 'Iniciando el camino de la disciplina y el acondicionamiento.',
    badgeImage: '/ranks/hierro_1.png',
  },
  hierro_2: {
    tier: 'hierro_2',
    label: 'Hierro II',
    sublevel: 'II',
    percentile: 'Top 93%',
    color: '#9CA3AF',
    glowClass: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
    level: 2,
    description: 'Constancia establecida y adaptación neuromotora inicial.',
    badgeImage: '/ranks/hierro_2.png',
  },
  hierro_3: {
    tier: 'hierro_3',
    label: 'Hierro III',
    sublevel: 'III',
    percentile: 'Top 86%',
    color: '#CBD5E1',
    glowClass: 'shadow-[0_0_15px_rgba(203,213,225,0.35)]',
    level: 3,
    description: 'Fuerza base en consolidación y primeros hábitos arraigados.',
    badgeImage: '/ranks/hierro_3.png',
  },

  // 2. Bronce (Top 79% - 67%)
  bronce_1: {
    tier: 'bronce_1',
    label: 'Bronce I',
    sublevel: 'I',
    percentile: 'Top 79%',
    color: '#A16207',
    glowClass: 'shadow-[0_0_15px_rgba(161,98,7,0.35)]',
    level: 4,
    description: 'Activación muscular sólida y primeras ganancias visibles.',
    badgeImage: '/ranks/bronce_1.png',
  },
  bronce_2: {
    tier: 'bronce_2',
    label: 'Bronce II',
    sublevel: 'II',
    percentile: 'Top 73%',
    color: '#B45309',
    glowClass: 'shadow-[0_0_15px_rgba(180,83,9,0.4)]',
    level: 5,
    description: 'Progresión continua en cargas de ejercicios fundamentales.',
    badgeImage: '/ranks/bronce_2.png',
  },
  bronce_3: {
    tier: 'bronce_3',
    label: 'Bronce III',
    sublevel: 'III',
    percentile: 'Top 67%',
    color: '#CD7F32',
    glowClass: 'shadow-[0_0_15px_rgba(205,127,50,0.45)]',
    level: 6,
    description: 'Hipertrofia progresiva y conexión mente-músculo notable.',
    badgeImage: '/ranks/bronce_3.png',
  },

  // 3. Plata (Top 61% - 50%)
  plata_1: {
    tier: 'plata_1',
    label: 'Plata I',
    sublevel: 'I',
    percentile: 'Top 61%',
    color: '#94A3B8',
    glowClass: 'shadow-[0_0_18px_rgba(148,163,184,0.4)]',
    level: 7,
    description: 'Técnica pulida y fuerza funcional consolidada.',
    badgeImage: '/ranks/plata_1.png',
  },
  plata_2: {
    tier: 'plata_2',
    label: 'Plata II',
    sublevel: 'II',
    percentile: 'Top 55%',
    color: '#CBD5E1',
    glowClass: 'shadow-[0_0_18px_rgba(203,213,225,0.45)]',
    level: 8,
    description: 'Mitad superior de practicantes constantes en el gimnasio.',
    badgeImage: '/ranks/plata_2.png',
  },
  plata_3: {
    tier: 'plata_3',
    label: 'Plata III',
    sublevel: 'III',
    percentile: 'Top 50%',
    color: '#F1F5F9',
    glowClass: 'shadow-[0_0_18px_rgba(241,245,249,0.5)]',
    level: 9,
    description: 'Exactamente en el Top 50% de atletas regulares.',
    badgeImage: '/ranks/plata_3.png',
  },

  // 4. Oro (Top 45% - 35%)
  oro_1: {
    tier: 'oro_1',
    label: 'Oro I',
    sublevel: 'I',
    percentile: 'Top 45%',
    color: '#EAB308',
    glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.45)]',
    level: 10,
    description: 'Fuerza respetable. Levantando tu propio peso en básicos.',
    badgeImage: '/ranks/oro_1.png',
  },
  oro_2: {
    tier: 'oro_2',
    label: 'Oro II',
    sublevel: 'II',
    percentile: 'Top 40%',
    color: '#FACC15',
    glowClass: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]',
    level: 11,
    description: 'Nivel intermedio superior con proporciones atléticas.',
    badgeImage: '/ranks/oro_2.png',
  },
  oro_3: {
    tier: 'oro_3',
    label: 'Oro III',
    sublevel: 'III',
    percentile: 'Top 35%',
    color: '#FDE047',
    glowClass: 'shadow-[0_0_20px_rgba(253,224,71,0.55)]',
    level: 12,
    description: 'Superando las barreras hacia el rendimiento avanzado.',
    badgeImage: '/ranks/oro_3.png',
  },

  // 5. Rubí (Top 31% - 23%)
  rubi_1: {
    tier: 'rubi_1',
    label: 'Rubí I',
    sublevel: 'I',
    percentile: 'Top 31%',
    color: '#E11D48',
    glowClass: 'shadow-[0_0_25px_rgba(225,29,72,0.5)]',
    level: 13,
    description: 'Atleta avanzado con gran desarrollo y densidad muscular.',
    badgeImage: '/ranks/rubi_1.png',
  },
  rubi_2: {
    tier: 'rubi_2',
    label: 'Rubí II',
    sublevel: 'II',
    percentile: 'Top 27%',
    color: '#F43F5E',
    glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.55)]',
    level: 14,
    description: 'Eres parte del top 27% más fuerte del gimnasio.',
    badgeImage: '/ranks/rubi_2.png',
  },
  rubi_3: {
    tier: 'rubi_3',
    label: 'Rubí III',
    sublevel: 'III',
    percentile: 'Top 23%',
    color: '#FB7185',
    glowClass: 'shadow-[0_0_25px_rgba(251,113,133,0.6)]',
    level: 15,
    description: 'Físico denso y levantamientos contundentes de alto nivel.',
    badgeImage: '/ranks/rubi_3.png',
  },

  // 6. Esmeralda (Top 20% - 14%)
  esmeralda_1: {
    tier: 'esmeralda_1',
    label: 'Esmeralda I',
    sublevel: 'I',
    percentile: 'Top 20%',
    color: '#059669',
    glowClass: 'shadow-[0_0_28px_rgba(5,150,105,0.55)]',
    level: 16,
    description: 'Top 20% más fuerte. Dominio completo de altas cargas.',
    badgeImage: '/ranks/esmeralda_1.png',
  },
  esmeralda_2: {
    tier: 'esmeralda_2',
    label: 'Esmeralda II',
    sublevel: 'II',
    percentile: 'Top 17%',
    color: '#10B981',
    glowClass: 'shadow-[0_0_28px_rgba(16,185,129,0.6)]',
    level: 17,
    description: 'Cargas impresionantes y simetría superior al 83% de atletas.',
    badgeImage: '/ranks/esmeralda_2.png',
  },
  esmeralda_3: {
    tier: 'esmeralda_3',
    label: 'Esmeralda III',
    sublevel: 'III',
    percentile: 'Top 14%',
    color: '#34D399',
    glowClass: 'shadow-[0_0_28px_rgba(52,211,153,0.65)]',
    level: 18,
    description: 'Hipertrofia de nivel competitivo y técnica inquebrantable.',
    badgeImage: '/ranks/esmeralda_3.png',
  },

  // 7. Diamante (Top 11% - 7%)
  diamante_1: {
    tier: 'diamante_1',
    label: 'Diamante I',
    sublevel: 'I',
    percentile: 'Top 11%',
    color: '#0284C7',
    glowClass: 'shadow-[0_0_30px_rgba(2,132,199,0.6)]',
    level: 19,
    description: 'Fuerza pesada de élite. Top 11% en el ranking.',
    badgeImage: '/ranks/diamante_1.png',
  },
  diamante_2: {
    tier: 'diamante_2',
    label: 'Diamante II',
    sublevel: 'II',
    percentile: 'Top 9%',
    color: '#38BDF8',
    glowClass: 'shadow-[0_0_30px_rgba(56,189,248,0.65)]',
    level: 20,
    description: 'Top 9% más fuerte. Levantamientos que destacan en cualquier gym.',
    badgeImage: '/ranks/diamante_2.png',
  },
  diamante_3: {
    tier: 'diamante_3',
    label: 'Diamante III',
    sublevel: 'III',
    percentile: 'Top 7%',
    color: '#7DD3FC',
    glowClass: 'shadow-[0_0_30px_rgba(125,211,252,0.7)]',
    level: 21,
    description: 'Fuerza colosal y definición vascular sobresaliente.',
    badgeImage: '/ranks/diamante_3.png',
  },

  // 8. Campeón (Top 5% - 3%)
  campeon_1: {
    tier: 'campeon_1',
    label: 'Campeón I',
    sublevel: 'I',
    percentile: 'Top 5%',
    color: '#7E22CE',
    glowClass: 'shadow-[0_0_35px_rgba(126,34,206,0.65)]',
    level: 22,
    description: 'Top 5% élite. Cargas titánicas e imponentes.',
    badgeImage: '/ranks/campeon_1.png',
  },
  campeon_2: {
    tier: 'campeon_2',
    label: 'Campeón II',
    sublevel: 'II',
    percentile: 'Top 4%',
    color: '#A855F7',
    glowClass: 'shadow-[0_0_35px_rgba(168,85,247,0.7)]',
    level: 23,
    description: 'Fuerza sobrehumana con madurez muscular suprema.',
    badgeImage: '/ranks/campeon_2.png',
  },
  campeon_3: {
    tier: 'campeon_3',
    label: 'Campeón III',
    sublevel: 'III',
    percentile: 'Top 3%',
    color: '#C084FC',
    glowClass: 'shadow-[0_0_35px_rgba(192,132,252,0.75)]',
    level: 24,
    description: 'La antesala a la simetría absoluta. Top 3% mundial.',
    badgeImage: '/ranks/campeon_3.png',
  },

  // 9. Simétrico (Top 1%)
  simetrico: {
    tier: 'simetrico',
    label: 'Simétrico',
    sublevel: '',
    percentile: 'Top 1%',
    color: '#F59E0B',
    glowClass: 'shadow-[0_0_40px_rgba(245,158,11,0.85)]',
    level: 25,
    description: 'La cúspide del Olimpo. Armonía anatómica divina y fuerza total.',
    badgeImage: '/ranks/simetrico.png',
  },

  // Legacy aliases
  hierro: {
    tier: 'hierro_1',
    label: 'Hierro I',
    sublevel: 'I',
    percentile: 'Top 100%',
    color: '#8E8E93',
    glowClass: 'shadow-[0_0_15px_rgba(142,142,147,0.3)]',
    level: 1,
    description: 'Iniciando el camino de la disciplina y el acondicionamiento.',
    badgeImage: '/ranks/hierro_1.png',
  },
  cobre: {
    tier: 'bronce_1',
    label: 'Bronce I',
    sublevel: 'I',
    percentile: 'Top 79%',
    color: '#A16207',
    glowClass: 'shadow-[0_0_15px_rgba(161,98,7,0.35)]',
    level: 4,
    description: 'Activación muscular sólida.',
    badgeImage: '/ranks/bronce_1.png',
  },
  plata: {
    tier: 'plata_1',
    label: 'Plata I',
    sublevel: 'I',
    percentile: 'Top 61%',
    color: '#94A3B8',
    glowClass: 'shadow-[0_0_18px_rgba(148,163,184,0.4)]',
    level: 7,
    description: 'Técnica pulida y fuerza funcional.',
    badgeImage: '/ranks/plata_1.png',
  },
  oro: {
    tier: 'oro_2',
    label: 'Oro II',
    sublevel: 'II',
    percentile: 'Top 40%',
    color: '#FACC15',
    glowClass: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]',
    level: 11,
    description: 'Fuerza respetable superior al promedio.',
    badgeImage: '/ranks/oro_2.png',
  },
  platino: {
    tier: 'rubi_1',
    label: 'Rubí I',
    sublevel: 'I',
    percentile: 'Top 31%',
    color: '#E11D48',
    glowClass: 'shadow-[0_0_25px_rgba(225,29,72,0.5)]',
    level: 13,
    description: 'Nivel intermedio-avanzado.',
    badgeImage: '/ranks/rubi_1.png',
  },
  diamante: {
    tier: 'diamante_1',
    label: 'Diamante I',
    sublevel: 'I',
    percentile: 'Top 11%',
    color: '#0284C7',
    glowClass: 'shadow-[0_0_30px_rgba(2,132,199,0.6)]',
    level: 19,
    description: 'Fuerza pesada de élite.',
    badgeImage: '/ranks/diamante_1.png',
  },
  zafiro: {
    tier: 'diamante_2',
    label: 'Diamante II',
    sublevel: 'II',
    percentile: 'Top 9%',
    color: '#38BDF8',
    glowClass: 'shadow-[0_0_30px_rgba(56,189,248,0.65)]',
    level: 20,
    description: 'Poder puro y madurez muscular.',
    badgeImage: '/ranks/diamante_2.png',
  },
  legendario: {
    tier: 'campeon_1',
    label: 'Campeón I',
    sublevel: 'I',
    percentile: 'Top 5%',
    color: '#7E22CE',
    glowClass: 'shadow-[0_0_35px_rgba(126,34,206,0.65)]',
    level: 22,
    description: 'Fuerza sobrehumana.',
    badgeImage: '/ranks/campeon_1.png',
  },
  estetico: {
    tier: 'esmeralda_2',
    label: 'Esmeralda II',
    sublevel: 'II',
    percentile: 'Top 17%',
    color: '#10B981',
    glowClass: 'shadow-[0_0_28px_rgba(16,185,129,0.6)]',
    level: 17,
    description: 'Físico esculpido con proporciones clásicas.',
    badgeImage: '/ranks/esmeralda_2.png',
  },
};

export const TIER_ORDER: MuscleTierName[] = [
  'hierro_1',
  'hierro_2',
  'hierro_3',
  'bronce_1',
  'bronce_2',
  'bronce_3',
  'plata_1',
  'plata_2',
  'plata_3',
  'oro_1',
  'oro_2',
  'oro_3',
  'rubi_1',
  'rubi_2',
  'rubi_3',
  'esmeralda_1',
  'esmeralda_2',
  'esmeralda_3',
  'diamante_1',
  'diamante_2',
  'diamante_3',
  'campeon_1',
  'campeon_2',
  'campeon_3',
  'simetrico',
];

/**
 * Samuel's exact baseline ranks extracted directly from Symmetry.
 */
export const SAMUEL_BASELINE_RANKS: Record<AnatomicalMuscle, MuscleTierInfo> = {
  pecho: TIERS_CATALOG.esmeralda_2, // Esmeralda II (Top 17%)
  espalda: TIERS_CATALOG.rubi_2, // Rubí II (Top 27%)
  hombros: TIERS_CATALOG.rubi_1, // Rubí I (Top 31%)
  biceps: TIERS_CATALOG.rubi_3, // Bíceps Rubí III (Top 23%)
  triceps: TIERS_CATALOG.diamante_2, // Tríceps Diamante II (Top 9%)
  piernas: TIERS_CATALOG.rubi_2, // Rubí II (Top 27%)
  gluteos: TIERS_CATALOG.oro_1, // Glúteos
  pantorrillas: TIERS_CATALOG.oro_2, // Gemelos Oro II (Top 40%)
  abdomen: TIERS_CATALOG.oro_2, // Abdominales Oro II (Top 40%)
};

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
    highlighterMusclesFront: Muscle[];
    highlighterMusclesBack: Muscle[];
    thresholds: number[];
  }
> = {
  pecho: {
    name: 'Pectorales',
    icon: '🛡️',
    highlighterMusclesFront: ['chest'],
    highlighterMusclesBack: [],
    // 24 thresholds to span from level 2 to 25
    thresholds: [
      0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.05, 1.15, 1.25, 1.35, 1.45,
      1.55, 1.65, 1.75, 1.85, 1.95, 2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.70,
    ],
  },
  espalda: {
    name: 'Espalda & Dorsales',
    icon: '🦅',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['upper-back', 'lower-back', 'trapezius'],
    thresholds: [
      0.45, 0.55, 0.65, 0.80, 0.95, 1.10, 1.25, 1.40, 1.55, 1.70, 1.85, 2.00,
      2.15, 2.30, 2.45, 2.60, 2.75, 2.90, 3.05, 3.20, 3.35, 3.50, 3.65, 3.85,
    ],
  },
  hombros: {
    name: 'Deltoides (Hombros)',
    icon: '🥥',
    highlighterMusclesFront: ['front-deltoids'],
    highlighterMusclesBack: ['back-deltoids'],
    thresholds: [
      0.25, 0.32, 0.40, 0.48, 0.56, 0.64, 0.72, 0.80, 0.88, 0.96, 1.04, 1.12,
      1.20, 1.28, 1.36, 1.44, 1.52, 1.60, 1.68, 1.76, 1.84, 1.92, 2.00, 2.15,
    ],
  },
  biceps: {
    name: 'Bíceps & Antebrazos',
    icon: '💪',
    highlighterMusclesFront: ['biceps', 'forearm'],
    highlighterMusclesBack: [],
    thresholds: [
      0.20, 0.26, 0.32, 0.38, 0.44, 0.50, 0.56, 0.62, 0.68, 0.74, 0.80, 0.86,
      0.92, 0.98, 1.04, 1.10, 1.16, 1.22, 1.28, 1.34, 1.40, 1.46, 1.52, 1.65,
    ],
  },
  triceps: {
    name: 'Tríceps (Herradura)',
    icon: '⚡',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['triceps'],
    thresholds: [
      0.22, 0.28, 0.35, 0.42, 0.50, 0.58, 0.66, 0.74, 0.82, 0.90, 0.98, 1.06,
      1.14, 1.22, 1.30, 1.38, 1.46, 1.54, 1.62, 1.70, 1.78, 1.86, 1.95, 2.10,
    ],
  },
  piernas: {
    name: 'Cuádriceps & Femoral',
    icon: '🦵',
    highlighterMusclesFront: ['quadriceps'],
    highlighterMusclesBack: ['hamstring'],
    thresholds: [
      0.55, 0.70, 0.85, 1.00, 1.15, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20,
      2.35, 2.50, 2.65, 2.80, 2.95, 3.10, 3.25, 3.40, 3.55, 3.70, 3.85, 4.10,
    ],
  },
  gluteos: {
    name: 'Glúteos',
    icon: '🍑',
    highlighterMusclesFront: [],
    highlighterMusclesBack: ['gluteal'],
    thresholds: [
      0.60, 0.75, 0.90, 1.10, 1.30, 1.50, 1.70, 1.90, 2.10, 2.30, 2.50, 2.70,
      2.90, 3.10, 3.30, 3.50, 3.70, 3.90, 4.10, 4.30, 4.50, 4.70, 4.90, 5.20,
    ],
  },
  pantorrillas: {
    name: 'Pantorrillas (Gemelos)',
    icon: '💎',
    highlighterMusclesFront: ['calves'],
    highlighterMusclesBack: ['calves'],
    thresholds: [
      0.50, 0.65, 0.80, 0.95, 1.10, 1.25, 1.40, 1.55, 1.70, 1.85, 2.00, 2.15,
      2.30, 2.45, 2.60, 2.75, 2.90, 3.05, 3.20, 3.35, 3.50, 3.65, 3.80, 4.00,
    ],
  },
  abdomen: {
    name: 'Abdomen & Core',
    icon: '🍫',
    highlighterMusclesFront: ['abs', 'obliques'],
    highlighterMusclesBack: [],
    thresholds: [
      0.15, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.78, 0.86, 0.94, 1.02,
      1.10, 1.18, 1.26, 1.34, 1.42, 1.50, 1.58, 1.66, 1.74, 1.82, 1.90, 2.05,
    ],
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
  // If no 1RM has been registered yet, use Samuel's baseline tier
  if (best1RM <= 0) {
    return SAMUEL_BASELINE_RANKS[muscle] || TIERS_CATALOG.rubi_2;
  }

  const weight = Math.max(50, userWeightKg || 75);
  const ratio = best1RM / weight;
  const config = ANATOMY_CONFIG[muscle];
  const thresholds = config.thresholds;

  let level = 1; // Hierro I by default
  for (let i = 0; i < thresholds.length; i++) {
    if (ratio >= thresholds[i]) {
      level = i + 2;
    } else {
      break;
    }
  }

  level = Math.min(25, Math.max(1, level));
  const tierKey = TIER_ORDER[level - 1] || 'rubi_2';
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
    return { overallTier: TIERS_CATALOG.rubi_2, averageLevel: 14, progressToNext: 65 };
  }

  const totalLevel = values.reduce((sum, item) => sum + item.level, 0);
  const avg = totalLevel / values.length;
  const roundedLevel = Math.min(25, Math.max(1, Math.round(avg)));
  const fraction = avg - Math.floor(avg);

  const currentTier = TIERS_CATALOG[TIER_ORDER[roundedLevel - 1]] || TIERS_CATALOG.rubi_2;

  return {
    overallTier: currentTier,
    averageLevel: Math.round(avg * 10) / 10,
    progressToNext: Math.min(100, Math.max(0, Math.round(fraction * 100))),
  };
}

/**
 * Returns all 25 ranks in ascending (Hierro I -> Simétrico) or descending order.
 */
export function getAllRanksCatalog(order: 'asc' | 'desc' = 'desc'): MuscleTierInfo[] {
  const list = TIER_ORDER.map((key) => TIERS_CATALOG[key]);
  return order === 'desc' ? [...list].reverse() : list;
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
  if (
    t.includes('calf') ||
    t.includes('calves') ||
    t.includes('gastrocnemius') ||
    t.includes('soleus') ||
    bp === 'lower legs'
  )
    return 'pantorrillas';
  if (
    t.includes('quad') ||
    t.includes('hamstring') ||
    t.includes('thigh') ||
    t.includes('adductor') ||
    t.includes('abductor') ||
    bp === 'upper legs'
  )
    return 'piernas';
  if (t.includes('abs') || t.includes('waist') || t.includes('oblique') || bp === 'waist')
    return 'abdomen';

  return 'pecho';
}
