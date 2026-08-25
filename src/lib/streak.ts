import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Calculates the workout streak based on logged workouts.
 * - Each workout day adds +1 to the streak.
 * - Up to 3 consecutive rest days without a workout are permitted.
 * - If > 3 days pass since the last workout relative to today, the streak resets to 0.
 */
export function calculateWorkoutStreak(
  trainingLogs: { date: string }[],
  todayKey: string
): { currentStreak: number; bestStreak: number } {
  if (!trainingLogs || trainingLogs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Get sorted unique workout dates (descending: newest first)
  const uniqueDates = Array.from(new Set(trainingLogs.map((l) => l.date)))
    .filter(Boolean)
    .sort()
    .reverse();

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const today = parseISO(todayKey);
  const latestWorkoutDate = parseISO(uniqueDates[0]);
  const daysSinceLatest = differenceInCalendarDays(today, latestWorkoutDate);

  // If more than 3 days have passed since the last workout, streak is broken
  if (daysSinceLatest > 3) {
    return { currentStreak: 0, bestStreak: Math.max(uniqueDates.length, 0) };
  }

  let streak = 0;
  let previousDate = latestWorkoutDate;

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = parseISO(uniqueDates[i]);

    if (i > 0) {
      const gapDays = differenceInCalendarDays(previousDate, currentDate);
      // If gap between consecutive workouts is more than 4 calendar days (i.e. > 3 rest days in between)
      if (gapDays > 4) {
        break;
      }
    }

    streak++;
    previousDate = currentDate;
  }

  return { currentStreak: streak, bestStreak: Math.max(streak, uniqueDates.length) };
}

/**
 * Calculates the nutrition logging streak.
 * - Requires at least 2 meals logged per day.
 * - If today has < 2 meals, checks yesterday to keep streak in warning state.
 * - If yesterday also had < 2 meals, streak is 0.
 */
export function calculateNutritionStreak(
  meals: { date: string }[],
  todayKey: string
): { currentStreak: number; hasLoggedToday: boolean } {
  if (!meals || meals.length === 0) {
    return { currentStreak: 0, hasLoggedToday: false };
  }

  // Count meals per day
  const mealsCountByDate: Record<string, number> = {};
  for (const m of meals) {
    if (m.date) {
      mealsCountByDate[m.date] = (mealsCountByDate[m.date] || 0) + 1;
    }
  }

  const todayCount = mealsCountByDate[todayKey] || 0;
  const hasLoggedToday = todayCount >= 2;

  let startDate = todayKey;

  if (!hasLoggedToday) {
    try {
      const yesterday = format(subDays(parseISO(todayKey), 1), 'yyyy-MM-dd');
      const yesterdayCount = mealsCountByDate[yesterday] || 0;
      if (yesterdayCount < 2) {
        return { currentStreak: 0, hasLoggedToday: false };
      }
      startDate = yesterday;
    } catch {
      return { currentStreak: 0, hasLoggedToday: false };
    }
  }

  let streak = 0;
  let curr = parseISO(startDate);

  while (true) {
    const key = format(curr, 'yyyy-MM-dd');
    const count = mealsCountByDate[key] || 0;
    if (count >= 2) {
      streak++;
      curr = subDays(curr, 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, hasLoggedToday };
}
