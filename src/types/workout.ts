export interface Exercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instructions_es: string;
  instructions_en: string;
  steps_es: string[];
  steps_en: string[];
  image: string;
  gif_url: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  targetRpe?: number;
  restSeconds: number;
  notes?: string;
  category?: string;
  target?: string;
}

export interface RoutineDay {
  id: string;
  dayName: string;
  focus: string;
  exercises: RoutineExercise[];
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  splitType: 'push_pull_legs' | 'upper_lower' | 'full_body' | 'bro_split' | 'custom';
  targetDaysPerWeek: number;
  days: RoutineDay[];
  createdAt: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  isWarmup?: boolean;
  isDropSet?: boolean;
}

export interface SessionExerciseLog {
  exerciseId: string;
  exerciseName: string;
  category: string;
  target: string;
  sets: SetLog[];
  notes?: string;
}

export interface ActiveWorkoutSession {
  id: string;
  routineId?: string;
  routineName?: string;
  dayName?: string;
  startTime: number;
  exercises: SessionExerciseLog[];
  currentExerciseIndex: number;
  isRestTimerRunning: boolean;
  restTimerSeconds: number;
  restTimerEndTimestamp: number | null;
}

export interface WorkoutHistoryItem {
  id: string;
  routineName: string;
  dayName: string;
  date: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  exercises: SessionExerciseLog[];
  prCount: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RM: number;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg: number;
  chestCm?: number;
  armsCm?: number;
  waistCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  photoId?: string;
}

export type MuscleTierName =
  | 'hierro_1'
  | 'hierro_2'
  | 'hierro_3'
  | 'bronce_1'
  | 'bronce_2'
  | 'bronce_3'
  | 'plata_1'
  | 'plata_2'
  | 'plata_3'
  | 'oro_1'
  | 'oro_2'
  | 'oro_3'
  | 'rubi_1'
  | 'rubi_2'
  | 'rubi_3'
  | 'esmeralda_1'
  | 'esmeralda_2'
  | 'esmeralda_3'
  | 'diamante_1'
  | 'diamante_2'
  | 'diamante_3'
  | 'campeon_1'
  | 'campeon_2'
  | 'campeon_3'
  | 'simetrico'
  // Legacy aliases
  | 'hierro'
  | 'cobre'
  | 'plata'
  | 'oro'
  | 'platino'
  | 'diamante'
  | 'zafiro'
  | 'legendario'
  | 'estetico';

export interface MuscleTierInfo {
  tier: MuscleTierName;
  label: string;
  sublevel?: string; // 'I' | 'II' | 'III' | ''
  percentile?: string; // e.g. "Top 27%"
  color: string;
  glowClass: string;
  level: number; // 1 to 25
  description: string;
  badgeImage?: string; // e.g. "/ranks/rubi_2.png"
}
