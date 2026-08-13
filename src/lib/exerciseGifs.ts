export interface ExerciseInfo {
  name: string;
  muscle: string;
  icon: string;
  tips: string;
}

export const EXERCISE_DATABASE: Record<string, ExerciseInfo> = {
  'Press de Banca Plano': {
    name: 'Press de Banca Plano',
    muscle: 'Pecho',
    icon: '🏋️‍♂️',
    tips: 'Retrae escápulas, apoya los pies firmes y controla la fase excéntrica en 2 segundos.',
  },
  'Press Inclinado con Mancuernas': {
    name: 'Press Inclinado con Mancuernas',
    muscle: 'Pecho Superior',
    icon: '💪',
    tips: 'Banco a 30 grados para enfocar el haz clavicular sin sobrecargar el deltoides anterior.',
  },
  'Sentadilla Trasera': {
    name: 'Sentadilla Trasera',
    muscle: 'Cuádriceps & Glúteos',
    icon: '🦵',
    tips: 'Profundidad bajo la paralela, rodillas alineadas con la punta de los pies y core firme.',
  },
  'Peso Muerto Rumano': {
    name: 'Peso Muerto Rumano',
    muscle: 'Isquios & Glúteos',
    icon: '⚡',
    tips: 'Empuja la cadera hacia atrás sintiendo el estiramiento máximo de isquiotibiales.',
  },
  'Dominadas Pronas': {
    name: 'Dominadas Pronas',
    muscle: 'Dorsales',
    icon: '🧗',
    tips: 'Rango de movimiento completo, pecho hacia la barra y control en la bajada.',
  },
  'Remo con Barra': {
    name: 'Remo con Barra',
    muscle: 'Espalda Media',
    icon: '🔥',
    tips: 'Torso a 45 grados, lleva los codos pegados a la cadera contrayendo dorsales.',
  },
  'Press Militar': {
    name: 'Press Militar',
    muscle: 'Hombros',
    icon: '🎖️',
    tips: 'Bloquea glúteos y abdomen, pasa la cabeza hacia adelante al bloquear arriba.',
  },
  'Elevaciones Laterales': {
    name: 'Elevaciones Laterales',
    muscle: 'Deltoides Lateral',
    icon: '🦅',
    tips: 'Ligera inclinación hacia adelante, eleva con los codos y evita balanceo.',
  },
  'Curl con Barra Z': {
    name: 'Curl con Barra Z',
    muscle: 'Bíceps',
    icon: '💪',
    tips: 'Codos inmóviles pegados a los costados, aprieta en el pico de contracción.',
  },
  'Fondos en Paralelas': {
    name: 'Fondos en Paralelas',
    muscle: 'Tríceps / Pecho',
    icon: '🦾',
    tips: 'Cuerpo vertical para enfocar tríceps o inclinado para enfatizar pectoral inferior.',
  },
};

export function getExerciseInfo(name: string): ExerciseInfo {
  const match = Object.keys(EXERCISE_DATABASE).find(
    (k) => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
  );
  if (match) return EXERCISE_DATABASE[match];

  return {
    name,
    muscle: 'General',
    icon: '🏋️',
    tips: 'Mantén una técnica estricta y sobrecarga progresiva en cada sesión.',
  };
}
