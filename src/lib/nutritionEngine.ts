import { MealItem, SupplementEntry } from '@/stores/useRecompStore';

export interface DailyNutritionSummary {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  mealsCount: number;
}

export function calculateDailyNutrition(
  meals: MealItem[],
  dateStr: string
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

  return {
    consumedCalories,
    consumedProtein,
    consumedCarbs,
    consumedFat,
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
