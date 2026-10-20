'use client';

import React, { useState, useRef } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { generateContentWithFallback } from '@/lib/gemini';
import { WorkoutHistoryItem, SessionExerciseLog, SetLog } from '@/types/workout';
import { searchExercises } from '@/lib/exercisesDb';
import { useScrollLock } from '@/lib/useScrollLock';

interface SymmetryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedWorkout {
  date: string;
  routineName: string;
  dayName: string;
  durationMinutes: number;
  exercises: {
    name: string;
    sets: { weightKg: number; reps: number }[];
  }[];
}

export const SymmetryImportModal: React.FC<SymmetryImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { geminiApiKey, showToast } = useHubStore();
  const { addHistoricalWorkout } = useAesthetixStore();

  useScrollLock(isOpen);

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setParsedWorkout(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessScreenshot = async () => {
    if (!screenshot) {
      showToast('Selecciona una captura de pantalla de Symmetry.');
      return;
    }

    setIsProcessing(true);

    try {
      const base64Data = screenshot.split(',')[1] || screenshot;

      const prompt = `Actúa como un OCR especializado en la aplicación de entrenamiento 'Symmetry'.
Analiza esta captura de pantalla de Symmetry (puede ser una lista de PRs, un resumen de entrenamiento o historial de ejercicios).
Extrae la información del entrenamiento o PRs visibles y devuélvela EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
{
  "date": "",
  "routineName": "",
  "dayName": "",
  "durationMinutes": 0,
  "exercises": [
    {
      "name": "Press de banca inclinado con mancuernas",
      "sets": [
        { "weightKg": 45, "reps": 11 }
      ]
    }
  ]
}
Si hay múltiples ejercicios, inclúyelos todos con sus pesos en kg y repeticiones. Si es un PR, ponlo como 1 serie. No inventes fechas, duración, ejercicios ni marcas que no sean legibles: usa fecha vacía, duración 0 y omite datos inciertos.
Devuelve SOLO el JSON sin bloques de código ni texto adicional.`;

      const contents = [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ];

      const apiKey = geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const result = await generateContentWithFallback(apiKey, contents);
      const rawText = (await result.response).text().trim();

      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed: ParsedWorkout = JSON.parse(cleaned);

      const hasValidSet = parsed.exercises?.some((exercise) =>
        exercise.sets?.some((set) => Number(set.weightKg) > 0 && Number(set.reps) > 0)
      );
      if (!hasValidSet) {
        throw new Error('No se detectaron series con peso y repeticiones legibles.');
      }

      setParsedWorkout(parsed);
      showToast(`✓ Se detectaron ${parsed.exercises.length} ejercicios.`);
    } catch (err: any) {
      console.error('Symmetry import error:', err);
      setParsedWorkout(null);
      showToast('No se pudo leer la captura. Revisa la imagen o tu API key e inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedWorkout) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedWorkout.date)) {
      showToast('Confirma la fecha del entrenamiento antes de importarlo.');
      return;
    }

    let totalVolume = 0;
    let totalSets = 0;

    const sessionExercises: SessionExerciseLog[] = parsedWorkout.exercises.map((ex, exIdx) => {
      // Look up exercise in DB for id
      const matches = searchExercises(ex.name);
      const dbMatch = matches[0];
      const exId = dbMatch ? dbMatch.id : `custom_${Date.now()}_${exIdx}`;

      const validSets = (ex.sets || []).filter((set) => Number(set.weightKg) > 0 && Number(set.reps) > 0);
      const sets: SetLog[] = validSets.map((s, sIdx) => {
        const weightKg = Number(s.weightKg);
        const reps = Number(s.reps);
        const vol = weightKg * reps;
        totalVolume += vol;
        totalSets += 1;
        return {
          id: `imp_set_${Date.now()}_${exIdx}_${sIdx}`,
          setNumber: sIdx + 1,
          weightKg,
          reps,
          completed: true,
        };
      });

      return {
        exerciseId: exId,
        exerciseName: ex.name,
        category: dbMatch?.body_part || 'chest',
        target: dbMatch?.target || 'pectorals',
        sets,
      };
    });

    const historyItem: WorkoutHistoryItem = {
      id: `imported_symmetry_${Date.now()}`,
      routineName: parsedWorkout.routineName || 'Entrenamiento importado',
      dayName: parsedWorkout.dayName || 'Sesión importada',
      date: parsedWorkout.date,
      durationMinutes: Math.max(0, Number(parsedWorkout.durationMinutes) || 0),
      totalVolumeKg: Math.round(totalVolume),
      totalSets,
      exercises: sessionExercises,
      prCount: 0,
    };

    addHistoricalWorkout(historyItem);
    showToast(`✓ Entrenamiento importado (+${historyItem.totalVolumeKg} kg añadidos al volumen).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      <div
        className="relative w-full max-w-md fitness-surface-elevated rounded-[32px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[85vh] flex flex-col overscroll-contain"
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#A1F524]/20 text-[#A1F524] flex items-center justify-center text-sm font-black border border-[#A1F524]/30">
              📥
            </span>
            <div>
              <h3 className="text-sm font-black text-[#F5F5F7]">Importar de Symmetry</h3>
              <p className="text-[10px] font-bold text-[#8E8E93]">
                Lector inteligente de capturas con Gemini Vision
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {/* Screenshot Upload Box */}
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`w-full aspect-[16/10] rounded-[22px] overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative ${
              screenshot
                ? 'border-[#A1F524]/60 bg-black/40'
                : 'border-white/20 hover:border-[#A1F524]/40 bg-white/[0.02]'
            }`}
          >
            {screenshot ? (
              <>
                <img
                  src={screenshot}
                  alt="Captura Symmetry"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                  Toca para cambiar captura
                </div>
              </>
            ) : (
              <div className="text-center p-4 space-y-1.5">
                <span className="text-2xl block">📱</span>
                <p className="text-xs font-black text-[#F5F5F7]">
                  Selecciona una captura de pantalla de Symmetry
                </p>
                <p className="text-[10px] font-bold text-[#8E8E93]">
                  Historial de entreno, PRs o resumen mensual
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!parsedWorkout && (
            <button
              type="button"
              onClick={handleProcessScreenshot}
              disabled={!screenshot || isProcessing}
              className={`w-full py-3.5 rounded-full font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                !screenshot || isProcessing
                  ? 'bg-white/10 text-[#8E8E93] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#A1F524] to-[#2ECC71] text-black hover:scale-[1.01] active:scale-98 shadow-[0_0_25px_rgba(161,245,36,0.4)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>Extrayendo datos con Gemini Vision...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Procesar Captura con IA</span>
                </>
              )}
            </button>
          )}

          {/* Parsed Workout Preview */}
          {parsedWorkout && (
            <div className="space-y-3 animate-fade-in">
              <div className="fitness-surface p-3.5 rounded-[22px] space-y-2 border border-[#A1F524]/30">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-[#F5F5F7]">
                    {parsedWorkout.routineName || 'Entrenamiento detectado'}
                  </h4>
                  <label className="shrink-0">
                    <span className="sr-only">Fecha del entrenamiento</span>
                    <input
                      type="date"
                      value={parsedWorkout.date || ''}
                      onChange={(event) => setParsedWorkout((current) => current ? { ...current, date: event.target.value } : current)}
                      className="w-[116px] bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-[#A1F524] font-mono"
                      aria-label="Fecha del entrenamiento"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 pt-1">
                  {parsedWorkout.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="fitness-pill p-2 rounded-[14px] flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-[#F5F5F7] truncate max-w-[200px]">
                        {ex.name}
                      </span>
                      <span className="font-mono text-[#64D2FF] font-black text-[11px]">
                        {ex.sets.filter((s) => Number(s.weightKg) > 0 && Number(s.reps) > 0).map((s) => `${s.weightKg} kg × ${s.reps}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="w-full py-3.5 rounded-full bg-[#A1F524] text-black font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>Confirmar e Importar al Historial</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
