'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRecompStore, TrainingLogEntry } from '@/stores/useRecompStore';
import { useHubStore } from '@/stores/useHubStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MuscleHeatmap } from './MuscleHeatmap';
import { DateSelectionModal } from './DateSelectionModal';
import { parseSymmetryScreenshots } from '@/lib/gemini';
import { compressImage } from '@/lib/image';
import { getDailyRoutine } from '@/lib/trainingSchedule';
import { IconChevronRight, IconSparkles, IconTrash } from '../common/Icons';

export const TrainingSection: React.FC = () => {
  const { selectedDate, trainingLogs, addTrainingLog, deleteTrainingLog, setIsModalOpen } = useRecompStore();
  const { geminiApiKey, showToast } = useHubStore();

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TrainingLogEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formattedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });
  const routine = getDailyRoutine(selectedDate);

  // Sync isModalOpen so bottom nav bar hides when viewing workout detail
  useEffect(() => {
    if (selectedLog || isDateModalOpen) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
    return () => {
      setIsModalOpen(false);
    };
  }, [selectedLog, isDateModalOpen, setIsModalOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, 4); // Up to 4 screenshots
    setIsAnalyzing(true);

    try {
      showToast(`⚡ Comprimiendo ${files.length} captura(s) de Symmetry...`);

      // Compress all images in parallel
      const compressedBase64List = await Promise.all(
        files.map((f) => compressImage(f, 800, 0.7))
      );

      showToast('🤖 Extrayendo rutina y series con Gemini IA...');

      const result = await parseSymmetryScreenshots(compressedBase64List, geminiApiKey);

      const newLog: TrainingLogEntry = {
        id: `train-${Date.now()}`,
        date: selectedDate,
        title: result.routineTitle || routine.title || 'Entrenamiento Symmetry',
        muscleGroups: result.exercises.map((e) => e.targetMuscle || 'General'),
        totalVolumeKg: result.totalVolumeKg || 5000,
        durationMinutes: 55,
        exercises: result.exercises.map((ex, idx) => ({
          id: `ex-${idx}-${Date.now()}`,
          name: ex.name,
          targetMuscle: ex.targetMuscle || 'Músculo',
          sets: ex.sets.map((s, sIdx) => ({
            setNumber: sIdx + 1,
            weightKg: Number(s.weightKg) || 0,
            reps: Number(s.reps) || 0,
            rpe: s.rpe,
          })),
        })),
        symmetryNotes: result.recommendations,
      };

      addTrainingLog(newLog);
      setSelectedLog(newLog);
      showToast(`💪 ¡${newLog.title} registrado con éxito!`);
    } catch (err: any) {
      console.error('Error parsing Symmetry workout:', err);
      showToast(err?.message || 'Error al analizar las capturas de Symmetry.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-5 pb-36 animate-fade-in relative z-10">
      {/* 1. Header */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          Módulo de Rendimiento
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F7] flex items-center gap-2 tracking-tight">
          <span>💪</span>
          <span>Entrenamiento & Gym</span>
        </h1>
        <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
          Compañero analítico de Symmetry, volumen y recuperación
        </p>
      </div>

      {/* 2. Bento Card: Rutina de Hoy (New Split) */}
      <div className="glass-surface rounded-[28px] p-5 border-t-white/20 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{routine.icon}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] block">
                Sesión Programada
              </span>
              <h3 className="text-base font-black text-[#F5F5F7] tracking-tight">
                {routine.title}
              </h3>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              routine.isRest
                ? 'bg-white/10 text-[#8E8E93] border-white/15'
                : 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30 shadow-[0_0_10px_rgba(52,199,89,0.25)]'
            }`}
          >
            {routine.focus}
          </span>
        </div>

        <p className="text-xs font-bold text-[#8E8E93] leading-relaxed">
          {routine.subtitle}
        </p>
      </div>

      {/* 3. Muscle Heatmap */}
      <MuscleHeatmap />

      {/* 4. Training Date Selector Card */}
      <div className="glass-surface p-4 rounded-[26px] flex items-center justify-between border-t-white/20 shadow-sm">
        <span className="text-xs font-black text-[#F5F5F7]">Fecha del entrenamiento</span>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="glass-pill px-4 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] capitalize hover:border-white/30 active:scale-95 transition-transform"
        >
          🗓️ {formattedDate}
        </button>
      </div>

      {/* 5. Subir Capturas de Symmetry Card */}
      <div className="glass-surface rounded-[28px] p-5.5 border-t-white/20 shadow-lg space-y-3.5 text-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full py-4 px-6 rounded-full bg-[#FF453A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,69,58,0.4)] active:scale-95 hover:scale-[1.01] transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <IconSparkles className="w-5 h-5 animate-spin" />
              <span>Extrayendo rutina con Gemini...</span>
            </>
          ) : (
            <>
              <span className="text-base">☁️</span>
              <span>Subir Capturas de Symmetry (Hasta 4)</span>
            </>
          )}
        </button>
        <p className="text-xs font-bold text-[#8E8E93] leading-relaxed px-2">
          Puedes seleccionar hasta 4 pantallazos juntos. La IA unificará series, pesos y volumen de tu sesión.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* 6. Historial de Entrenamientos */}
      <div className="glass-surface rounded-[28px] p-5 space-y-3.5 border-t-white/20 shadow-md">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
            <span>🏋️</span>
            <span>Historial de Sesiones</span>
          </div>
          <span className="text-xs font-bold text-[#8E8E93]">
            {trainingLogs.length === 0 ? 'Sin registros' : `${trainingLogs.length} sesiones`}
          </span>
        </div>

        {trainingLogs.length === 0 ? (
          <div className="p-6 text-center space-y-2 flex flex-col items-center">
            <span className="text-3xl">🏋️</span>
            <span className="text-xs font-bold text-[#8E8E93] max-w-xs text-center">
              Sube tus capturas de Symmetry para registrar y calcular tu tonelaje levantado.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {trainingLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="glass-pill p-4 rounded-[22px] flex items-center justify-between cursor-pointer hover:border-white/30 active:scale-[0.98] transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl glass-surface flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    🏋️
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-[#F5F5F7] truncate group-hover:text-[#34C759] transition-colors">
                      {log.title}
                    </h4>
                    <p className="text-[11px] font-bold text-[#8E8E93] mt-0.5">
                      {log.date} • {log.exercises.length} ejercicios • {log.totalVolumeKg || 0} kg
                    </p>
                  </div>
                </div>
                <IconChevronRight className="w-4 h-4 text-[#8E8E93] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Detail Modal (Glassmorphism Elevated) */}
      {selectedLog && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedLog(null)}
          />
          <div
            className="relative glass-surface-elevated border-t border-white/20 w-full max-w-md rounded-t-[38px] p-6 pb-16 z-20 animate-sheet-up space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">{selectedLog.title}</h3>
                <p className="text-xs font-black text-[#34C759] mt-0.5">{selectedLog.date} • {selectedLog.totalVolumeKg || 0} kg total</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="glass-pill w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                <span className="text-sm font-bold">✕</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                Ejercicios & Series
              </div>
              {selectedLog.exercises.map((ex, idx) => (
                <div key={idx} className="glass-surface p-3.5 rounded-2xl space-y-1.5 shadow-sm border-t-white/10">
                  <div className="text-xs font-black text-[#F5F5F7] flex items-center justify-between">
                    <span>{ex.name}</span>
                    <span className="text-[10px] text-[#34C759] font-black px-2 py-0.5 rounded-full bg-[#34C759]/15">
                      {ex.sets.length} series
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ex.sets.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="glass-pill px-2.5 py-1 rounded-xl text-[10px] font-black text-[#F5F5F7]"
                      >
                        S{s.setNumber}: {s.weightKg}kg × {s.reps} {s.rpe ? `(RPE ${s.rpe})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedLog.symmetryNotes && (
              <div className="glass-surface p-3.5 rounded-2xl border border-[#34C759]/30 text-xs font-bold text-[#34C759] leading-relaxed">
                💡 {selectedLog.symmetryNotes}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar sesión ${selectedLog.title}?`)) {
                    deleteTrainingLog(selectedLog.id);
                    setSelectedLog(null);
                    showToast('🗑️ Sesión eliminada.');
                  }
                }}
                className="py-3 px-4 rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <IconTrash className="w-4 h-4" />
                <span>Eliminar</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 py-3 rounded-full bg-[#34C759] text-black font-black text-xs active:scale-95 transition-all shadow-md"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <DateSelectionModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />
    </div>
  );
};
