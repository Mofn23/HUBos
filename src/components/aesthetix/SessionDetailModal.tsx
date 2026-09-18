'use client';

import React, { useState } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { useHubStore } from '@/stores/useHubStore';
import { calculate1RM } from '@/lib/muscleRanks';
import { callGemini } from '@/lib/gemini';
import { useScrollLock } from '@/lib/useScrollLock';

interface SessionDetailModalProps {
  isOpen: boolean;
  session: WorkoutHistoryItem | null;
  onClose: () => void;
  onDelete: (sessionId: string) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  isOpen,
  session,
  onClose,
  onDelete,
}) => {
  const { geminiApiKey, showToast } = useHubStore();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useScrollLock(isOpen);

  if (!isOpen || !session) return null;

  const handleAnalyzeWithAI = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);

    try {
      // Build summary text of session for Gemini
      const exerciseSummary = session.exercises
        .map((ex) => {
          const completedSets = ex.sets.filter((s) => s.completed);
          if (completedSets.length === 0) return null;
          const setsDesc = completedSets
            .map((s) => `${s.weightKg}kg x ${s.reps} reps`)
            .join(', ');
          return `- ${ex.exerciseName} (${ex.target || ex.category}): ${setsDesc}`;
        })
        .filter(Boolean)
        .join('\n');

      const prompt = `Eres el Entrenador Jefe de Biomecánica e Hipertrofia de Aesthetix.
Analiza la siguiente sesión de entrenamiento completada por el usuario en el gimnasio:

DATOS DE LA SESIÓN:
- Rutina: ${session.routineName}
- Día: ${session.dayName}
- Duración: ${session.durationMinutes} minutos
- Volumen Total Levantado: ${session.totalVolumeKg} kg
- Total de Series Completadas: ${session.totalSets}
- Nuevos Récords Personales (PRs): ${session.prCount}

EJERCICIOS Y CARGAS REGISTRADAS:
${exerciseSummary}

INSTRUCCIONES:
Proporciona un análisis conciso, biomecánico, motivador y directo (máximo 180 palabras), estructurado con estos 4 puntos:
1. ⚡ **Intensidad & Estímulo Hipertrófico**: Evalúa el volumen y esfuerzo de la sesión.
2. 📈 **Sobrecarga Progresiva Próxima**: Indica qué aumentar en la siguiente sesión (ej. +1.25kg o +1 rep).
3. 🧬 **Recuperación Clave**: Qué músculo necesita más descanso hoy.
4. 🏆 **Veredicto del Entrenador**: Calificación (ej. 9.5/10) y frase de mentalidad implacable.`;

      const analysis = await callGemini(geminiApiKey, prompt);
      setAiAnalysis(analysis);
      showToast('✨ Análisis de sesión completado por Gemini IA.');
    } catch (err: any) {
      const msg = err?.message || 'Error al conectar con Gemini IA.';
      showToast(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este entrenamiento del historial? Esta acción es permanente.'
    );
    if (confirmDelete) {
      onDelete(session.id);
      showToast('Entrenamiento eliminado del historial.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Main Glass Modal Card */}
      <div
        className="relative w-full max-w-lg glass-surface-elevated rounded-[36px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden text-[#F5F5F7] overscroll-contain"
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#34C759]">
                Sesión Finalizada • {session.date}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {session.dayName || session.routineName}
            </h2>
            <p className="text-xs font-bold text-[#8E8E93]">{session.routineName}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {/* Bento Metrics 4-Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="glass-surface p-2.5 rounded-[20px] text-center border border-white/10">
              <span className="text-[10px] font-bold text-[#8E8E93] block">⏱️ Tiempo</span>
              <span className="text-sm font-mono font-black text-[#F5F5F7]">
                {session.durationMinutes}m
              </span>
            </div>

            <div className="glass-surface p-2.5 rounded-[20px] text-center border border-[#34C759]/30">
              <span className="text-[10px] font-bold text-[#8E8E93] block">⚡ Volumen</span>
              <span className="text-sm font-mono font-black text-[#34C759]">
                {session.totalVolumeKg}k
              </span>
            </div>

            <div className="glass-surface p-2.5 rounded-[20px] text-center border border-[#64D2FF]/30">
              <span className="text-[10px] font-bold text-[#8E8E93] block">💪 Series</span>
              <span className="text-sm font-mono font-black text-[#64D2FF]">
                {session.totalSets}
              </span>
            </div>

            <div className="glass-surface p-2.5 rounded-[20px] text-center border border-[#FFD60A]/30">
              <span className="text-[10px] font-bold text-[#8E8E93] block">🏆 PRs</span>
              <span className="text-sm font-mono font-black text-[#FFD60A]">
                {session.prCount}
              </span>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="glass-surface rounded-[26px] p-4 border border-[#64D2FF]/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#64D2FF]">
                  Análisis Inteligente Gemini
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={isAiLoading}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#64D2FF] hover:bg-[#64D2FF]/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>{aiAnalysis ? 'Regenerar' : 'Analizar Sesión'}</span>
                  </>
                )}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="p-3.5 rounded-[20px] bg-black/40 border border-white/10 text-xs font-medium text-[#F5F5F7] leading-relaxed whitespace-pre-wrap animate-fade-in">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Toca &quot;Analizar Sesión&quot; para recibir un diagnóstico biomecánico detallado,
                sugerencias de sobrecarga progresiva y el veredicto del entrenador con IA.
              </p>
            )}
          </div>

          {/* Exercises and Sets Detail Breakdown */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-1">
              DESGLOSE DETALLADO DE EJERCICIOS Y SERIES
            </span>

            <div className="space-y-2.5">
              {session.exercises.map((ex, exIdx) => {
                const completedSets = ex.sets.filter((s) => s.completed);
                if (completedSets.length === 0) return null;

                const exVolume = completedSets.reduce(
                  (acc, s) => acc + s.weightKg * s.reps,
                  0
                );
                const bestSet = completedSets.reduce(
                  (max, s) => (s.weightKg > max.weightKg ? s : max),
                  completedSets[0]
                );
                const best1RM = calculate1RM(bestSet.weightKg, bestSet.reps);

                return (
                  <div
                    key={exIdx}
                    className="glass-surface-elevated rounded-[24px] p-3.5 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/[0.08] text-[10px] font-black flex items-center justify-center text-[#8E8E93]">
                          {exIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-[#F5F5F7] capitalize">
                            {ex.exerciseName}
                          </h4>
                          <span className="text-[10px] font-bold text-[#34C759] capitalize">
                            {ex.target || ex.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono font-black text-[#64D2FF] block">
                          {exVolume} kg vol.
                        </span>
                        <span className="text-[9px] font-bold text-[#8E8E93]">
                          1RM est: {best1RM}kg
                        </span>
                      </div>
                    </div>

                    {/* Table of Sets */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-12 text-[9px] font-black uppercase tracking-wider text-[#8E8E93] px-2">
                        <span className="col-span-2">Serie</span>
                        <span className="col-span-4 text-center">Peso</span>
                        <span className="col-span-3 text-center">Reps</span>
                        <span className="col-span-3 text-right">1RM Est.</span>
                      </div>

                      {completedSets.map((s, sIdx) => {
                        const est1RM = calculate1RM(s.weightKg, s.reps);
                        return (
                          <div
                            key={s.id || sIdx}
                            className="grid grid-cols-12 items-center px-2 py-1.5 rounded-[12px] bg-white/[0.03] text-xs font-mono"
                          >
                            <span className="col-span-2 text-[#8E8E93] font-bold">
                              #{s.setNumber || sIdx + 1}
                            </span>
                            <span className="col-span-4 text-center text-[#F5F5F7] font-black">
                              {s.weightKg} kg
                            </span>
                            <span className="col-span-3 text-center text-[#34C759] font-black">
                              {s.reps} reps
                            </span>
                            <span className="col-span-3 text-right text-[#8E8E93] font-bold">
                              {est1RM}kg
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-3 rounded-full glass-pill text-xs font-black text-[#FF453A] hover:bg-[#FF453A]/20 active:scale-95 transition-all flex items-center gap-1.5 border border-[#FF453A]/30"
          >
            <span>🗑️</span>
            <span>Eliminar Sesión</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-white/[0.1] text-[#F5F5F7] hover:bg-white/[0.18] text-xs font-black active:scale-95 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
