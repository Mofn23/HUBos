import { format, subDays, startOfWeek, endOfWeek, parseISO, isSameDay } from 'date-fns';

/**
 * Calculates the workout streak grouping by Mon-Sun natural weeks.
 * A past week keeps the streak alive if at least 4 unique workout days were logged.
 * Current week does not break if < 4 yet.
 * Returns the total count of unique workout days in the unbroken period.
 */
export function calculateWorkoutStreak(
  trainingLogs: { date: string }[],
  todayKey: string
): { currentStreak: number; bestStreak: number } {
  if (!trainingLogs || trainingLogs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const uniqueDates = Array.from(new Set(trainingLogs.map((l) => l.date))).sort();
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const today = parseISO(todayKey);
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

  let streakDays = 0;
  let checkWeekStart = currentWeekStart;

  // 1. Current week unique days
  const currentWeekDays = uniqueDates.filter((d) => {
    const p = parseISO(d);
    return p >= currentWeekStart && p <= today;
  });
  streakDays += currentWeekDays.length;

  // 2. Iterate backwards by natural weeks
  while (true) {
    const prevWeekStart = subDays(checkWeekStart, 7);
    const prevWeekEnd = subDays(checkWeekStart, 1);

    const prevWeekDays = uniqueDates.filter((d) => {
      const p = parseISO(d);
      return p >= prevWeekStart && p <= prevWeekEnd;
    });

    if (prevWeekDays.length >= 4) {
      streakDays += prevWeekDays.length;
      checkWeekStart = prevWeekStart;
    } else {
      break;
    }
  }

  return { currentStreak: streakDays, bestStreak: Math.max(streakDays, 7) };
}

/**
 * Calculates the nutrition logging streak (consecutive days with >= 1 meal).
 * If no meal today, checks if yesterday had meals to keep streak active in warning state.
 */
export function calculateNutritionStreak(
  meals: { date: string }[],
  todayKey: string
): { currentStreak: number; hasLoggedToday: boolean } {
  if (!meals || meals.length === 0) {
    return { currentStreak: 0, hasLoggedToday: false };
  }

  const uniqueDates = new Set(meals.map((m) => m.date));
  const hasLoggedToday = uniqueDates.has(todayKey);

  let startDate = todayKey;

  if (!hasLoggedToday) {
    try {
      const yesterday = format(subDays(parseISO(todayKey), 1), 'yyyy-MM-dd');
      if (!uniqueDates.has(yesterday)) {
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
    if (uniqueDates.has(key)) {
      streak++;
      curr = subDays(curr, 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, hasLoggedToday };
}
