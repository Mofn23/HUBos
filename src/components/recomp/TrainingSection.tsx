'use client';

import React, { useState, useRef } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, TrainingLogEntry, ExerciseEntry } from '@/stores/useRecompStore';
import { parseWorkoutWithGemini } from '@/lib/gemini';
import { getExerciseInfo } from '@/lib/exerciseGifs';
import { getTodayKey } from '@/lib/date';
import {
  IconDumbbell,
  IconSparkles,
  IconCamera,
  IconPlus,
  IconCheck,
  IconTrash,
  IconFlame,
  IconActivity,
} from '../common/Icons';

export const TrainingSection: React.FC = () => {
  const { geminiApiKey, showToast } = useHubStore();
  const { trainingLogs, addTrainingLog, deleteTrainingLog } = useRecompStore();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [workoutText, setWorkoutText] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAuditWorkout = async () => {
    if (!workoutText.trim() && !screenshotBase64) {
      showToast('Escribe tu rutina o sube una captura de Symmetry.');
      return;
    }

    setIsLoading(true);
    try {
      const parsed = await parseWorkoutWithGemini(geminiApiKey, {
        text: workoutText,
        imageBase64: screenshotBase64 || undefined,
      });

      const todayStr = getTodayKey();
      addTrainingLog({
        date: todayStr,
        title: parsed.title,
        muscleGroups: parsed.muscleGroups,
        durationMinutes: parsed.durationMinutes,
        totalVolumeKg: parsed.totalVolumeKg,
        symmetryNotes: parsed.symmetryNotes,
        screenshotBase64: screenshotBase64 || undefined,
        exercises: parsed.exercises.map((ex, idx) => ({
          id: `ex-${Date.now()}-${idx}`,
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          estimated1RM: ex.estimated1RM,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
          })),
        })),
      });

      showToast(`🏋️‍♂️ Sesión registrada: ${parsed.title} (${parsed.totalVolumeKg.toLocaleString('es-CO')} kg)`);
      setWorkoutText('');
      setScreenshotBase64(null);
      setIsAiModalOpen(false);
    } catch (err: any) {
      console.error('Workout parsing error:', err);
      showToast(err?.message || 'Error al procesar el entrenamiento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregated weekly muscle volume for heatmap
  const muscleIntensity: Record<string, number> = {
    Pecho: 12,
    Espalda: 14,
    Piernas: 16,
    Hombros: 10,
    Brazos: 12,
    Core: 6,
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Action Header Card */}
      <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#1C1C1E] to-[#242426] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#34C759]">
            Auditoría Symmetry IA
          </span>
          <h2 className="text-lg font-black text-[#F5F5F7]">Entrenamiento de Fuerza</h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Analiza sobrecarga progresiva y 1RM
          </p>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-[#34C759] text-black font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-lg"
        >
          <IconSparkles className="w-3.5 h-3.5" />
          <span>Analizar</span>
        </button>
      </div>

      {/* Muscle Heatmap Overview */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Mapa de Calor Muscular (Últimos 7 Días)
          </h3>
          <span className="text-[11px] font-bold text-[#34C759]">Volumen Óptimo</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(muscleIntensity).map(([muscle, sets]) => {
            const isHigh = sets >= 12;
            return (
              <div
                key={muscle}
                className="p-3 rounded-2xl bg-[#141416] border border-white/5 flex flex-col items-center text-center"
              >
                <span className="text-xs font-bold text-[#F5F5F7]">{muscle}</span>
                <span className="text-sm font-black text-[#34C759] mt-0.5">{sets} series</span>
                <span
                  className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                    isHigh ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#FF9500]/15 text-[#FF9500]'
                  }`}
                >
                  {isHigh ? 'Hipertrofia' : 'Moderado'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logged Workouts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Historial de Sesiones
          </h3>
          <span className="text-[11px] text-[#8E8E93]">{trainingLogs.length} entrenamientos</span>
        </div>

        {trainingLogs.length === 0 ? (
          <div className="p-8 rounded-[28px] bg-[#1C1C1E] border border-dashed border-white/10 text-center space-y-2">
            <IconDumbbell className="w-8 h-8 text-[#8E8E93] mx-auto opacity-50" />
            <p className="text-xs font-bold text-[#F5F5F7]">No hay entrenamientos registrados</p>
            <p className="text-[11px] text-[#8E8E93]">
              Sube una captura de Symmetry o describe tu rutina para auditar con IA.
            </p>
          </div>
        ) : (
          trainingLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-lg space-y-3.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-[#F5F5F7]">{log.title}</h4>
                    <span className="text-[10px] font-bold bg-[#34C759]/15 text-[#34C759] px-2 py-0.5 rounded-full">
                      {log.totalVolumeKg?.toLocaleString('es-CO')} kg
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E93] mt-0.5">{log.date}</p>
                </div>

                <button
                  onClick={() => deleteTrainingLog(log.id)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Muscle tags */}
              <div className="flex flex-wrap gap-1.5">
                {log.muscleGroups?.map((mg, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-[#242426] text-[#8E8E93] px-2 py-0.5 rounded-md"
                  >
                    {mg}
                  </span>
                ))}
              </div>

              {/* Exercises summary */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                {log.exercises?.map((ex, idx) => {
                  const info = getExerciseInfo(ex.name);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#141416] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <div>
                          <p className="font-bold text-[#F5F5F7]">{ex.name}</p>
                          <p className="text-[10px] text-[#8E8E93]">
                            {ex.sets?.length} series • 1RM est: {ex.estimated1RM || '—'} kg
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono text-[#34C759]">
                        {ex.sets?.map((s) => `${s.weightKg}k×${s.reps}`).join(' | ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {log.symmetryNotes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#8E8E93]">
                  <span className="font-bold text-[#F5F5F7]">Auditoría IA: </span>
                  {log.symmetryNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Symmetry Audit Sheet */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
            onClick={() => {
              if (!isLoading) setIsAiModalOpen(false);
            }}
          />
          <div className="relative w-full max-w-lg bg-[#18181A] rounded-t-[36px] border-t border-white/10 shadow-2xl p-6 h-[calc(100vh-68px)] max-h-[92vh] overflow-y-auto no-scrollbar z-10 space-y-4 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
            <h2 className="text-lg font-black text-[#F5F5F7]">Auditar Entrenamiento con IA</h2>
            <p className="text-xs text-[#8E8E93]">
              Sube una captura de pantalla de la app Symmetry o describe tus levantamientos.
            </p>

            <div className="p-4 rounded-2xl bg-[#242426] border border-white/10 space-y-3">
              <textarea
                value={workoutText}
                onChange={(e) => setWorkoutText(e.target.value)}
                placeholder="Ej: Press banca 80kg x 8, 85kg x 6, Remo con barra 70kg x 10, Curl bíceps 15kg x 12..."
                rows={4}
                disabled={isLoading}
                className="w-full bg-transparent text-xs text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none resize-none"
              />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[#F5F5F7] hover:bg-white/10 active:scale-98 transition-all"
              >
                <IconCamera className="w-4 h-4 text-[#34C759]" />
                <span>{screenshotBase64 ? 'Captura Symmetry Cargada ✅' : 'Subir Captura de Symmetry'}</span>
              </button>

              <button
                onClick={handleAuditWorkout}
                disabled={isLoading || (!workoutText.trim() && !screenshotBase64)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#34C759] to-[#0A84FF] text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 shadow-lg"
              >
                <IconSparkles className="w-4 h-4 text-black" />
                <span>{isLoading ? 'Analizando con Gemini 2.0...' : 'Auditar y Guardar Sesión'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
