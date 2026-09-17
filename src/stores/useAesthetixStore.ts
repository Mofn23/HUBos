import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/nativeStorage';
import {
  WorkoutRoutine,
  ActiveWorkoutSession,
  WorkoutHistoryItem,
  PersonalRecord,
  BodyMeasurement,
  SetLog,
  SessionExerciseLog,
  MuscleTierInfo,
} from '@/types/workout';
import {
  AnatomicalMuscle,
  calculate1RM,
  getTierFor1RM,
  calculateOverallRank,
  mapTargetToAnatomy,
  TIERS_CATALOG,
} from '@/lib/muscleRanks';
import { getExerciseById, getAllExercises } from '@/lib/exercisesDb';

interface AesthetixState {
  // Routines
  routines: WorkoutRoutine[];
  activeRoutineId: string | null;
  addRoutine: (routine: WorkoutRoutine) => void;
  updateRoutine: (id: string, routine: Partial<WorkoutRoutine>) => void;
  deleteRoutine: (id: string) => void;
  setActiveRoutineId: (id: string | null) => void;

  // Active Live Workout Session (Gym Mode)
  activeSession: ActiveWorkoutSession | null;
  startWorkout: (routineId?: string, dayIndex?: number) => void;
  startCustomWorkout: (exercises: { id: string; name: string; category?: string; target?: string }[]) => void;
  cancelWorkout: () => void;
  setCurrentExerciseIndex: (index: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<SetLog>) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToActiveSession: (exercise: { id: string; name: string; category?: string; target?: string }) => void;
  removeExerciseFromActiveSession: (exerciseIndex: number) => void;
  
  // Rest Timer in Session
  triggerRestTimer: (seconds?: number) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  stopRestTimer: () => void;

  // Finish Workout
  finishWorkout: () => WorkoutHistoryItem | null;

  // History & PRs
  history: WorkoutHistoryItem[];
  deleteHistorySession: (sessionId: string) => void;
  prs: Record<string, PersonalRecord>;

  // Body Measurements & Profile
  userWeightKg: number;
  setUserWeightKg: (weight: number) => void;
  measurements: BodyMeasurement[];
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  userPhotoId: string | null;
  setUserPhotoId: (id: string | null) => void;

  // Streak & Target Days
  workoutDaysTarget: number; // e.g. 5
  setWorkoutDaysTarget: (days: number) => void;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;

  // Settings
  restTimerDefault: number; // 150 = 2:30 min
  setRestTimerDefault: (sec: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  weightUnit: 'kg' | 'lbs';
  setWeightUnit: (unit: 'kg' | 'lbs') => void;

  // Computed / Helpers
  getMuscleTiers: () => Record<AnatomicalMuscle, MuscleTierInfo>;
  getOverallRank: () => { overallTier: MuscleTierInfo; averageLevel: number; progressToNext: number };
}

// Built-in starter routine (5 days)
const DEFAULT_AESTHETIX_ROUTINE: WorkoutRoutine = {
  id: 'routine_starter_5day',
  name: 'Aesthetix 5-Day Hypertrophy Split',
  description: 'Distribución de hipertrofia y fuerza con volumen optimizado y descanso de 2:30 min.',
  splitType: 'push_pull_legs',
  targetDaysPerWeek: 5,
  createdAt: '2026-09-17T00:00:00.000Z',
  days: [
    {
      id: 'day_push',
      dayName: 'Día 1 - Empuje (Push)',
      focus: 'Pectorales, Deltoides Anterior/Lateral y Tríceps',
      exercises: [
        {
          id: 'ex_p1',
          exerciseId: '0025',
          name: 'Barbell bench press',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Pausa de 1 segundo en el pecho. Rango completo.',
          category: 'chest',
          target: 'pectorals',
        },
        {
          id: 'ex_p2',
          exerciseId: '0314',
          name: 'Incline dumbbell press',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 150,
          notes: 'Banco a 30 grados. Enfoque en haz clavicular.',
          category: 'chest',
          target: 'pectorals',
        },
        {
          id: 'ex_p3',
          exerciseId: '0334',
          name: 'Dumbbell lateral raise',
          targetSets: 4,
          targetReps: '12-15',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Escapula deprimida, elevar en plano escapular.',
          category: 'shoulders',
          target: 'delts',
        },
        {
          id: 'ex_p4',
          exerciseId: '0200',
          name: 'Cable pushdown',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 8.5,
          restSeconds: 90,
          notes: 'Bloqueo firme abajo con la cabeza lateral del tríceps.',
          category: 'upper arms',
          target: 'triceps',
        },
      ],
    },
    {
      id: 'day_pull',
      dayName: 'Día 2 - Jalón (Pull)',
      focus: 'Dorsales, Espalda Alta, Deltoides Posterior y Bíceps',
      exercises: [
        {
          id: 'ex_pl1',
          exerciseId: '0027',
          name: 'Barbell bent over row',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Espalda neutra a 45°. Tirar hacia la cadera.',
          category: 'back',
          target: 'upper back',
        },
        {
          id: 'ex_pl2',
          exerciseId: '0150',
          name: 'Lat pulldown',
          targetSets: 4,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 150,
          notes: 'Codos apuntando hacia adentro, conexión mente-músculo.',
          category: 'back',
          target: 'lats',
        },
        {
          id: 'ex_pl3',
          exerciseId: '0300',
          name: 'Dumbbell bicep curl',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 8.5,
          restSeconds: 90,
          notes: 'Supinación controlada en el punto máximo.',
          category: 'upper arms',
          target: 'biceps',
        },
        {
          id: 'ex_pl4',
          exerciseId: '0400',
          name: 'Face pull',
          targetSets: 3,
          targetReps: '12-15',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Rotación externa al final hacia la frente.',
          category: 'shoulders',
          target: 'delts',
        },
      ],
    },
    {
      id: 'day_legs',
      dayName: 'Día 3 - Pierna Potencia',
      focus: 'Cuádriceps, Isquiotibiales, Glúteos y Gemelos',
      exercises: [
        {
          id: 'ex_lg1',
          exerciseId: '0043',
          name: 'Barbell full squat',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Profundidad paralela o profunda, talones anclados.',
          category: 'upper legs',
          target: 'quads',
        },
        {
          id: 'ex_lg2',
          exerciseId: '0500',
          name: 'Leg press',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 8,
          restSeconds: 150,
          notes: 'Descenso controlado, sin hiperextender rodillas.',
          category: 'upper legs',
          target: 'quads',
        },
        {
          id: 'ex_lg3',
          exerciseId: '0600',
          name: 'Lying leg curl',
          targetSets: 4,
          targetReps: '10-12',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Aislamiento de isquiosurales con contracción de 1s.',
          category: 'upper legs',
          target: 'hamstrings',
        },
        {
          id: 'ex_lg4',
          exerciseId: '0700',
          name: 'Standing calf raise',
          targetSets: 4,
          targetReps: '12-15',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Máximo estiramiento abajo y subida explosiva.',
          category: 'lower legs',
          target: 'calves',
        },
      ],
    },
    {
      id: 'day_torso',
      dayName: 'Día 4 - Torso Estético',
      focus: 'Densidad de Pectorales, Espalda y Brazos',
      exercises: [
        {
          id: 'ex_t1',
          exerciseId: '0314',
          name: 'Incline dumbbell press',
          targetSets: 4,
          targetReps: '8-10',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Carga pesada con técnica estricta.',
          category: 'chest',
          target: 'pectorals',
        },
        {
          id: 'ex_t2',
          exerciseId: '0150',
          name: 'Lat pulldown',
          targetSets: 4,
          targetReps: '8-10',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Agarre neutro cerrado para máxima activación dorsal.',
          category: 'back',
          target: 'lats',
        },
        {
          id: 'ex_t3',
          exerciseId: '0334',
          name: 'Dumbbell lateral raise',
          targetSets: 4,
          targetReps: '15',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Hombros 3D. Control excéntrico.',
          category: 'shoulders',
          target: 'delts',
        },
        {
          id: 'ex_t4',
          exerciseId: '0031',
          name: 'Barbell curl',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: 8.5,
          restSeconds: 90,
          notes: 'Bíceps estricto sin balanceo del torso.',
          category: 'upper arms',
          target: 'biceps',
        },
      ],
    },
    {
      id: 'day_lower_arms',
      dayName: 'Día 5 - Pierna Enfoque Glúteo & Isquios',
      focus: 'Cadena Posterior y Abdomen',
      exercises: [
        {
          id: 'ex_la1',
          exerciseId: '0032',
          name: 'Romanian deadlift',
          targetSets: 4,
          targetReps: '8-10',
          targetRpe: 8.5,
          restSeconds: 150,
          notes: 'Empujar la cadera hacia atrás. Estiramiento masivo.',
          category: 'upper legs',
          target: 'hamstrings',
        },
        {
          id: 'ex_la2',
          exerciseId: '0800',
          name: 'Barbell hip thrust',
          targetSets: 4,
          targetReps: '10-12',
          targetRpe: 9,
          restSeconds: 150,
          notes: 'Pausa de 2 segundos arriba apretando glúteos.',
          category: 'upper legs',
          target: 'glutes',
        },
        {
          id: 'ex_la3',
          exerciseId: '0001',
          name: '3/4 sit-up',
          targetSets: 3,
          targetReps: '15-20',
          targetRpe: 8.5,
          restSeconds: 60,
          notes: 'Flexión espinal controlada. Tensión continua.',
          category: 'waist',
          target: 'abs',
        },
      ],
    },
  ],
};

export const useAesthetixStore = create<AesthetixState>()(
  persist(
    (set, get) => ({
      routines: [DEFAULT_AESTHETIX_ROUTINE],
      activeRoutineId: 'routine_starter_5day',

      addRoutine: (routine) =>
        set((state) => ({
          routines: [routine, ...state.routines],
          activeRoutineId: routine.id,
        })),

      updateRoutine: (id, updated) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        })),

      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          activeRoutineId: state.activeRoutineId === id ? null : state.activeRoutineId,
        })),

      setActiveRoutineId: (id) => set({ activeRoutineId: id }),

      // Active Live Session
      activeSession: null,

      startWorkout: (routineId, dayIndex = 0) => {
        const state = get();
        const rId = routineId || state.activeRoutineId || state.routines[0]?.id;
        const routine = state.routines.find((r) => r.id === rId) || state.routines[0];

        if (!routine) return;

        const day = routine.days[dayIndex] || routine.days[0];

        const sessionExercises: SessionExerciseLog[] = (day?.exercises || []).map((ex) => {
          // Pre-populate with target sets
          const initialSets: SetLog[] = Array.from({ length: ex.targetSets || 3 }).map((_, i) => ({
            id: `set_${Date.now()}_${i}`,
            setNumber: i + 1,
            weightKg: 0,
            reps: 10,
            completed: false,
          }));

          return {
            exerciseId: ex.exerciseId,
            exerciseName: ex.name,
            category: ex.category || 'chest',
            target: ex.target || 'pectorals',
            sets: initialSets,
            notes: ex.notes,
          };
        });

        const newSession: ActiveWorkoutSession = {
          id: `session_${Date.now()}`,
          routineId: routine.id,
          routineName: routine.name,
          dayName: day?.dayName || 'Entrenamiento',
          startTime: Date.now(),
          exercises: sessionExercises,
          currentExerciseIndex: 0,
          isRestTimerRunning: false,
          restTimerSeconds: state.restTimerDefault,
          restTimerEndTimestamp: null,
        };

        set({ activeSession: newSession });
      },

      startCustomWorkout: (exercises) => {
        const state = get();
        const sessionExercises: SessionExerciseLog[] = exercises.map((ex) => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category || 'chest',
          target: ex.target || 'pectorals',
          sets: [
            { id: `set_${Date.now()}_1`, setNumber: 1, weightKg: 0, reps: 10, completed: false },
            { id: `set_${Date.now()}_2`, setNumber: 2, weightKg: 0, reps: 10, completed: false },
            { id: `set_${Date.now()}_3`, setNumber: 3, weightKg: 0, reps: 10, completed: false },
          ],
        }));

        const newSession: ActiveWorkoutSession = {
          id: `session_${Date.now()}`,
          routineName: 'Entrenamiento Libre',
          dayName: 'Sesión Libre',
          startTime: Date.now(),
          exercises: sessionExercises,
          currentExerciseIndex: 0,
          isRestTimerRunning: false,
          restTimerSeconds: state.restTimerDefault,
          restTimerEndTimestamp: null,
        };

        set({ activeSession: newSession });
      },

      cancelWorkout: () => set({ activeSession: null }),

      setCurrentExerciseIndex: (index) =>
        set((state) =>
          state.activeSession
            ? { activeSession: { ...state.activeSession, currentExerciseIndex: index } }
            : {}
        ),

      updateSet: (exerciseIndex, setIndex, data) => {
        const state = get();
        if (!state.activeSession) return;

        const updatedExercises = [...state.activeSession.exercises];
        const exercise = { ...updatedExercises[exerciseIndex] };
        if (!exercise) return;

        const updatedSets = [...exercise.sets];
        const prevCompleted = updatedSets[setIndex]?.completed;
        updatedSets[setIndex] = { ...updatedSets[setIndex], ...data };
        exercise.sets = updatedSets;
        updatedExercises[exerciseIndex] = exercise;

        // Auto-trigger rest timer when marking a set completed
        let triggerTimer = false;
        if (!prevCompleted && data.completed === true) {
          triggerTimer = true;
        }

        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                exercises: updatedExercises,
                ...(triggerTimer
                  ? {
                      isRestTimerRunning: true,
                      restTimerSeconds: s.restTimerDefault,
                      restTimerEndTimestamp: Date.now() + s.restTimerDefault * 1000,
                    }
                  : {}),
              }
            : null,
        }));
      },

      addSet: (exerciseIndex) => {
        const state = get();
        if (!state.activeSession) return;

        const updatedExercises = [...state.activeSession.exercises];
        const exercise = { ...updatedExercises[exerciseIndex] };
        if (!exercise) return;

        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: SetLog = {
          id: `set_${Date.now()}`,
          setNumber: exercise.sets.length + 1,
          weightKg: lastSet ? lastSet.weightKg : 0,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
        };

        exercise.sets = [...exercise.sets, newSet];
        updatedExercises[exerciseIndex] = exercise;

        set({
          activeSession: { ...state.activeSession, exercises: updatedExercises },
        });
      },

      removeSet: (exerciseIndex, setIndex) => {
        const state = get();
        if (!state.activeSession) return;

        const updatedExercises = [...state.activeSession.exercises];
        const exercise = { ...updatedExercises[exerciseIndex] };
        if (!exercise || exercise.sets.length <= 1) return;

        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
        exercise.sets = exercise.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        updatedExercises[exerciseIndex] = exercise;

        set({
          activeSession: { ...state.activeSession, exercises: updatedExercises },
        });
      },

      addExerciseToActiveSession: (exercise) => {
        const state = get();
        if (!state.activeSession) return;

        const newEx: SessionExerciseLog = {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          category: exercise.category || 'chest',
          target: exercise.target || 'pectorals',
          sets: [
            { id: `set_${Date.now()}_1`, setNumber: 1, weightKg: 0, reps: 10, completed: false },
            { id: `set_${Date.now()}_2`, setNumber: 2, weightKg: 0, reps: 10, completed: false },
            { id: `set_${Date.now()}_3`, setNumber: 3, weightKg: 0, reps: 10, completed: false },
          ],
        };

        set({
          activeSession: {
            ...state.activeSession,
            exercises: [...state.activeSession.exercises, newEx],
          },
        });
      },

      removeExerciseFromActiveSession: (exerciseIndex) => {
        const state = get();
        if (!state.activeSession) return;
        const updated = state.activeSession.exercises.filter((_, i) => i !== exerciseIndex);
        const nextIndex = Math.min(
          state.activeSession.currentExerciseIndex,
          Math.max(0, updated.length - 1)
        );
        set({
          activeSession: {
            ...state.activeSession,
            exercises: updated,
            currentExerciseIndex: nextIndex,
          },
        });
      },

      // Rest Timer Actions
      triggerRestTimer: (seconds) => {
        const state = get();
        const duration = seconds || state.restTimerDefault;
        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  isRestTimerRunning: true,
                  restTimerSeconds: duration,
                  restTimerEndTimestamp: Date.now() + duration * 1000,
                },
              }
            : {}
        );
      },

      adjustRestTimer: (deltaSeconds) => {
        const state = get();
        if (!state.activeSession || !state.activeSession.restTimerEndTimestamp) return;

        const newEnd = Math.max(Date.now() + 5000, state.activeSession.restTimerEndTimestamp + deltaSeconds * 1000);
        const remaining = Math.max(5, Math.round((newEnd - Date.now()) / 1000));

        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  restTimerSeconds: remaining,
                  restTimerEndTimestamp: newEnd,
                },
              }
            : {}
        );
      },

      stopRestTimer: () =>
        set((s) =>
          s.activeSession
            ? {
                activeSession: {
                  ...s.activeSession,
                  isRestTimerRunning: false,
                  restTimerEndTimestamp: null,
                },
              }
            : {}
        ),

      // Finish Workout
      finishWorkout: () => {
        const state = get();
        if (!state.activeSession) return null;

        const session = state.activeSession;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const durationMinutes = Math.max(1, Math.round((Date.now() - session.startTime) / (1000 * 60)));

        let totalVolume = 0;
        let totalSets = 0;
        let newPrCount = 0;
        const updatedPrs = { ...state.prs };

        session.exercises.forEach((ex) => {
          ex.sets.forEach((set) => {
            if (set.completed && set.weightKg > 0 && set.reps > 0) {
              totalVolume += set.weightKg * set.reps;
              totalSets += 1;

              const estimated1RM = calculate1RM(set.weightKg, set.reps);
              const currentPr = updatedPrs[ex.exerciseId];

              if (!currentPr || estimated1RM > currentPr.estimated1RM) {
                newPrCount += 1;
                updatedPrs[ex.exerciseId] = {
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName,
                  maxWeightKg: set.weightKg,
                  maxReps: set.reps,
                  estimated1RM,
                  date: dateStr,
                };
              }
            }
          });
        });

        const historyItem: WorkoutHistoryItem = {
          id: session.id,
          routineName: session.routineName || 'Entrenamiento',
          dayName: session.dayName || 'Sesión',
          date: dateStr,
          durationMinutes,
          totalVolumeKg: Math.round(totalVolume),
          totalSets,
          exercises: session.exercises,
          prCount: newPrCount,
        };

        // Update streak with smart rest tolerance
        let streak = state.currentStreak;
        let longest = state.longestStreak;
        const lastDate = state.lastWorkoutDate;

        if (!lastDate) {
          streak = 1;
        } else {
          const diffDays = Math.round(
            (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            // Same day, streak unchanged
          } else if (diffDays === 1) {
            // Consecutive day
            streak += 1;
          } else if (diffDays <= 3) {
            // Allowed rest days (e.g. weekend rest) - doesn't break streak!
            streak += 1;
          } else {
            // Streak broken
            streak = 1;
          }
        }

        if (streak > longest) longest = streak;

        set({
          activeSession: null,
          history: [historyItem, ...state.history],
          prs: updatedPrs,
          currentStreak: streak,
          longestStreak: longest,
          lastWorkoutDate: dateStr,
        });

        return historyItem;
      },

      history: [],
      deleteHistorySession: (sessionId) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== sessionId),
        }));
      },
      prs: {},

      userWeightKg: 75,
      setUserWeightKg: (weight) => set({ userWeightKg: weight }),

      measurements: [],
      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [
            { id: `measure_${Date.now()}`, ...measurement },
            ...state.measurements,
          ],
          userWeightKg: measurement.weightKg,
        })),

      userPhotoId: null,
      setUserPhotoId: (id) => set({ userPhotoId: id }),

      workoutDaysTarget: 5,
      setWorkoutDaysTarget: (days) => set({ workoutDaysTarget: days }),

      currentStreak: 1,
      longestStreak: 1,
      lastWorkoutDate: null,

      restTimerDefault: 150,
      setRestTimerDefault: (sec) => set({ restTimerDefault: sec }),

      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      weightUnit: 'kg',
      setWeightUnit: (unit) => set({ weightUnit: unit }),

      // Dynamic Tier Calculation
      getMuscleTiers: () => {
        const state = get();
        const prs = state.prs;
        const weight = state.userWeightKg || 75;

        // Group PRs by AnatomicalMuscle
        const muscle1RMs: Record<AnatomicalMuscle, number> = {
          pecho: 0,
          espalda: 0,
          hombros: 0,
          biceps: 0,
          triceps: 0,
          piernas: 0,
          gluteos: 0,
          pantorrillas: 0,
          abdomen: 0,
        };

        Object.values(prs).forEach((pr) => {
          const ex = getExerciseById(pr.exerciseId);
          const muscle = mapTargetToAnatomy(ex?.target || '', ex?.body_part || '');
          if (pr.estimated1RM > muscle1RMs[muscle]) {
            muscle1RMs[muscle] = pr.estimated1RM;
          }
        });

        const tiers: Record<AnatomicalMuscle, MuscleTierInfo> = {} as any;
        (Object.keys(muscle1RMs) as AnatomicalMuscle[]).forEach((muscle) => {
          tiers[muscle] = getTierFor1RM(muscle, muscle1RMs[muscle], weight);
        });

        return tiers;
      },

      getOverallRank: () => {
        const state = get();
        const tiers = state.getMuscleTiers();
        return calculateOverallRank(tiers);
      },
    }),
    {
      name: 'hubos_aesthetix_v1',
      storage: createJSONStorage(() => nativeStorage),
      partialize: (state) => ({
        routines: state.routines,
        activeRoutineId: state.activeRoutineId,
        history: state.history,
        prs: state.prs,
        userWeightKg: state.userWeightKg,
        measurements: state.measurements,
        userPhotoId: state.userPhotoId,
        workoutDaysTarget: state.workoutDaysTarget,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastWorkoutDate: state.lastWorkoutDate,
        restTimerDefault: state.restTimerDefault,
        soundEnabled: state.soundEnabled,
        weightUnit: state.weightUnit,
        activeSession: state.activeSession, // persists active gym session even if app is closed!
      }),
    }
  )
);
