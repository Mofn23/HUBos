import { AchievementItem, MealItem, TrainingLogEntry } from '@/stores/useRecompStore';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'training' | 'hydration' | 'streak' | 'special';
}

export const ALL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 'first_workout', title: 'Primer Entrenamiento', description: '¡Completaste tu primer entrenamiento!', icon: '💪', category: 'training' },
  { id: 'first_meal', title: 'Primera Comida', description: '¡Registraste tu primera comida con IA!', icon: '🍽️', category: 'nutrition' },
  { id: 'iron-giant', title: 'Gigante de Hierro', description: 'Levantaste más de 5,000kg de volumen en una sesión', icon: '🌋', category: 'training' },
  { id: 'star-chef', title: 'Cocinero Estrella', description: '10 comidas registradas con fotos para la IA', icon: '👨‍🍳', category: 'nutrition' },
  { id: 'hydration-3', title: '3 Días Hidratado', description: '3 días cumpliendo tu meta de agua', icon: '💧', category: 'hydration' },
  { id: 'hydration-7', title: 'Semana Hidratada', description: '7 días cumpliendo tu meta de agua', icon: '🌊', category: 'hydration' },
  { id: 'hydration-10', title: '10 Días Hidratado', description: '10 días de hidratación impecable', icon: '🧊', category: 'hydration' },
  { id: 'aquatic', title: 'Acuático', description: 'Tomaste 12 vasos de agua en un día', icon: '🐳', category: 'hydration' },
  { id: 'streak-7', title: 'Semana Perfecta', description: 'Alcanzaste una racha de 7 días', icon: '🔥', category: 'streak' },
  { id: 'streak-14', title: '2 Semanas Imparable', description: 'Alcanzaste una racha de 14 días', icon: '⚡', category: 'streak' },
  { id: 'streak-30', title: 'Máquina 30 Días', description: '30 días consecutivos de constancia', icon: '🏆', category: 'streak' },
  { id: 'protein-7', title: 'Fuerza Proteica', description: 'Cumpliste tu meta de proteína', icon: '🥩', category: 'nutrition' },
  { id: 'no-excuses', title: 'Cero Excusas', description: '5 entrenamientos completados', icon: '🎯', category: 'training' },
  { id: 'steel-constancy', title: 'Constancia de Acero', description: '10 entrenamientos registrados en tu bitácora', icon: '🛡️', category: 'training' },
];

export interface AchievementEvaluationInput {
  achievements: AchievementItem[];
  trainingLogs: TrainingLogEntry[];
  meals: MealItem[];
  waterLogs: Record<string, number>;
  workoutStreak: number;
  nutritionStreak: number;
}

/**
 * Checks all conditions and returns newly unlocked achievements.
 */
export function evaluateAchievements(input: AchievementEvaluationInput): AchievementItem[] {
  const { achievements, trainingLogs, meals, waterLogs, workoutStreak, nutritionStreak } = input;
  const currentUnlockedMap = new Map<string, string | undefined>();

  achievements.forEach((a) => {
    currentUnlockedMap.set(a.id, a.unlockedAt);
  });

  const newlyUnlocked: AchievementItem[] = [];
  const nowISO = new Date().toISOString();

  const qualifies = (id: string): boolean => {
    switch (id) {
      case 'first_workout':
        return trainingLogs.length >= 1;

      case 'first_meal':
        return meals.length >= 1;

      case 'iron-giant':
        return trainingLogs.some((t) => (t.totalVolumeKg || 0) >= 5000);

      case 'star-chef': {
        const withPhotos = meals.filter((m) => Boolean(m.imageBase64 || m.imageUrl));
        return withPhotos.length >= 10;
      }

      case 'hydration-3': {
        const days = Object.values(waterLogs).filter((glasses) => glasses >= 8);
        return days.length >= 3;
      }

      case 'hydration-7': {
        const days = Object.values(waterLogs).filter((glasses) => glasses >= 8);
        return days.length >= 7;
      }

      case 'hydration-10': {
        const days = Object.values(waterLogs).filter((glasses) => glasses >= 8);
        return days.length >= 10;
      }

      case 'aquatic':
        return Object.values(waterLogs).some((glasses) => glasses >= 12);

      case 'streak-7':
        return workoutStreak >= 7 || nutritionStreak >= 7;

      case 'streak-14':
        return workoutStreak >= 14 || nutritionStreak >= 14;

      case 'streak-30':
        return workoutStreak >= 30 || nutritionStreak >= 30;

      case 'protein-7': {
        const daysWithProtein = new Set(
          meals.filter((m) => m.protein >= 100).map((m) => m.date)
        );
        return daysWithProtein.size >= 1;
      }

      case 'no-excuses':
        return trainingLogs.length >= 5;

      case 'steel-constancy':
        return trainingLogs.length >= 10;

      default:
        return false;
    }
  };

  ALL_ACHIEVEMENT_DEFINITIONS.forEach((def) => {
    const isAlreadyUnlocked = Boolean(currentUnlockedMap.get(def.id));
    if (!isAlreadyUnlocked && qualifies(def.id)) {
      newlyUnlocked.push({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlockedAt: nowISO,
      });
    }
  });

  return newlyUnlocked;
}
