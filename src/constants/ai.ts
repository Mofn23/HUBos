/**
 * Modelos verificados contra la API el 2026-10-20:
 *
 * - `gemini-3.6-flash`: el más rápido en texto y visión (~2-5 s), pero devuelve
 *   503 en rachas de alta demanda. Primer intento, con enfriamiento automático.
 * - `gemini-3.5-flash-lite`: responde siempre, aunque tarda ~9-11 s en visión.
 *   Es el respaldo fiable.
 * - `gemini-3.5-flash`: disponible y rápido (~4-7 s), con picos de >20 s.
 * - `gemini-3.8-flash`: devuelve 503 con frecuencia. Último recurso.
 * - `gemini-3.1-flash-lite`: se quedó colgado más de 20 s en todas las pruebas;
 *   se retiró de la cadena para no sumar esperas.
 */
export const AI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.6-flash',
  VISION_MODEL: 'gemini-3.6-flash',
  PRO_MODEL: 'gemini-3.6-flash',
};

export const GEMINI_MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];
