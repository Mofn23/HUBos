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
import { IconChevronRight, IconSparkles, IconTrash } from '../common/Icons';

export const TrainingSection: React.FC = () => {
  const { selectedDate, trainingLogs, addTrainingLog, deleteTrainingLog, setIsModalOpen } = useRecompStore();
  const { geminiApiKey, showToast } = useHubStore();

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TrainingLogEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formattedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });

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
        title: result.routineTitle || 'Entrenamiento Symmetry',
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
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F5F5F7] flex items-center gap-2">
          <span>💪</span>
          <span>Entrenamiento</span>
        </h1>
        <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
          Compañero analítico de Symmetry e IA
        </p>
      </div>

      {/* 2. Muscle Heatmap */}
      <MuscleHeatmap />

      {/* 3. Training Date Selector Card */}
      <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between">
        <span className="text-sm font-extrabold text-[#F5F5F7]">Fecha del entrenamiento</span>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2A2A2C] border border-white/10 text-xs font-extrabold text-[#F5F5F7] capitalize active:scale-95 transition-transform"
        >
          {formattedDate}
        </button>
      </div>

      {/* 4. Subir Capturas de Symmetry Card & Coral Button */}
      <div className="p-5 rounded-[24px] bg-[#1C1C1E] border border-white/5 space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full py-4 px-6 rounded-full bg-[#E8505B] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(232,80,91,0.35)] active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <IconSparkles className="w-5 h-5 animate-spin" />
              <span>Extrayendo rutina con Gemini...</span>
            </>
          ) : (
            <>
              <span>☁️</span>
              <span>Subir Capturas de Symmetry (Hasta 4)</span>
            </>
          )}
        </button>
        <p className="text-xs font-bold text-[#8E8E93] text-center px-2 leading-relaxed">
          Puedes seleccionar hasta 4 capturas a la vez. La IA unificará todos los ejercicios, pesos y repeticiones de tu sesión.
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

      {/* 5. Historial de Entrenamientos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242426] border border-white/5 text-xs font-black text-[#F5F5F7]">
            <span>🏋️</span>
            <span>Historial de Entrenamientos</span>
          </div>
          <span className="text-xs font-bold text-[#8E8E93]">
            {trainingLogs.length === 0 ? 'Sin registros' : `${trainingLogs.length} sesiones`}
          </span>
        </div>

        {trainingLogs.length === 0 ? (
          <div className="card empty-state" style={{ padding: '24px 16px' }}>
            <span className="text-2xl">🏋️</span>
            <span className="text-xs font-bold text-[#8E8E93] max-w-xs text-center mt-1">
              Sube tus capturas de pantalla de Symmetry para ver el historial y análisis de tus ejercicios.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {trainingLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#242426] active:scale-[0.98] transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-[#242426] flex items-center justify-center text-2xl shrink-0">
                    🏋️
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-black text-[#F5F5F7] truncate group-hover:text-[#34C759] transition-colors">{log.title}</h4>
                    <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                      {log.date} • {log.exercises.length} ejercicios
                    </p>
                  </div>
                </div>
                <IconChevronRight className="w-5 h-5 text-[#8E8E93] shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedLog(null)}
          />
          <div
            className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[36px] p-6 pb-16 z-20 animate-sheet-up space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F5F5F7]">{selectedLog.title}</h3>
                <p className="text-xs font-bold text-[#34C759]">{selectedLog.date}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                <span className="text-base font-bold">✕</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black text-[#8E8E93] uppercase">Ejercicios Realizados</div>
              {selectedLog.exercises.map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1.5 shadow-sm">
                  <div className="text-xs font-black text-[#F5F5F7] flex items-center justify-between">
                    <span>{ex.name}</span>
                    <span className="text-[11px] text-[#34C759] font-extrabold">{ex.sets.length} series</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ex.sets.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-[#2A2A2C] text-[11px] font-bold text-[#F5F5F7] border border-white/5"
                      >
                        S{s.setNumber}: {s.weightKg}kg × {s.reps} {s.rpe ? `(RPE ${s.rpe})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedLog.symmetryNotes && (
              <div className="p-3.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-xs font-bold text-[#34C759] leading-relaxed">
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
                className="py-3.5 px-4 rounded-full bg-[#E8505B]/15 text-[#E8505B] text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <IconTrash className="w-4 h-4" />
                <span>Eliminar</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 py-3.5 rounded-full bg-[#34C759] text-black font-black text-xs active:scale-95 transition-all shadow-md"
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
