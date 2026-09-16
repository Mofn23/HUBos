import { parseISO, getDay } from 'date-fns';

export interface DailyRoutineInfo {
  title: string;
  subtitle: string;
  focus: string;
  icon: string;
  isRest: boolean;
}

/**
 * Returns the exact daily workout routine according to the user's updated weekly split:
 * - Lunes: Jalón (Pull)
 * - Martes: Empuje (Push)
 * - Miércoles: Pierna
 * - Jueves: Torso completo
 * - Viernes: Pierna
 * - Sábado & Domingo: Descanso Activo
 */
export function getDailyRoutine(dateStr: string): DailyRoutineInfo {
  try {
    const date = parseISO(dateStr);
    const day = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    switch (day) {
      case 1: // Lunes
        return {
          title: 'Jalón (Pull)',
          subtitle: 'Espalda, Bíceps & Deltoides Posterior',
          focus: 'Jalón',
          icon: '🏋️‍♂️',
          isRest: false,
        };
      case 2: // Martes
        return {
          title: 'Empuje (Push)',
          subtitle: 'Pecho, Hombro & Tríceps',
          focus: 'Empuje',
          icon: '💪',
          isRest: false,
        };
      case 3: // Miércoles
        return {
          title: 'Pierna',
          subtitle: 'Cuádriceps, Femoral & Gemelos',
          focus: 'Pierna',
          icon: '🦵',
          isRest: false,
        };
      case 4: // Jueves
        return {
          title: 'Torso Completo',
          subtitle: 'Pecho, Espalda, Hombro & Brazos',
          focus: 'Torso',
          icon: '🦍',
          isRest: false,
        };
      case 5: // Viernes
        return {
          title: 'Pierna',
          subtitle: 'Enfoque Glúteo, Femoral & Fuerza',
          focus: 'Pierna',
          icon: '🦵',
          isRest: false,
        };
      case 6: // Sábado
      case 0: // Domingo
      default:
        return {
          title: 'Descanso Activo',
          subtitle: 'Recuperación & Movilidad',
          focus: 'Descanso',
          icon: '🧘',
          isRest: true,
        };
    }
  } catch {
    return {
      title: 'Jalón (Pull)',
      subtitle: 'Espalda, Bíceps & Deltoides Posterior',
      focus: 'Jalón',
      icon: '🏋️‍♂️',
      isRest: false,
    };
  }
}
