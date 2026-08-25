import { parseISO, getDay } from 'date-fns';

export interface DailyRoutineInfo {
  title: string;
  subtitle: string;
  focus: string;
  icon: string;
  isRest: boolean;
}

/**
 * Returns the exact daily workout routine according to the user's weekly split:
 * - Lunes: Torso Hipertrofia
 * - Martes: Pierna Hipertrofia
 * - Miércoles: Descanso Activo
 * - Jueves: Torso Hipertrofia
 * - Viernes: Pierna Hipertrofia
 * - Sábado & Domingo: Descanso Activo
 */
export function getDailyRoutine(dateStr: string): DailyRoutineInfo {
  try {
    const date = parseISO(dateStr);
    const day = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    switch (day) {
      case 1: // Lunes
        return {
          title: 'Torso Hipertrofia',
          subtitle: 'Pecho, Espalda & Brazos',
          focus: 'Torso',
          icon: '💪',
          isRest: false,
        };
      case 2: // Martes
        return {
          title: 'Pierna Hipertrofia',
          subtitle: 'Cuádriceps & Isquios',
          focus: 'Pierna',
          icon: '🦵',
          isRest: false,
        };
      case 3: // Miércoles
        return {
          title: 'Descanso Activo',
          subtitle: 'Recuperación & Carga',
          focus: 'Descanso',
          icon: '🧘',
          isRest: true,
        };
      case 4: // Jueves
        return {
          title: 'Torso Hipertrofia',
          subtitle: 'Pecho, Espalda & Brazos',
          focus: 'Torso',
          icon: '💪',
          isRest: false,
        };
      case 5: // Viernes
        return {
          title: 'Pierna Hipertrofia',
          subtitle: 'Cuádriceps & Isquios',
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
          icon: '😴',
          isRest: true,
        };
    }
  } catch {
    return {
      title: 'Torso Hipertrofia',
      subtitle: 'Pecho, Espalda & Brazos',
      focus: 'Torso',
      icon: '💪',
      isRest: false,
    };
  }
}
