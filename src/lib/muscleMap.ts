import type { Muscle } from 'react-body-highlighter';

export function getMusclesForExercise(exerciseName: string): Muscle[] {
  const name = exerciseName.toLowerCase();
  const muscles: Muscle[] = [];

  // PECHO
  if (
    name.includes('bench press') ||
    name.includes('push-up') ||
    name.includes('pecho') ||
    name.includes('pec deck') ||
    name.includes('cable fly') ||
    name.includes('press banca')
  ) {
    muscles.push('chest', 'triceps', 'front-deltoids');
  }

  // ESPALDA
  if (
    name.includes('row') ||
    name.includes('remo') ||
    name.includes('pull-up') ||
    name.includes('lat pulldown') ||
    name.includes('espalda') ||
    name.includes('jalón')
  ) {
    muscles.push('upper-back', 'biceps');
  }
  if (name.includes('deadlift') || name.includes('peso muerto') || name.includes('t-bar')) {
    muscles.push('lower-back', 'gluteal', 'hamstring');
  }

  // HOMBROS
  if (
    name.includes('lateral raise') ||
    name.includes('press militar') ||
    name.includes('hombro') ||
    name.includes('elevaciones')
  ) {
    muscles.push('front-deltoids');
  }
  if (name.includes('face pull') || name.includes('pájaro') || name.includes('posterior')) {
    muscles.push('back-deltoids', 'trapezius');
  }

  // BRAZOS
  if ((name.includes('curl') && !name.includes('leg')) || name.includes('bicep') || name.includes('bíceps')) {
    muscles.push('biceps');
    if (name.includes('martillo') || name.includes('reverse')) muscles.push('forearm');
  }
  if (
    name.includes('tricep') ||
    name.includes('tríceps') ||
    name.includes('pushdown') ||
    name.includes('fondos') ||
    name.includes('copa')
  ) {
    if (!name.includes('leg')) {
      muscles.push('triceps');
    }
  }

  // PIERNAS
  if (
    name.includes('squat') ||
    name.includes('sentadilla') ||
    name.includes('leg press') ||
    name.includes('prensa') ||
    name.includes('extension') ||
    name.includes('cuádriceps')
  ) {
    muscles.push('quadriceps', 'gluteal');
  }
  if (
    name.includes('leg curl') ||
    name.includes('isquio') ||
    name.includes('hamstring') ||
    name.includes('femoral')
  ) {
    muscles.push('hamstring');
  }
  if (name.includes('calf') || name.includes('gemelos') || name.includes('pantorrilla')) {
    muscles.push('calves');
  }
  if (name.includes('abductor') || name.includes('abducción')) {
    muscles.push('abductors');
  }
  if (name.includes('adductor') || name.includes('aducción')) {
    muscles.push('adductor');
  }

  // CORE
  if (
    name.includes('crunch') ||
    name.includes('abs') ||
    name.includes('abdomen') ||
    name.includes('plank') ||
    name.includes('plancha')
  ) {
    muscles.push('abs');
  }
  if (name.includes('oblique') || name.includes('oblicuo') || name.includes('twist')) {
    muscles.push('obliques');
  }

  return [...new Set(muscles)];
}
