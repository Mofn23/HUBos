import exercisesData from '@/data/exercises.json';
import { Exercise } from '@/types/workout';

const BASE_RAW_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';

const allExercises: Exercise[] = exercisesData as Exercise[];

export const BODY_PART_TRANSLATIONS: Record<string, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  'upper arms': 'Brazos',
  'lower arms': 'Antebrazos',
  shoulders: 'Hombros',
  'upper legs': 'Piernas',
  'lower legs': 'Pantorrillas',
  waist: 'Abdomen & Core',
  neck: 'Cuello',
  cardio: 'Cardio',
};

export const EQUIPMENT_TRANSLATIONS: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuerna',
  cable: 'Polea / Cable',
  'body weight': 'Peso Corporal',
  leverage_machine: 'Máquina Palanca',
  'smith machine': 'Máquina Smith',
  band: 'Banda Elástica',
  kettlebell: 'Pesa Rusa (Kettlebell)',
  assisted: 'Asistido',
  medicine_ball: 'Balón Medicinal',
  wheel_roller: 'Rueda Abdominal',
  roller: 'Rodillo Foam',
};

export function getAllExercises(): Exercise[] {
  return allExercises;
}

export function getExerciseById(id: string): Exercise | undefined {
  return allExercises.find((ex) => ex.id === id);
}

export function getExerciseMediaUrls(exercise?: { image?: string; gif_url?: string } | null): {
  imageUrl: string;
  gifUrl: string;
} {
  if (!exercise) return { imageUrl: '', gifUrl: '' };
  const imgPath = (exercise.image || '').trim();
  const gifPath = (exercise.gif_url || '').trim();

  return {
    imageUrl: imgPath
      ? imgPath.startsWith('http')
        ? imgPath
        : `${BASE_RAW_URL}/${imgPath.replace(/^\/+/, '')}`
      : '',
    gifUrl: gifPath
      ? gifPath.startsWith('http')
        ? gifPath
        : `${BASE_RAW_URL}/${gifPath.replace(/^\/+/, '')}`
      : '',
  };
}

export function getExerciseImageUrl(exercise?: { image?: string; gif_url?: string } | null): string {
  return getExerciseMediaUrls(exercise).imageUrl;
}

export function getExerciseGifUrl(exercise?: { image?: string; gif_url?: string } | null): string {
  return getExerciseMediaUrls(exercise).gifUrl;
}

export function searchExercises(
  query: string = '',
  filters?: {
    bodyPart?: string;
    equipment?: string;
    target?: string;
  }
): Exercise[] {
  const cleanQ = query.trim().toLowerCase();

  return allExercises.filter((ex) => {
    // Body part filter
    if (filters?.bodyPart && filters.bodyPart !== 'all') {
      if (ex.body_part !== filters.bodyPart) return false;
    }

    // Equipment filter
    if (filters?.equipment && filters.equipment !== 'all') {
      if (!ex.equipment.toLowerCase().includes(filters.equipment.toLowerCase())) return false;
    }

    // Target filter
    if (filters?.target && filters.target !== 'all') {
      if (ex.target.toLowerCase() !== filters.target.toLowerCase()) return false;
    }

    // Text search
    if (cleanQ) {
      const matchName = ex.name.toLowerCase().includes(cleanQ);
      const matchTarget = ex.target.toLowerCase().includes(cleanQ);
      const matchCategory = ex.category.toLowerCase().includes(cleanQ);
      const translatedBodyPart = (BODY_PART_TRANSLATIONS[ex.body_part] || '').toLowerCase();
      const matchTranslated = translatedBodyPart.includes(cleanQ);

      return matchName || matchTarget || matchCategory || matchTranslated;
    }

    return true;
  });
}

export function getAvailableBodyParts(): { key: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  allExercises.forEach((ex) => {
    counts[ex.body_part] = (counts[ex.body_part] || 0) + 1;
  });

  return Object.keys(counts).map((key) => ({
    key,
    label: BODY_PART_TRANSLATIONS[key] || key,
    count: counts[key],
  }));
}

export function getAvailableEquipment(): { key: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  allExercises.forEach((ex) => {
    const eq = ex.equipment.toLowerCase();
    counts[eq] = (counts[eq] || 0) + 1;
  });

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 12)
    .map((key) => ({
      key,
      label: EQUIPMENT_TRANSLATIONS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      count: counts[key],
    }));
}
