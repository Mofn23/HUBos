import { callGemini } from './gemini';
import { SubjectItem, ClassSlot } from '@/stores/useScheduleStore';

const COLOR_PALETTE = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Amber
  '#34C759', // Green
  '#00C7BE', // Teal
  '#30B0C7', // Cyan
  '#0A84FF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
];

export interface ParsedAiSubject {
  name: string;
  shortInfo?: string;
  instructor?: string;
  emoji: string;
  color: string;
  slots: {
    dayOfWeek: number; // 1: Lunes, 2: Martes, etc.
    startHour: string; // "07:00"
    endHour: string; // "09:00"
    room?: string;
  }[];
}

/**
 * Uses Gemini AI to parse a syllabus, photo of a schedule, or text message.
 */
export async function parseScheduleWithAi(
  apiKey: string,
  input: { text?: string; base64Image?: string; mimeType?: string }
): Promise<ParsedAiSubject[]> {
  const systemPrompt = `Eres un asistente experto de HUBos para estructurar horarios de clases universitarias, cursos de conducción y rutinas semanales.
Analiza la imagen o texto suministrado y extrae todas las materias y sus horarios semanales.

IMPORTANTE SOBRE DÍAS DE LA SEMANA:
Usa números enteros del 1 al 7:
1 = Lunes
2 = Martes
3 = Miércoles
4 = Jueves
5 = Viernes
6 = Sábado
7 = Domingo

FORMATO DE HORAS:
Formato de 24 horas exacto en string de 5 caracteres: "HH:mm", por ejemplo "07:00", "09:00", "14:30", "16:00".

Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura (sin markdown adicional):
{
  "subjects": [
    {
      "name": "Nombre de la Materia o Clase",
      "shortInfo": "Salón, aula o pista (ej: Aula 304, Pista Norte Auto 04)",
      "instructor": "Nombre del profesor o instructor si aparece",
      "emoji": "Un emoji representativo (ej: 🚗 para conducción, 📐 para cálculo, 💻 para programación, 🔬 para química)",
      "color": "Uno de estos colores hex: #FF3B30, #FF9500, #34C759, #0A84FF, #AF52DE, #FF2D55, #00C7BE",
      "slots": [
        {
          "dayOfWeek": 1,
          "startHour": "07:00",
          "endHour": "09:00",
          "room": "Aula 304"
        }
      ]
    }
  ]
}`;

  let contents: any;

  if (input.base64Image) {
    contents = [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          {
            inlineData: {
              data: input.base64Image.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: input.mimeType || 'image/jpeg',
            },
          },
          { text: input.text ? `Detalles adicionales: ${input.text}` : 'Extrae las materias y horarios de esta imagen.' },
        ],
      },
    ];
  } else {
    contents = [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          { text: `Aquí está la información del horario:\n${input.text}` },
        ],
      },
    ];
  }

  const rawResponse = await callGemini(apiKey, contents);

  // Clean JSON string
  const cleanJson = rawResponse
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleanJson);
    if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
      throw new Error('Formato de respuesta inválido de Gemini.');
    }

    // Validate and assign fallback colors if needed
    return parsed.subjects.map((sub: any, idx: number) => ({
      name: sub.name || 'Clase sin nombre',
      shortInfo: sub.shortInfo || '',
      instructor: sub.instructor || '',
      emoji: sub.emoji || '📚',
      color: sub.color || COLOR_PALETTE[idx % COLOR_PALETTE.length],
      slots: Array.isArray(sub.slots)
        ? sub.slots.map((s: any) => ({
            dayOfWeek: Math.min(7, Math.max(1, Number(s.dayOfWeek) || 1)),
            startHour: s.startHour || '08:00',
            endHour: s.endHour || '10:00',
            room: s.room || sub.shortInfo || '',
          }))
        : [],
    }));
  } catch (err: any) {
    console.error('Error parsing Gemini schedule JSON:', err, cleanJson);
    throw new Error('No se pudo procesar el horario con IA. Intenta con una descripción más clara.');
  }
}
