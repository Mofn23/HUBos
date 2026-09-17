import { callGemini } from '@/lib/gemini';
import { WorkoutRoutine, RoutineDay, RoutineExercise } from '@/types/workout';
import { searchExercises, getAllExercises } from '@/lib/exercisesDb';

export interface RoutineGeneratorInput {
  goal: string;
  daysPerWeek: number;
  level: string;
  focus: string;
  equipment: string;
  sessionDuration: number;
}

export async function generateRoutineWithAI(
  apiKey: string,
  input: RoutineGeneratorInput
): Promise<WorkoutRoutine> {
  const systemPrompt = `
Eres el Entrenador Jefe de Biomecánica e Hipertrofia de Aesthetix.
Diseña una rutina de entrenamiento de élite en formato JSON estricto basada en las especificaciones del usuario.

REQUISITOS DEL PLAN:
- Objetivo principal: ${input.goal}
- Frecuencia: ${input.daysPerWeek} días por semana
- Nivel del atleta: ${input.level}
- Músculos de enfoque prioritario: ${input.focus}
- Equipamiento disponible: ${input.equipment}
- Tiempo por sesión: ${input.sessionDuration} minutos

FORMATO DE SALIDA (SOLO JSON VÁLIDO SIN MARKDOWN NI TEXTO ADICIONAL):
{
  "name": "Nombre impactante de la rutina (ej. Titan Hypertrophy Protocol)",
  "description": "Descripción concisa del enfoque fisiológico y progresión",
  "splitType": "push_pull_legs" | "upper_lower" | "full_body" | "bro_split" | "custom",
  "targetDaysPerWeek": ${input.daysPerWeek},
  "days": [
    {
      "dayName": "Día 1 - Torso Potencia",
      "focus": "Pectorales, Dorsales y Deltoides Lateral",
      "exercises": [
        {
          "name": "Barbell bench press",
          "targetSets": 4,
          "targetReps": "6-8",
          "targetRpe": 8.5,
          "restSeconds": 150,
          "notes": "Pausa de 1s en el pecho. Rango de movimiento completo."
        }
      ]
    }
  ]
}

Reglas obligatorias:
1. Incluye entre 4 y 6 ejercicios por día, ordenados de compuestos pesados a aislamiento.
2. Cada día debe tener entre 3 y 4 series efectivas por ejercicio.
3. El tiempo de descanso predeterminado debe ser 150 segundos (2:30 min).
4. El nombre del ejercicio debe ser claro y en inglés estándar (ej. "Barbell squat", "Lat pulldown", "Incline dumbbell press", "Dumbbell bicep curl") para enlazar con la base de datos visual.
5. Devuelve EXCLUSIVAMENTE el JSON.
`;

  const rawResponse = await callGemini(apiKey, systemPrompt);

  let parsed: any;
  try {
    const cleanJson = rawResponse
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    console.error('[workoutAiGenerator] Fallback parsing error:', rawResponse);
    throw new Error('La IA no generó un JSON de rutina válido. Por favor intenta de nuevo.');
  }

  // Cross-reference generated exercises with the 1,324 dataset to attach exerciseId and media
  const catalog = getAllExercises();

  const routineDays: RoutineDay[] = (parsed.days || []).map((d: any, dayIdx: number) => {
    const dayExercises: RoutineExercise[] = (d.exercises || []).map((ex: any, exIdx: number) => {
      // Find matching exercise in our catalog
      const matches = searchExercises(ex.name);
      const matchedEx = matches[0] || catalog[0];

      return {
        id: `gen_${dayIdx}_${exIdx}_${Date.now()}`,
        exerciseId: matchedEx?.id || '0001',
        name: matchedEx?.name || ex.name,
        targetSets: Number(ex.targetSets) || 3,
        targetReps: String(ex.targetReps || '8-12'),
        targetRpe: Number(ex.targetRpe) || 8,
        restSeconds: Number(ex.restSeconds) || 150,
        notes: ex.notes || 'Controla la fase excéntrica en 2-3 segundos.',
        category: matchedEx?.category || matchedEx?.body_part,
        target: matchedEx?.target,
      };
    });

    return {
      id: `day_${dayIdx}_${Date.now()}`,
      dayName: d.dayName || `Día ${dayIdx + 1}`,
      focus: d.focus || 'Hipertrofia integral',
      exercises: dayExercises,
    };
  });

  const routine: WorkoutRoutine = {
    id: `routine_ai_${Date.now()}`,
    name: parsed.name || 'Protocolo Aesthetix Pro',
    description: parsed.description || 'Rutina personalizada generada con Gemini IA.',
    splitType: parsed.splitType || 'push_pull_legs',
    targetDaysPerWeek: input.daysPerWeek,
    days: routineDays,
    createdAt: new Date().toISOString(),
  };

  return routine;
}
