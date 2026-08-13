import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type RecompTab = 'dashboard' | 'meals' | 'training' | 'progress' | 'coach';

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'pre-entreno' | 'post-entreno';
  notes?: string;
  imageBase64?: string;
  isAiGenerated?: boolean;
}

export interface WaterEntry {
  date: string; // YYYY-MM-DD
  glasses: number; // each glass = 250ml
  targetGlasses: number;
}

export interface SetEntry {
  setNumber: number;
  weightKg: number;
  reps: number;
  isWarmup?: boolean;
  rpe?: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  targetMuscle: string;
  sets: SetEntry[];
  estimated1RM?: number;
  notes?: string;
}

export interface TrainingLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  muscleGroups: string[];
  exercises: ExerciseEntry[];
  totalVolumeKg: number;
  durationMinutes?: number;
  rpe?: number;
  symmetryNotes?: string;
  screenshotBase64?: string;
}

export interface BodyMeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  waistCm?: number;
  armsCm?: number;
  chestCm?: number;
  notes?: string;
}

export interface SupplementEntry {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  icon: string;
  takenDates: string[]; // List of YYYY-MM-DD
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'training' | 'hydration' | 'streak' | 'special';
  unlockedAt?: string;
}

export interface ProgressPhotoItem {
  id: string;
  date: string;
  type: 'front' | 'side' | 'back';
  imageBase64: string;
  aiAnalysis?: string;
}

export interface ChatCoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

interface RecompState {
  currentTab: RecompTab;
  setCurrentTab: (tab: RecompTab) => void;

  // Caloric & Macro Targets
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWaterGlasses: number;
  setNutritionalTargets: (targets: { calories?: number; protein?: number; carbs?: number; fat?: number; water?: number }) => void;

  // Meals
  meals: MealItem[];
  addMeal: (meal: Omit<MealItem, 'id' | 'timestamp'>) => void;
  updateMeal: (id: string, meal: Partial<MealItem>) => void;
  deleteMeal: (id: string) => void;

  // Water Tracker
  waterLogs: Record<string, number>; // dateStr -> glasses count
  addWaterGlass: (dateStr?: string) => void;
  removeWaterGlass: (dateStr?: string) => void;

  // Training & Workouts
  trainingLogs: TrainingLogEntry[];
  addTrainingLog: (log: Omit<TrainingLogEntry, 'id'>) => void;
  deleteTrainingLog: (id: string) => void;

  // Body Measurements
  measurements: BodyMeasurementEntry[];
  addMeasurement: (measurement: Omit<BodyMeasurementEntry, 'id'>) => void;
  deleteMeasurement: (id: string) => void;

  // Supplements
  supplements: SupplementEntry[];
  toggleSupplement: (id: string, dateStr?: string) => void;
  addSupplement: (supp: Omit<SupplementEntry, 'id' | 'takenDates'>) => void;
  deleteSupplement: (id: string) => void;

  // Progress Photos
  photos: ProgressPhotoItem[];
  addProgressPhoto: (photo: Omit<ProgressPhotoItem, 'id'>) => void;
  deleteProgressPhoto: (id: string) => void;
  updatePhotoAnalysis: (id: string, analysis: string) => void;

  // Achievements
  achievements: AchievementItem[];
  unlockAchievement: (id: string) => void;

  // Streak
  streak: { currentStreak: number; bestStreak: number };

  // AI Coach Chat
  coachMessages: ChatCoachMessage[];
  addCoachMessage: (sender: 'user' | 'coach', text: string) => void;
  clearCoachChat: () => void;
}

const DEFAULT_SUPPLEMENTS: SupplementEntry[] = [
  { id: 'supp-creatine', name: 'Creatina Monohidrato', dosage: '5g', timeOfDay: '08:00', icon: '⚡', takenDates: [] },
  { id: 'supp-protein', name: 'Proteína Whey Isolate', dosage: '30g', timeOfDay: '17:00', icon: '🥛', takenDates: [] },
  { id: 'supp-multi', name: 'Multivitamínico + Omega 3', dosage: '1 cap', timeOfDay: '09:00', icon: '💊', takenDates: [] },
  { id: 'supp-magnesium', name: 'Magnesio Bisglicinato', dosage: '400mg', timeOfDay: '22:00', icon: '🌙', takenDates: [] },
];

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'first_meal', title: 'Primera Comida', description: 'Registra tu primer alimento analizado con IA', icon: '🥗', category: 'nutrition' },
  { id: 'protein_goal', title: 'Monstruo de Proteína', description: 'Alcanza tu meta de proteína en un día', icon: '🥩', category: 'nutrition' },
  { id: 'water_master', title: 'Hidratación Perfecta', description: 'Completa 10 vasos de agua (2.5L) en un día', icon: '💧', category: 'hydration' },
  { id: 'first_workout', title: 'Día de Hierro', description: 'Registra tu primera sesión de entrenamiento', icon: '🏋️‍♂️', category: 'training' },
  { id: 'streak_3', title: 'Constancia Inicial', description: 'Mantén 3 días seguidos de registro activo', icon: '🔥', category: 'streak' },
  { id: 'heavy_lifter', title: 'Gigante de Fuerza', description: 'Levanta más de 5,000 kg de volumen en un entrenamiento', icon: '🏆', category: 'training' },
];

export const useRecompStore = create<RecompState>()(
  persist(
    (set, get) => ({
      currentTab: 'dashboard',
      setCurrentTab: (tab) => set({ currentTab: tab }),

      targetCalories: 2250,
      targetProtein: 160,
      targetCarbs: 230,
      targetFat: 65,
      targetWaterGlasses: 10,

      setNutritionalTargets: (targets) =>
        set((state) => ({
          targetCalories: targets.calories ?? state.targetCalories,
          targetProtein: targets.protein ?? state.targetProtein,
          targetCarbs: targets.carbs ?? state.targetCarbs,
          targetFat: targets.fat ?? state.targetFat,
          targetWaterGlasses: targets.water ?? state.targetWaterGlasses,
        })),

      meals: [
        {
          id: 'meal-sample-1',
          name: 'Huevos revueltos con aguacate y tostadas',
          calories: 480,
          protein: 28,
          carbs: 35,
          fat: 24,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          mealType: 'desayuno',
        },
        {
          id: 'meal-sample-2',
          name: 'Pechuga de pollo a la plancha con arroz y brócoli',
          calories: 620,
          protein: 52,
          carbs: 65,
          fat: 14,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          mealType: 'almuerzo',
        },
      ],

      addMeal: (meal) =>
        set((state) => {
          const newMeal: MealItem = {
            ...meal,
            id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
          };
          return { meals: [newMeal, ...state.meals] };
        }),

      updateMeal: (id, updated) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...updated } : m)),
        })),

      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      waterLogs: {
        [new Date().toISOString().split('T')[0]]: 6,
      },

      addWaterGlass: (dateStr) => {
        const key = dateStr || new Date().toISOString().split('T')[0];
        set((state) => {
          const current = state.waterLogs[key] || 0;
          return { waterLogs: { ...state.waterLogs, [key]: Math.min(current + 1, 20) } };
        });
      },

      removeWaterGlass: (dateStr) => {
        const key = dateStr || new Date().toISOString().split('T')[0];
        set((state) => {
          const current = state.waterLogs[key] || 0;
          return { waterLogs: { ...state.waterLogs, [key]: Math.max(current - 1, 0) } };
        });
      },

      trainingLogs: [
        {
          id: 'train-sample-1',
          date: new Date().toISOString().split('T')[0],
          title: 'Torso Hipertrofia (Push / Pull)',
          muscleGroups: ['Pecho', 'Espalda', 'Hombros', 'Tríceps'],
          totalVolumeKg: 6420,
          durationMinutes: 65,
          rpe: 8.5,
          exercises: [
            {
              id: 'ex-1',
              name: 'Press de Banca Plano',
              targetMuscle: 'Pecho',
              estimated1RM: 105,
              sets: [
                { setNumber: 1, weightKg: 70, reps: 10 },
                { setNumber: 2, weightKg: 80, reps: 8 },
                { setNumber: 3, weightKg: 85, reps: 6 },
                { setNumber: 4, weightKg: 90, reps: 4 },
              ],
            },
            {
              id: 'ex-2',
              name: 'Remo con Barra',
              targetMuscle: 'Espalda',
              estimated1RM: 95,
              sets: [
                { setNumber: 1, weightKg: 60, reps: 12 },
                { setNumber: 2, weightKg: 70, reps: 10 },
                { setNumber: 3, weightKg: 75, reps: 8 },
              ],
            },
          ],
        },
      ],

      addTrainingLog: (log) =>
        set((state) => ({
          trainingLogs: [
            {
              ...log,
              id: `train-${Date.now()}`,
            },
            ...state.trainingLogs,
          ],
        })),

      deleteTrainingLog: (id) =>
        set((state) => ({
          trainingLogs: state.trainingLogs.filter((t) => t.id !== id),
        })),

      measurements: [
        {
          id: 'meas-1',
          date: new Date().toISOString().split('T')[0],
          weightKg: 76.4,
          bodyFatPercentage: 14.2,
          waistCm: 81.5,
          armsCm: 38.5,
          chestCm: 104,
        },
      ],

      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [
            {
              ...measurement,
              id: `meas-${Date.now()}`,
            },
            ...state.measurements,
          ],
        })),

      deleteMeasurement: (id) =>
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        })),

      supplements: DEFAULT_SUPPLEMENTS,

      toggleSupplement: (id, dateStr) => {
        const todayKey = dateStr || new Date().toISOString().split('T')[0];
        set((state) => ({
          supplements: state.supplements.map((s) => {
            if (s.id !== id) return s;
            const alreadyTaken = s.takenDates.includes(todayKey);
            return {
              ...s,
              takenDates: alreadyTaken
                ? s.takenDates.filter((d) => d !== todayKey)
                : [...s.takenDates, todayKey],
            };
          }),
        }));
      },

      addSupplement: (supp) =>
        set((state) => ({
          supplements: [
            ...state.supplements,
            {
              ...supp,
              id: `supp-${Date.now()}`,
              takenDates: [],
            },
          ],
        })),

      deleteSupplement: (id) =>
        set((state) => ({
          supplements: state.supplements.filter((s) => s.id !== id),
        })),

      photos: [],
      addProgressPhoto: (photo) =>
        set((state) => ({
          photos: [{ ...photo, id: `photo-${Date.now()}` }, ...state.photos],
        })),
      deleteProgressPhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),
      updatePhotoAnalysis: (id, analysis) =>
        set((state) => ({
          photos: state.photos.map((p) => (p.id === id ? { ...p, aiAnalysis: analysis } : p)),
        })),

      achievements: DEFAULT_ACHIEVEMENTS,
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        })),

      streak: { currentStreak: 3, bestStreak: 7 },

      coachMessages: [
        {
          id: 'msg-init',
          sender: 'coach',
          text: '¡Hola! Soy tu Entrenador & Nutricionista IA de RecompAI. ¿En qué te puedo asesorar hoy para acelerar tu recomposición corporal?',
          timestamp: new Date().toISOString(),
        },
      ],
      addCoachMessage: (sender, text) =>
        set((state) => ({
          coachMessages: [
            ...state.coachMessages,
            {
              id: `msg-${Date.now()}`,
              sender,
              text,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      clearCoachChat: () =>
        set({
          coachMessages: [
            {
              id: 'msg-init-reset',
              sender: 'coach',
              text: '¡Chat reiniciado! Estoy listo para evaluar tu nutrición y entrenamientos.',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
    }),
    {
      name: 'hubos_recomp_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
