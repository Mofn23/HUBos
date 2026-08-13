import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateWorkoutStreak, calculateNutritionStreak } from '@/lib/streak';
import { getTodayKey } from '@/lib/date';

export type RecompTab = 'dashboard' | 'meals' | 'training' | 'progress' | 'coach' | 'profile';

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  category?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  notes?: string;
  imageBase64?: string;
  imageUrl?: string;
  isAiGenerated?: boolean;
}

export interface FavoriteMealItem {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  protein?: number;
  carbs?: number;
  fat?: number;
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
  images?: string[];
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

export interface InAppAlert {
  id: string;
  type: 'sodium' | 'protein' | 'creatine' | 'streak' | 'general';
  title: string;
  message: string;
  timestamp: string;
}

interface RecompState {
  // Navigation & Reactive Date
  currentTab: RecompTab;
  setCurrentTab: (tab: RecompTab) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;

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
  getMealsByDate: (date: string) => MealItem[];

  // Favorite Meals
  favoriteMeals: FavoriteMealItem[];
  addFavoriteMeal: (meal: Omit<FavoriteMealItem, 'id'>) => void;
  deleteFavoriteMeal: (id: string) => void;

  // Water Tracker (by date key)
  waterLogs: Record<string, number>; // dateStr -> glasses count
  getWaterByDate: (date: string) => number;
  addWaterGlass: (dateStr?: string) => void;
  removeWaterGlass: (dateStr?: string) => void;

  // Training & Workouts
  trainingLogs: TrainingLogEntry[];
  addTrainingLog: (log: Omit<TrainingLogEntry, 'id'>) => void;
  deleteTrainingLog: (id: string) => void;
  getTrainingLogByDate: (date: string) => TrainingLogEntry | undefined;

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

  // Achievements
  achievements: AchievementItem[];
  unlockAchievement: (id: string) => void;

  // Streaks
  streak: { currentStreak: number; bestStreak: number };
  nutritionStreak: { currentStreak: number; hasLoggedToday: boolean };
  updateStreaks: () => void;

  // In-App Alerts (Dynamic Island)
  alerts: InAppAlert[];
  addAlert: (alert: Omit<InAppAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;

  // AI Coach Chat
  coachMessages: ChatCoachMessage[];
  addCoachMessage: (sender: 'user' | 'coach', text: string) => void;
  clearCoachChat: () => void;
}

const DEFAULT_SUPPLEMENTS: SupplementEntry[] = [
  { id: 'supp-creatine', name: 'Creatina', dosage: '3-5g', timeOfDay: '08:00', icon: '💊', takenDates: [] },
];

const DEFAULT_FAVORITES: FavoriteMealItem[] = [
  { id: 'fav-1', name: 'Me comí un banano', calories: 105, emoji: '🍌', carbs: 27, protein: 1, fat: 0 },
  { id: 'fav-2', name: 'Salchipapa clásica', calories: 650, emoji: '🍟', carbs: 60, protein: 18, fat: 38 },
];

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'hydration-3', title: '3 Días Hidratado', description: '3 días seguidos cumpliendo meta de agua', icon: '💧', category: 'hydration', unlockedAt: '2026-08-10' },
  { id: 'first_meal', title: 'Primera Comida', description: 'Registrar tu primera comida con IA', icon: '🍽️', category: 'nutrition', unlockedAt: '2026-08-10' },
  { id: 'first_workout', title: 'Primer Entrenamiento', description: 'Completar tu primer entrenamiento', icon: '💪', category: 'training', unlockedAt: '2026-08-10' },
  { id: 'star-chef', title: 'Cocinero Estrella', description: '10 comidas registradas con fotos para la IA', icon: '👨‍🍳', category: 'nutrition', unlockedAt: '2026-08-11' },
  { id: 'iron-giant', title: 'Gigante de Hierro', description: 'Levantar más de 5,000kg de volumen en una sola sesión', icon: '🌋', category: 'training', unlockedAt: '2026-08-11' },
];

export const useRecompStore = create<RecompState>()(
  persist(
    (set, get) => ({
      currentTab: 'dashboard',
      setCurrentTab: (tab) => set({ currentTab: tab }),

      selectedDate: getTodayKey(),
      setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().updateStreaks();
      },

      targetCalories: 2275,
      targetProtein: 150,
      targetCarbs: 250,
      targetFat: 75,
      targetWaterGlasses: 12,

      setNutritionalTargets: (targets) =>
        set((state) => ({
          targetCalories: targets.calories ?? state.targetCalories,
          targetProtein: targets.protein ?? state.targetProtein,
          targetCarbs: targets.carbs ?? state.targetCarbs,
          targetFat: targets.fat ?? state.targetFat,
          targetWaterGlasses: targets.water ?? state.targetWaterGlasses,
        })),

      meals: [],

      addMeal: (meal) => {
        const newMeal: MealItem = {
          ...meal,
          id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          category: meal.category || 'almuerzo',
        };
        set((state) => ({ meals: [newMeal, ...state.meals] }));
        get().updateStreaks();
      },

      updateMeal: (id, updated) => {
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...updated } : m)),
        }));
        get().updateStreaks();
      },

      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        }));
        get().updateStreaks();
      },

      getMealsByDate: (date) => {
        return get().meals.filter((m) => m.date === date);
      },

      favoriteMeals: DEFAULT_FAVORITES,
      addFavoriteMeal: (meal) =>
        set((state) => ({
          favoriteMeals: [{ ...meal, id: `fav-${Date.now()}` }, ...state.favoriteMeals],
        })),
      deleteFavoriteMeal: (id) =>
        set((state) => ({
          favoriteMeals: state.favoriteMeals.filter((f) => f.id !== id),
        })),

      waterLogs: {},
      getWaterByDate: (date) => {
        return get().waterLogs[date] || 0;
      },

      addWaterGlass: (dateStr) => {
        const key = dateStr || get().selectedDate || getTodayKey();
        set((state) => {
          const current = state.waterLogs[key] || 0;
          return { waterLogs: { ...state.waterLogs, [key]: Math.min(current + 1, 20) } };
        });
      },

      removeWaterGlass: (dateStr) => {
        const key = dateStr || get().selectedDate || getTodayKey();
        set((state) => {
          const current = state.waterLogs[key] || 0;
          return { waterLogs: { ...state.waterLogs, [key]: Math.max(current - 1, 0) } };
        });
      },

      trainingLogs: [],

      addTrainingLog: (log) => {
        set((state) => ({
          trainingLogs: [{ ...log, id: `train-${Date.now()}` }, ...state.trainingLogs],
        }));
        get().updateStreaks();
      },

      deleteTrainingLog: (id) => {
        set((state) => ({
          trainingLogs: state.trainingLogs.filter((t) => t.id !== id),
        }));
        get().updateStreaks();
      },

      getTrainingLogByDate: (date) => {
        return get().trainingLogs.find((t) => t.date === date);
      },

      measurements: [
        {
          id: 'meas-1',
          date: getTodayKey(),
          weightKg: 76.4,
          bodyFatPercentage: 14.2,
          waistCm: 81.5,
          armsCm: 38.5,
          chestCm: 104,
        },
      ],

      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [{ ...measurement, id: `meas-${Date.now()}` }, ...state.measurements],
        })),

      deleteMeasurement: (id) =>
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        })),

      supplements: DEFAULT_SUPPLEMENTS,

      toggleSupplement: (id, dateStr) => {
        const todayKey = dateStr || get().selectedDate || getTodayKey();
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
          supplements: [...state.supplements, { ...supp, id: `supp-${Date.now()}`, takenDates: [] }],
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

      achievements: DEFAULT_ACHIEVEMENTS,
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        })),

      streak: { currentStreak: 1, bestStreak: 7 },
      nutritionStreak: { currentStreak: 2, hasLoggedToday: false },

      updateStreaks: () => {
        const today = getTodayKey();
        const workoutStreak = calculateWorkoutStreak(get().trainingLogs, today);
        const nutStreak = calculateNutritionStreak(get().meals, today);
        set({ streak: workoutStreak, nutritionStreak: nutStreak });
      },

      alerts: [],
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            { ...alert, id: `alert-${Date.now()}`, timestamp: new Date().toISOString() },
          ],
        })),
      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      coachMessages: [
        {
          id: 'msg-init',
          sender: 'coach',
          text: '¡Hola Samuel! Soy tu Entrenador & Nutricionista IA de RecompAI. ¿En qué te puedo asesorar hoy para acelerar tu recomposición corporal?',
          timestamp: new Date().toISOString(),
        },
      ],
      addCoachMessage: (sender, text) =>
        set((state) => ({
          coachMessages: [
            ...state.coachMessages,
            { id: `msg-${Date.now()}`, sender, text, timestamp: new Date().toISOString() },
          ],
        })),
      clearCoachChat: () =>
        set({
          coachMessages: [
            {
              id: 'msg-reset',
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
