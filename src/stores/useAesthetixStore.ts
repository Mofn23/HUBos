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
  replaceExerciseInActiveSession: (exerciseIndex: number, newExercise: { id: string; name: string; category?: string; target?: string }) => void;
  setExerciseNotes: (exerciseIndex: number, notes: string) => void;
  
  // Rest Timer in Session
  triggerRestTimer: (seconds?: number) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  stopRestTimer: () => void;

  // Finish Workout
  finishWorkout: () => WorkoutHistoryItem | null;

  // History & PRs
  history: WorkoutHistoryItem[];
  deleteHistorySession: (sessionId: string) => void;
  addHistoricalWorkout: (item: WorkoutHistoryItem) => void;
  prs: Record<string, PersonalRecord>;

  // Cumulative Volume & Symmetry Data
  importedVolumeKg: number;
  setImportedVolumeKg: (vol: number) => void;
  totalWorkoutsCount: number;
  setTotalWorkoutsCount: (count: number) => void;
  getTotalLifetimeVolumeKg: () => number;

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

  // Active modal tracking for scroll lock and navigation dock auto-hide
  activeModalCount: number;
  openModal: () => void;
  closeModal: () => void;

  // Computed / Helpers
  recordPrDirectly: (
    exerciseId: string,
    exerciseName: string,
    weightKg: number,
    reps: number
  ) => { isNewPr: boolean; previousMax: number };
  getPreviousSessionForDay: (routineName?: string, dayName?: string) => WorkoutHistoryItem | null;
  getMuscleTiers: () => Record<AnatomicalMuscle, MuscleTierInfo>;
  getOverallRank: () => { overallTier: MuscleTierInfo; averageLevel: number; progressToNext: number };
}

// User's exact 5-day routine (PPL x UL) configured exercise by exercise
export const PPL_X_UP_ROUTINE: WorkoutRoutine = {
  id: 'routine_ppl_x_up',
  name: 'Protocolo PPL x UL',
  description: 'Rutina oficial de 5 días: Push, Pull, Pierna & Abdomen, Upper, Lower con volumen óptimo.',
  splitType: 'push_pull_legs',
  targetDaysPerWeek: 5,
  createdAt: '2026-09-17T00:00:00.000Z',
  days: [
    {
      id: 'day_push',
      dayName: 'Lunes - PUSH',
      focus: 'Pecho, Hombro y Tríceps',
      exercises: [
        {
          id: 'p1',
          exerciseId: '0025',
          name: 'Press banca plano',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'chest',
          target: 'pectorals',
          notes: 'Rango completo y retracción escapular.',
        },
        {
          id: 'p2',
          exerciseId: '0405',
          name: 'Press militar con mancuernas',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'shoulders',
          target: 'delts',
          notes: 'Sentado en banco a 80°, bajada profunda.',
        },
        {
          id: 'p3',
          exerciseId: '0596',
          name: 'Aperturas en PeckDeck',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'chest',
          target: 'pectorals',
          notes: 'Pausa de 1s en máxima contracción.',
        },
        {
          id: 'p4',
          exerciseId: '0334',
          name: 'Elevaciones laterales con mancuernas',
          targetSets: 4,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 90,
          category: 'shoulders',
          target: 'delts',
          notes: 'En plano escapular sin balanceo del torso.',
        },
        {
          id: 'p5',
          exerciseId: '0009',
          name: 'Fondos en máquina',
          targetSets: 2,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'chest',
          target: 'pectorals',
          notes: 'Ligera inclinación hacia adelante.',
        },
        {
          id: 'p6',
          exerciseId: '0201',
          name: 'Extensión de tríceps barra V',
          targetSets: 3,
          targetReps: '10',
          targetRpe: 9,
          restSeconds: 90,
          category: 'upper arms',
          target: 'triceps',
          notes: 'Bloqueo firme abajo con barra en V.',
        },
      ],
    },
    {
      id: 'day_pull',
      dayName: 'Martes - PULL',
      focus: 'Espalda & Bíceps',
      exercises: [
        {
          id: 'pl1',
          exerciseId: '2330',
          name: 'Jalón unilateral polea',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'back',
          target: 'lats',
          notes: 'Máximo estiramiento dorsal arriba.',
        },
        {
          id: 'pl2',
          exerciseId: '0606',
          name: 'Remo en barra T',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'back',
          target: 'upper back',
          notes: 'Torso fijo a 45 grados, codos guiados hacia la cadera.',
        },
        {
          id: 'pl3',
          exerciseId: '0233',
          name: 'FacePulls polea',
          targetSets: 3,
          targetReps: '10',
          targetRpe: 9,
          restSeconds: 90,
          category: 'shoulders',
          target: 'delts',
          notes: 'Tirón a la frente con rotación externa.',
        },
        {
          id: 'pl4',
          exerciseId: '0592',
          name: 'Curl Predicador Máquina',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'upper arms',
          target: 'biceps',
          notes: 'Aislamiento estricto de bíceps sin despegue de axilas.',
        },
        {
          id: 'pl5',
          exerciseId: '0165',
          name: 'Curl martillo en polea',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 90,
          category: 'upper arms',
          target: 'biceps',
          notes: 'Con cuerda para braquial y antebrazo.',
        },
        {
          id: 'pl6',
          exerciseId: '0602',
          name: 'Pájaros en PeckDeck',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 90,
          category: 'shoulders',
          target: 'delts',
          notes: 'Apertura posterior para deltoides posterior.',
        },
      ],
    },
    {
      id: 'day_legs_abs',
      dayName: 'Miércoles - Pierna y Abdomen',
      focus: 'Piernas completas & Core',
      exercises: [
        {
          id: 'lg1',
          exerciseId: '0739',
          name: 'Prensa',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 180,
          category: 'upper legs',
          target: 'quads',
          notes: 'Prensa 45°, pies al ancho de hombros.',
        },
        {
          id: 'lg2',
          exerciseId: '0599',
          name: 'Curl femoral sentado',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'upper legs',
          target: 'hamstrings',
          notes: 'Rodillas fijadas bajo el soporte.',
        },
        {
          id: 'lg3',
          exerciseId: '0585',
          name: 'Extensión de cuádriceps',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'upper legs',
          target: 'quads',
          notes: 'Pausa de 1 segundo arriba.',
        },
        {
          id: 'lg4',
          exerciseId: '0597',
          name: 'Abductores',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 90,
          category: 'upper legs',
          target: 'abductors',
          notes: 'Apertura controlada en máquina.',
        },
        {
          id: 'lg5',
          exerciseId: '0605',
          name: 'Elevación de talones máquina',
          targetSets: 3,
          targetReps: '10',
          targetRpe: 9,
          restSeconds: 90,
          category: 'lower legs',
          target: 'calves',
          notes: 'Estiramiento profundo en cada repetición.',
        },
        {
          id: 'lg6',
          exerciseId: '0175',
          name: 'Crunch en polea',
          targetSets: 3,
          targetReps: '10',
          targetRpe: 9,
          restSeconds: 90,
          category: 'waist',
          target: 'abs',
          notes: 'Arrodillado con cuerda, flexión espinal pura.',
        },
        {
          id: 'lg7',
          exerciseId: '2963',
          name: 'Elevaciones de piernas paralelas',
          targetSets: 3,
          targetReps: '10',
          targetRpe: 8.5,
          restSeconds: 90,
          category: 'waist',
          target: 'abs',
          notes: 'En silla romana, elevación recta controlada.',
        },
      ],
    },
    {
      id: 'day_upper',
      dayName: 'Jueves - Upper',
      focus: 'Torso Superior Completo',
      exercises: [
        {
          id: 'u1',
          exerciseId: '0314',
          name: 'Press de banca inclinado con mancuernas',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 150,
          category: 'chest',
          target: 'pectorals',
          notes: 'Banco a 30°, empuje potente.',
        },
        {
          id: 'u2',
          exerciseId: '0748',
          name: 'Press banca plano en multipower',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'chest',
          target: 'pectorals',
          notes: 'Trayectoria vertical fija, bajada al esternón.',
        },
        {
          id: 'u3',
          exerciseId: '0150',
          name: 'Jalón al pecho agarre prono',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'back',
          target: 'lats',
          notes: 'Barra ancha prono, llevar a la clavícula.',
        },
        {
          id: 'u4',
          exerciseId: '1350',
          name: 'Remo con apoyo en el pecho máquina',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 150,
          category: 'back',
          target: 'upper back',
          notes: 'Pecho bien apoyado, tracción escapular.',
        },
        {
          id: 'u5',
          exerciseId: '0334',
          name: 'Elevaciones laterales con mancuernas',
          targetSets: 4,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 90,
          category: 'shoulders',
          target: 'delts',
          notes: 'Enfoque en deltoides lateral sin balanceo.',
        },
      ],
    },
    {
      id: 'day_lower',
      dayName: 'Viernes - Lower',
      focus: 'Cadena Posterior & Cuádriceps',
      exercises: [
        {
          id: 'lw1',
          exerciseId: '0043',
          name: 'Sentadilla libre',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 180,
          category: 'upper legs',
          target: 'glutes',
          notes: 'Barra tras nuca, profundidad paralela estricta.',
        },
        {
          id: 'lw2',
          exerciseId: '1459',
          name: 'Peso muerto rumano con mancuernas',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 150,
          category: 'upper legs',
          target: 'glutes',
          notes: 'Bisagra de cadera, tensión pura en isquiosurales.',
        },
        {
          id: 'lw3',
          exerciseId: '0598',
          name: 'Aductores',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 8.5,
          restSeconds: 90,
          category: 'upper legs',
          target: 'adductors',
          notes: 'Cierre firme en máquina de aducción.',
        },
        {
          id: 'lw4',
          exerciseId: '0586',
          name: 'Curl femoral tumbado',
          targetSets: 3,
          targetReps: '8',
          targetRpe: 9,
          restSeconds: 120,
          category: 'upper legs',
          target: 'hamstrings',
          notes: 'Cadera pegada al banco en todo el recorrido.',
        },
      ],
    },
  ],
};

export const useAesthetixStore = create<AesthetixState>()(
  persist(
    (set, get) => ({
      routines: [PPL_X_UP_ROUTINE],
      activeRoutineId: 'routine_ppl_x_up',

      addRoutine: (routine) =>
        set((state) => ({
          routines: [routine, ...state.routines.filter((r) => r.id !== routine.id)],
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
        const routine =
          (routineId && state.routines.find((r) => r.id === routineId)) ||
          state.routines.find((r) => r.id === state.activeRoutineId) ||
          state.routines[0] ||
          PPL_X_UP_ROUTINE;

        const day = routine.days[dayIndex] || routine.days[0];
        const exercises = day?.exercises || [];

        const sessionExercises: SessionExerciseLog[] = exercises.map((ex) => {
          const initialSets: SetLog[] = Array.from({ length: ex.targetSets || 3 }).map((_, i) => ({
            id: `set_${Date.now()}_${i}`,
            setNumber: i + 1,
            weightKg: 0,
            reps: 8,
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
            { id: `set_${Date.now()}_1`, setNumber: 1, weightKg: 0, reps: 8, completed: false },
            { id: `set_${Date.now()}_2`, setNumber: 2, weightKg: 0, reps: 8, completed: false },
            { id: `set_${Date.now()}_3`, setNumber: 3, weightKg: 0, reps: 8, completed: false },
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
          reps: lastSet ? lastSet.reps : 8,
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
            { id: `set_${Date.now()}_1`, setNumber: 1, weightKg: 0, reps: 8, completed: false },
            { id: `set_${Date.now()}_2`, setNumber: 2, weightKg: 0, reps: 8, completed: false },
            { id: `set_${Date.now()}_3`, setNumber: 3, weightKg: 0, reps: 8, completed: false },
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

      replaceExerciseInActiveSession: (exerciseIndex, newExercise) => {
        const state = get();
        if (!state.activeSession) return;
        const updatedExercises = [...state.activeSession.exercises];
        const oldEx = updatedExercises[exerciseIndex];
        if (!oldEx) return;

        const replaced: SessionExerciseLog = {
          ...oldEx,
          exerciseId: newExercise.id,
          exerciseName: newExercise.name,
          category: newExercise.category || oldEx.category,
          target: newExercise.target || oldEx.target,
        };

        updatedExercises[exerciseIndex] = replaced;
        set({
          activeSession: {
            ...state.activeSession,
            exercises: updatedExercises,
          },
        });
      },

      setExerciseNotes: (exerciseIndex, notes) => {
        const state = get();
        if (!state.activeSession) return;
        const updatedExercises = [...state.activeSession.exercises];
        const oldEx = updatedExercises[exerciseIndex];
        if (!oldEx) return;

        updatedExercises[exerciseIndex] = { ...oldEx, notes };
        set({
          activeSession: {
            ...state.activeSession,
            exercises: updatedExercises,
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
          } else if (diffDays === 1 || diffDays <= 3) {
            // Consecutive or normal rest window
            streak += 1;
          } else {
            // Streak reset
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
          totalWorkoutsCount: (state.totalWorkoutsCount || 0) + 1,
        });

        return historyItem;
      },

      history: [],
      deleteHistorySession: (sessionId) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== sessionId),
        }));
      },
      addHistoricalWorkout: (item) => {
        set((state) => ({
          history: [item, ...state.history],
          totalWorkoutsCount: (state.totalWorkoutsCount || 0) + 1,
        }));
      },

      prs: {},

      // Cumulative Volume & Symmetry Data
      importedVolumeKg: 0,
      setImportedVolumeKg: (vol) => set({ importedVolumeKg: vol }),
      totalWorkoutsCount: 0,
      setTotalWorkoutsCount: (count) => set({ totalWorkoutsCount: count }),
      getTotalLifetimeVolumeKg: () => {
        const state = get();
        const historyVol = (state.history || []).reduce(
          (sum, h) => sum + (h.totalVolumeKg || 0),
          0
        );
        return historyVol;
      },

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

      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,

      restTimerDefault: 150,
      setRestTimerDefault: (sec) => set({ restTimerDefault: sec }),

      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      weightUnit: 'kg',
      setWeightUnit: (unit) => set({ weightUnit: unit }),

      activeModalCount: 0,
      openModal: () => set((s) => ({ activeModalCount: s.activeModalCount + 1 })),
      closeModal: () => set((s) => ({ activeModalCount: Math.max(0, s.activeModalCount - 1) })),

      recordPrDirectly: (exerciseId, exerciseName, weightKg, reps) => {
        const state = get();
        if (weightKg <= 0 || reps <= 0) return { isNewPr: false, previousMax: 0 };
        const estimated1RM = calculate1RM(weightKg, reps);
        const currentPr = state.prs[exerciseId];
        const previousMax = currentPr?.maxWeightKg || 0;

        // Is it a genuine new personal record?
        const isBetterWeight = weightKg > previousMax;
        const isBetter1RM = !currentPr || estimated1RM > currentPr.estimated1RM;

        if (isBetterWeight || isBetter1RM) {
          const dateStr = new Date().toISOString().split('T')[0];
          const newPr: PersonalRecord = {
            exerciseId,
            exerciseName,
            maxWeightKg: Math.max(weightKg, previousMax),
            maxReps: reps,
            estimated1RM: Math.max(estimated1RM, currentPr?.estimated1RM || 0),
            date: dateStr,
          };
          set({
            prs: {
              ...state.prs,
              [exerciseId]: newPr,
            },
          });
          return { isNewPr: true, previousMax };
        }
        return { isNewPr: false, previousMax };
      },

      getPreviousSessionForDay: (routineName, dayName) => {
        const state = get();
        const found = state.history.find(
          (h) =>
            (!routineName || h.routineName === routineName) &&
            (!dayName || h.dayName === dayName)
        );
        return found || null;
      },

      // Dynamic Tier Calculation with Symmetry Baselines
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
        const hasRecordedPr = Object.values(state.prs).some((pr) => pr.estimated1RM > 0);
        if (!hasRecordedPr) {
          return {
            overallTier: {
              ...TIERS_CATALOG.hierro_1,
              label: 'Sin datos',
              level: 0,
              percentile: undefined,
              description: 'Registra un entrenamiento para calcular tu rango.',
            },
            averageLevel: 0,
            progressToNext: 0,
          };
        }
        const tiers = state.getMuscleTiers();
        return calculateOverallRank(tiers);
      },
    }),
    {
      name: 'hubos_aesthetix_v1',
      storage: createJSONStorage(() => nativeStorage),
      // Automatically migrate routines on rehydration to ensure PPL x UL is active
      // and obsolete starter routine is purged
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        if (merged.routines) {
          // Remove old starter routine
          merged.routines = merged.routines.filter(
            (r: WorkoutRoutine) => r.id !== 'routine_starter_5day'
          );
          // If PPL_X_UP_ROUTINE is not present, add it
          if (!merged.routines.some((r: WorkoutRoutine) => r.id === 'routine_ppl_x_up')) {
            merged.routines.unshift(PPL_X_UP_ROUTINE);
          }
        } else {
          merged.routines = [PPL_X_UP_ROUTINE];
        }

        if (
          !merged.activeRoutineId ||
          merged.activeRoutineId === 'routine_starter_5day' ||
          !merged.routines.some((r: WorkoutRoutine) => r.id === merged.activeRoutineId)
        ) {
          merged.activeRoutineId = 'routine_ppl_x_up';
        }

        const savedHistory = Array.isArray(merged.history) ? merged.history : [];
        merged.history = savedHistory;
        merged.totalWorkoutsCount = savedHistory.length;
        merged.importedVolumeKg = 0;
        if (savedHistory.length === 0) {
          // Remove demonstration metrics left by earlier builds when there is no logged session.
          merged.prs = {};
          merged.currentStreak = 0;
          merged.longestStreak = 0;
          merged.lastWorkoutDate = null;
        } else {
          merged.prs = merged.prs || {};
        }

        return merged;
      },
      partialize: (state) => ({
        routines: state.routines,
        activeRoutineId: state.activeRoutineId,
        history: state.history,
        prs: state.prs,
        importedVolumeKg: state.importedVolumeKg,
        totalWorkoutsCount: state.totalWorkoutsCount,
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
        activeSession: state.activeSession,
      }),
    }
  )
);
