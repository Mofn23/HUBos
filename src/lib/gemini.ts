import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import { AI_CONFIG, GEMINI_MODEL_CANDIDATES } from '@/constants/ai';

export { AI_CONFIG, GEMINI_MODEL_CANDIDATES };

/**
 * Executes generateContent trying candidate models in order if 404 or model error occurs.
 */
export async function generateContentWithFallback(
  apiKey: string,
  contents: any,
  preferredModel: string = AI_CONFIG.DEFAULT_MODEL
): Promise<GenerateContentResult> {
  const cleanKey = (apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
  if (!cleanKey) {
    throw new Error('No se ha configurado la API Key de Gemini. Puedes añadirla en Perfil y Ajustes.');
  }

  const genAI = new GoogleGenerativeAI(cleanKey);

  const modelsToTry = [
    preferredModel,
    ...GEMINI_MODEL_CANDIDATES.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contents);
      return result;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini AI] Model ${modelName} failed:`, errMsg);
      lastError = err;

      // If it's an invalid API key, throw immediate user alert
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
        throw new Error('Tu API Key de Gemini no es válida. Revisa la configuración en tu Perfil.');
      }
    }
  }

  throw lastError || new Error('No se pudo conectar con ningún modelo disponible de Gemini.');
}

export async function callGemini(
  apiKey: string,
  contents: any,
  preferredModel: string = AI_CONFIG.DEFAULT_MODEL
): Promise<string> {
  const result = await generateContentWithFallback(apiKey, contents, preferredModel);
  const response = await result.response;
  return response.text();
}

/**
 * Parses meal information from image (base64) or text description.
 */
export async function parseMealWithGemini(
  apiKey: string,
  input: { text?: string; imageBase64?: string; mimeType?: string }
): Promise<{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'snack' | 'pre-entreno' | 'post-entreno';
  notes: string;
}> {
  const systemPrompt = `Eres un nutricionista deportivo de élite y experto en estimación de macronutrientes.
Analiza la comida descrita o mostrada en la imagen y devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto (sin markdown, sin backticks):
{
  "name": "Nombre descriptivo del plato",
  "calories": 550,
  "protein": 35,
  "carbs": 50,
  "fat": 20,
  "mealType": "almuerzo",
  "notes": "Breve explicación nutricional de 1 frase"
}
Opciones válidas para mealType: "desayuno", "almuerzo", "cena", "snack", "pre-entreno", "post-entreno".`;

  const contents: any[] = [{ text: systemPrompt }];

  if (input.imageBase64) {
    const rawMime = input.imageBase64.match(/^data:([^;]+);base64,/)?.[1];
    const mimeType = rawMime || input.mimeType || 'image/jpeg';
    const cleanData = input.imageBase64.replace(/^data:[^;]+;base64,/, '');

    contents.push({
      inlineData: {
        data: cleanData,
        mimeType: mimeType,
      },
    });
  }

  if (input.text) {
    contents.push({ text: `Descripción del usuario: "${input.text}"` });
  }

  const raw = await callGemini(apiKey, contents, AI_CONFIG.VISION_MODEL);
  try {
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse Gemini meal response:', raw);
    throw new Error('No se pudo estructurar la información nutricional. Intenta de nuevo.');
  }
}

/**
 * Parses a Symmetry workout screenshot or text log.
 */
export async function parseWorkoutWithGemini(
  apiKey: string,
  input: { text?: string; imageBase64?: string; mimeType?: string }
): Promise<{
  title: string;
  muscleGroups: string[];
  durationMinutes: number;
  exercises: {
    name: string;
    targetMuscle: string;
    estimated1RM: number;
    sets: { setNumber: number; weightKg: number; reps: number; rpe?: number }[];
  }[];
  totalVolumeKg: number;
  symmetryNotes: string;
}> {
  const systemPrompt = `Eres un entrenador de fuerza y biomecánica experto en auditar capturas de la app "Symmetry" y rutinas de gimnasio.
Analiza la rutina o imagen y devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "title": "Nombre de la sesión (ej. Empuje Hipertrofia / Torso)",
  "muscleGroups": ["Pecho", "Hombros", "Tríceps"],
  "durationMinutes": 60,
  "exercises": [
    {
      "name": "Press de Banca Plano",
      "targetMuscle": "Pecho",
      "estimated1RM": 100,
      "sets": [
        { "setNumber": 1, "weightKg": 70, "reps": 10 },
        { "setNumber": 2, "weightKg": 80, "reps": 8 }
      ]
    }
  ],
  "totalVolumeKg": 5400,
  "symmetryNotes": "Comentario técnico sobre volumen y balance muscular"
}`;

  const contents: any[] = [{ text: systemPrompt }];

  if (input.imageBase64) {
    const rawMime = input.imageBase64.match(/^data:([^;]+);base64,/)?.[1];
    const mimeType = rawMime || input.mimeType || 'image/jpeg';
    const cleanData = input.imageBase64.replace(/^data:[^;]+;base64,/, '');

    contents.push({
      inlineData: {
        data: cleanData,
        mimeType: mimeType,
      },
    });
  }

  if (input.text) {
    contents.push({ text: `Registro de entrenamiento: "${input.text}"` });
  }

  const raw = await callGemini(apiKey, contents, AI_CONFIG.VISION_MODEL);
  try {
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse Gemini workout response:', raw);
    throw new Error('No se pudo estructurar el entrenamiento. Intenta nuevamente.');
  }
}

export async function parseSymmetryScreenshots(imagesBase64: string[], apiKey = ''): Promise<{
  routineTitle: string;
  totalVolumeKg: number;
  recommendations: string;
  exercises: {
    name: string;
    targetMuscle: string;
    sets: { weightKg: number; reps: number; rpe?: number }[];
  }[];
}> {
  const input = { imageBase64: imagesBase64[0] };
  const res = await parseWorkoutWithGemini(apiKey, input);
  return {
    routineTitle: res.title,
    totalVolumeKg: res.totalVolumeKg,
    recommendations: res.symmetryNotes,
    exercises: res.exercises.map((e) => ({
      name: e.name,
      targetMuscle: e.targetMuscle,
      sets: e.sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps, rpe: s.rpe })),
    })),
  };
}

/**
 * Parses a subscription command or invoice text.
 */
export async function parseSubscriptionWithGemini(
  apiKey: string,
  text: string
): Promise<{
  name: string;
  emoji: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  billingDay: number;
  category: string;
  provider: string;
  cancelUrl?: string;
  cancelSteps?: string;
  notes?: string;
}> {
  const systemPrompt = `Eres un asistente financiero que analiza suscripciones y pagos recurrentes.
Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura:
{
  "name": "Spotify Premium",
  "emoji": "🎵",
  "amount": 18900,
  "frequency": "monthly",
  "billingDay": 15,
  "category": "Música",
  "provider": "Spotify AB",
  "cancelUrl": "https://www.spotify.com/account/overview/",
  "cancelSteps": "Web oficial > Cuenta > Cancelar",
  "notes": "Detectado automáticamente"
}
Si la moneda no está clara, devuelve el número en valor local (ej. 18900 o 20). Categorías: Streaming, IA & Software, Fitness & Salud, Cloud & Almacenamiento, Juegos, Productividad, Música, Servicios.`;

  const raw = await callGemini(apiKey, [{ text: `${systemPrompt}\n\nTexto a analizar: "${text}"` }]);
  try {
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error('Failed to parse Gemini subscription response:', raw);
    throw new Error('No se pudo procesar la suscripción con IA.');
  }
}

/**
 * Omnibar fast dispatcher.
 */
export async function parseQuickActionWithGemini(
  apiKey: string,
  prompt: string
): Promise<{
  targetApp: 'recomp' | 'subs' | 'general';
  actionType: 'add_meal' | 'add_workout' | 'add_sub' | 'info';
  data: any;
  message: string;
}> {
  const systemPrompt = `Eres el despachador de inteligencia central de HUBos.
El usuario escribe un comando libre en español. Clasifica la intención y devuelve ÚNICAMENTE un JSON válido:
{
  "targetApp": "recomp" | "subs" | "general",
  "actionType": "add_meal" | "add_workout" | "add_sub" | "info",
  "data": { ...datos extraídos acordes a la acción... },
  "message": "Mensaje conciso de confirmación para el usuario"
}`;

  const raw = await callGemini(apiKey, [{ text: `${systemPrompt}\n\nComando del usuario: "${prompt}"` }]);
  try {
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return {
      targetApp: 'general',
      actionType: 'info',
      data: null,
      message: 'Comando recibido.',
    };
  }
}

/**
 * AI Body Recomposition Coach response generator.
 */
export async function askCoachWithGemini(
  apiKey: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userPrompt: string,
  contextData: { caloriesConsumed: number; targetCalories: number; proteinConsumed: number; targetProtein: number; lastWorkoutTitle?: string }
): Promise<string> {
  const systemInstruction = `Eres "Recomp Coach AI", un entrenador personal y nutricionista deportivo de vanguardia integrado en HUBos.
Estilo: Muy profesional, motivador, conciso, basado en evidencia científica y directo al grano con formato limpio.
Contexto actual del usuario hoy:
- Calorías consumidas: ${contextData.caloriesConsumed} / ${contextData.targetCalories} kcal
- Proteína: ${contextData.proteinConsumed} / ${contextData.targetProtein} g
- Último entrenamiento registrado: ${contextData.lastWorkoutTitle || 'Ninguno hoy aún'}`;

  const contents = [
    { text: systemInstruction },
    ...history.map((h) => ({ text: `${h.role}: ${h.parts.map((p) => p.text).join(' ')}` })),
    { text: `user: ${userPrompt}` },
  ];

  return callGemini(apiKey, contents, AI_CONFIG.DEFAULT_MODEL);
}
