import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import { AI_CONFIG, GEMINI_MODEL_CANDIDATES } from '@/constants/ai';

export { AI_CONFIG, GEMINI_MODEL_CANDIDATES };

/** Modelos con 503/500 recientes: se evitan durante unos minutos. */
const coolingDownUntil = new Map<string, number>();
const COOLDOWN_MS = 2 * 60 * 1000;

/** Modelos que respondieron 404 en esta sesión. */
const deadModels = new Set<string>();

export interface GeminiRequestOptions {
  /** Tiempo máximo por intento antes de abortar y probar el siguiente modelo. */
  timeoutMs?: number;
  /** Presupuesto total para toda la cadena de modelos. */
  totalTimeoutMs?: number;
  /** Configuración de generación (JSON, temperatura, tokens...). */
  generationConfig?: Record<string, unknown>;
  /**
   * Tokens de "thinking" permitidos. 0 desactiva el razonamiento previo, que es
   * lo que más latencia añade en tareas simples. Solo se aplica en los modelos
   * que lo soportan (gemini-3.6-flash responde 400 en los demás).
   */
  thinkingBudget?: number;
}

function errorMessage(err: unknown): string {
  return String((err as { message?: string } | null)?.message || err);
}

function isMissingModelError(message: string): boolean {
  return /404|not found|is not supported|unsupported|does not exist|invalid model|model not/i.test(message);
}

function isOverloadedError(message: string): boolean {
  return /503|500|502|504|service unavailable|high demand|overloaded/i.test(message);
}

function isQuotaError(message: string): boolean {
  return /RESOURCE_EXHAUSTED|quota|429/i.test(message);
}

/**
 * Ejecuta generateContent probando modelos en orden.
 *
 * - Arranca por el modelo preferido (el más rápido verificado) y sigue con los
 *   candidatos; los modelos con 404 se descartan y los que devuelven 503 entran
 *   en un enfriamiento de dos minutos.
 * - Usa el `timeout` nativo del SDK, que aborta la petición en vuelo en lugar
 *   de dejarla corriendo mientras se prueba otro modelo.
 * - La cuota es por modelo, así que un 429 no cancela la cadena: otro modelo
 *   puede tener cuota disponible.
 */
export async function generateContentWithFallback(
  apiKey: string,
  contents: any,
  preferredModel: string = AI_CONFIG.DEFAULT_MODEL,
  options: GeminiRequestOptions = {}
): Promise<GenerateContentResult> {
  const cleanKey = (apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
  if (!cleanKey) {
    throw new Error('No se ha configurado la API Key de Gemini. Puedes añadirla en Perfil y Ajustes.');
  }

  const genAI = new GoogleGenerativeAI(cleanKey);
  const timeoutMs = options.timeoutMs ?? 15000;
  // Presupuesto global: aunque falle un modelo, la espera nunca se dispara.
  const deadline = Date.now() + (options.totalTimeoutMs ?? 30000);

  const allModels = Array.from(
    new Set([preferredModel, ...GEMINI_MODEL_CANDIDATES].filter((model): model is string => Boolean(model)))
  );

  const notCoolingDown = allModels.filter((model) => {
    const until = coolingDownUntil.get(model);
    return !until || until <= Date.now();
  });

  const orderedModels = (notCoolingDown.length ? notCoolingDown : allModels).filter(
    (model) => !deadModels.has(model)
  );

  let lastError: unknown = null;
  let quotaError: unknown = null;

  for (const modelName of orderedModels) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;

    const attemptTimeout = Math.min(timeoutMs, remaining);
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), attemptTimeout);

    try {
      const supportsThinkingControl = modelName === 'gemini-3.6-flash';
      const generationConfig = options.generationConfig
        ? {
            ...options.generationConfig,
            ...(supportsThinkingControl && options.thinkingBudget !== undefined
              ? { thinkingConfig: { thinkingBudget: options.thinkingBudget } }
              : {}),
          }
        : undefined;

      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(generationConfig ? { generationConfig: generationConfig as any } : {}),
      });

      const result = await model.generateContent(contents, {
        timeout: attemptTimeout,
        signal: controller.signal,
      });

      return result;
    } catch (err: any) {
      const errMsg = errorMessage(err);
      console.warn(`[Gemini AI] Model ${modelName} failed:`, errMsg);
      lastError = err;

      // Errores que no mejoran probando otro modelo.
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
        throw new Error('Tu API Key de Gemini no es válida. Revisa la configuración en tu Perfil.');
      }

      if (isQuotaError(errMsg)) {
        quotaError = err;
        continue;
      }

      if (isOverloadedError(errMsg)) {
        coolingDownUntil.set(modelName, Date.now() + COOLDOWN_MS);
        continue;
      }

      if (isMissingModelError(errMsg)) {
        deadModels.add(modelName);
        continue;
      }

      // Timeout, red o fallo puntual del proveedor: se prueba el siguiente.
    } finally {
      clearTimeout(abortTimer);
    }
  }

  if (quotaError) {
    throw new Error('Se ha excedido la cuota de la API de Gemini. Intenta de nuevo en unos minutos.');
  }

  if (lastError && /abort|timeout/i.test(errorMessage(lastError))) {
    throw new Error('Gemini tardó demasiado en responder. Revisa tu conexión e intenta de nuevo.');
  }

  throw lastError || new Error('No se pudo conectar con ningún modelo disponible de Gemini.');
}

export async function callGemini(
  apiKey: string,
  contents: any,
  preferredModel: string = AI_CONFIG.DEFAULT_MODEL,
  options: GeminiRequestOptions = {}
): Promise<string> {
  const result = await generateContentWithFallback(apiKey, contents, preferredModel, options);
  const response = await result.response;
  return response.text();
}

/** Extrae el primer objeto JSON válido de una respuesta del modelo. */
function parseJsonResponse<T = any>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error('Respuesta de IA sin JSON válido');
  }
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

  const raw = await callGemini(apiKey, contents, AI_CONFIG.VISION_MODEL, {
    // Respuesta JSON pura y corta, sin razonamiento previo: menos espera.
    timeoutMs: 15000,
    totalTimeoutMs: 30000,
    thinkingBudget: 0,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 400,
    },
  });

  try {
    return parseJsonResponse(raw);
  } catch (e) {
    console.error('Failed to parse Gemini meal response:', raw);
    throw new Error('No se pudo estructurar la información nutricional. Intenta de nuevo.');
  }
}

/**
 * Parses a Symmetry workout screenshot or text log (supports multiple images).
 */
export async function parseWorkoutWithGemini(
  apiKey: string,
  input: { text?: string; imageBase64?: string; imagesBase64?: string[]; mimeType?: string }
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
Analiza la rutina o todas las imágenes subidas y devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "title": "Nombre de la sesión (ej. Torso Hipertrofia / Pierna / Empuje)",
  "muscleGroups": ["Pecho", "Hombros", "Tríceps", "Espalda"],
  "durationMinutes": 60,
  "exercises": [
    {
      "name": "Press de Banca Plano",
      "targetMuscle": "Pecho",
      "estimated1RM": 100,
      "sets": [
        { "setNumber": 1, "weightKg": 70, "reps": 10, "rpe": 8 },
        { "setNumber": 2, "weightKg": 80, "reps": 8, "rpe": 9 }
      ]
    }
  ],
  "totalVolumeKg": 5400,
  "symmetryNotes": "Comentario técnico y motivador sobre volumen y balance muscular"
}`;

  const contents: any[] = [{ text: systemPrompt }];

  const allImages = input.imagesBase64 || (input.imageBase64 ? [input.imageBase64] : []);
  for (const img of allImages) {
    if (img) {
      const rawMime = img.match(/^data:([^;]+);base64,/)?.[1];
      const mimeType = rawMime || input.mimeType || 'image/jpeg';
      const cleanData = img.replace(/^data:[^;]+;base64,/, '');

      contents.push({
        inlineData: {
          data: cleanData,
          mimeType: mimeType,
        },
      });
    }
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
  const res = await parseWorkoutWithGemini(apiKey, { imagesBase64 });
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
