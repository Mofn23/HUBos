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
  | 'hierro'
  | 'cobre'
  | 'plata'
  | 'oro'
  | 'platino'
  | 'diamante'
  | 'zafiro'
  | 'legendario'
  | 'estetico'
  | 'simetrico';

export interface MuscleTierInfo {
  tier: MuscleTierName;
  label: string;
  color: string;
  glowClass: string;
  level: number; // 1 to 10
  description: string;
}
