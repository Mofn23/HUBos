'use client';

import React, { useState, useRef } from 'react';
import { useRecompStore, TrainingLogEntry } from '@/stores/useRecompStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MuscleHeatmap } from './MuscleHeatmap';
import { DateSelectionModal } from './DateSelectionModal';
import { parseSymmetryScreenshots } from '@/lib/gemini';
import { IconChevronRight, IconSparkles } from '../common/Icons';

export const TrainingSection: React.FC = () => {
  const { selectedDate, trainingLogs, addTrainingLog } = useRecompStore();
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TrainingLogEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formattedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await parseSymmetryScreenshots([base64]);
          const newLog: TrainingLogEntry = {
            id: `train-${Date.now()}`,
            date: selectedDate,
            title: result.routineTitle || 'Entrenamiento Symmetry',
            muscleGroups: result.exercises.map((e) => e.targetMuscle || 'General'),
            totalVolumeKg: result.totalVolumeKg || 5000,
            durationMinutes: 50,
            exercises: result.exercises.map((ex, idx) => ({
              id: `ex-${idx}`,
              name: ex.name,
              targetMuscle: ex.targetMuscle || 'Músculo',
              sets: ex.sets.map((s, sIdx) => ({
                setNumber: sIdx + 1,
                weightKg: s.weightKg,
                reps: s.reps,
                rpe: s.rpe,
              })),
            })),
            symmetryNotes: result.recommendations,
          };
          addTrainingLog(newLog);
          setSelectedLog(newLog);
        } catch (err: any) {
          alert('Error al analizar capturas: ' + err.message);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
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
      <MuscleHeatmap trainingLogs={trainingLogs} />

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
          className="w-full py-4 px-6 rounded-full bg-[#E8505B] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(232,80,91,0.35)] active:scale-95 transition-all"
        >
          {isAnalyzing ? (
            <>
              <IconSparkles className="w-5 h-5 animate-spin" />
              <span>Extrayendo con Gemini 2.0...</span>
            </>
          ) : (
            <>
              <span>☁️</span>
              <span>Subir Capturas de Symmetry</span>
            </>
          )}
        </button>
        <p className="text-xs font-bold text-[#8E8E93] text-center px-2 leading-relaxed">
          Sube capturas de pantalla de tu sesión en Symmetry. La IA extraerá tus pesos y repeticiones al instante.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
          <span className="text-xs font-bold text-[#8E8E93]">{trainingLogs.length} sesiones</span>
        </div>

        <div className="space-y-2.5">
          {trainingLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-[#242426] active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-[#2A2A2C] flex items-center justify-center text-2xl shrink-0">
                  🏋️
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-black text-[#F5F5F7] truncate">{log.title}</h4>
                  <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                    {log.date} • {log.exercises.length} ejercicios
                  </p>
                </div>
              </div>
              <IconChevronRight className="w-5 h-5 text-[#8E8E93] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedLog(null)}
          />
          <div
            className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[32px] p-6 pb-10 z-10 animate-sheet-up space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#F5F5F7]">{selectedLog.title}</h3>
                <p className="text-xs font-bold text-[#34C759]">{selectedLog.date}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#8E8E93]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black text-[#8E8E93] uppercase">Ejercicios Realizados</div>
              {selectedLog.exercises.map((ex, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#1C1C1E] border border-white/5 space-y-1">
                  <div className="text-xs font-black text-[#F5F5F7] flex items-center justify-between">
                    <span>{ex.name}</span>
                    <span className="text-[11px] text-[#34C759]">{ex.sets.length} series</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ex.sets.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-[#2A2A2C] text-[10px] font-bold text-[#8E8E93]"
                      >
                        S{s.setNumber}: {s.weightKg}kg x {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedLog.symmetryNotes && (
              <div className="p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 text-xs font-bold text-[#34C759]">
                💡 {selectedLog.symmetryNotes}
              </div>
            )}

            <button
              onClick={() => setSelectedLog(null)}
              className="btn-primary w-full py-3 text-xs mt-2"
            >
              Cerrar Detalle
            </button>
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
