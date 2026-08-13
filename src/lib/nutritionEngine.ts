import { MealItem, SupplementEntry } from '@/stores/useRecompStore';

export interface DailyNutritionSummary {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  calorieDifference: number; // target - consumed
  status: 'optimal' | 'deficit' | 'surplus';
  glycogenPumpPercent: number; // 0 - 100%
  mealsCount: number;
}

export function calculateDailyNutrition(
  meals: MealItem[],
  dateStr: string,
  targetCalories: number,
  targetCarbs: number
): DailyNutritionSummary {
  const dayMeals = meals.filter((m) => m.date === dateStr);

  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;

  for (const meal of dayMeals) {
    consumedCalories += Number(meal.calories) || 0;
    consumedProtein += Number(meal.protein) || 0;
    consumedCarbs += Number(meal.carbs) || 0;
    consumedFat += Number(meal.fat) || 0;
  }

  const calorieDiff = targetCalories - consumedCalories;
  let status: 'optimal' | 'deficit' | 'surplus' = 'optimal';
  if (calorieDiff > 250) {
    status = 'deficit';
  } else if (calorieDiff < -250) {
    status = 'surplus';
  }

  // Glycogen Pump Meter calculation (carbs consumed vs target carbs)
  const glycogenPumpPercent = Math.min(
    100,
    Math.round((consumedCarbs / Math.max(targetCarbs, 100)) * 100)
  );

  return {
    consumedCalories,
    consumedProtein,
    consumedCarbs,
    consumedFat,
    calorieDifference: calorieDiff,
    status,
    glycogenPumpPercent,
    mealsCount: dayMeals.length,
  };
}

export function getSupplementStatus(
  supplements: SupplementEntry[],
  dateStr: string
): { total: number; taken: number; percentage: number } {
  const total = supplements.length;
  if (total === 0) return { total: 0, taken: 0, percentage: 100 };

  const taken = supplements.filter((s) => s.takenDates.includes(dateStr)).length;
  const percentage = Math.round((taken / total) * 100);

  return { total, taken, percentage };
}
