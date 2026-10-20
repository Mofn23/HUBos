import { WorkoutHistoryItem } from '@/types/workout';

export interface AesthetixDailyActivity {
  movementCalories: number;
  exerciseMinutes: number;
  completedSets: number;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyAesthetixActivity(
  history: WorkoutHistoryItem[],
  dateKey: string
): AesthetixDailyActivity {
  const sessions = history.filter((session) => session.date?.slice(0, 10) === dateKey);

  return sessions.reduce<AesthetixDailyActivity>(
    (total, session) => {
      const minutes = Math.max(0, Number(session.durationMinutes) || 0);
      const volume = Math.max(0, Number(session.totalVolumeKg) || 0);
      const loggedSets = (session.exercises || []).reduce(
        (count, exercise) => count + (exercise.sets || []).filter((set) => set.completed).length,
        0
      );
      const sets = Math.max(0, Number(session.totalSets) || 0, loggedSets);

      // Aesthetix has no motion sensor; movement calories are an estimate from logged gym time and volume.
      const estimatedCalories = minutes > 0 || volume > 0
        ? Math.round(minutes * 8.5 + volume * 0.02)
        : 0;

      total.movementCalories += estimatedCalories;
      total.exerciseMinutes += minutes;
      total.completedSets += sets;
      return total;
    },
    { movementCalories: 0, exerciseMinutes: 0, completedSets: 0 }
  );
}
