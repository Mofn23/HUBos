'use client';

import React, { useState } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { WorkoutRoutine, Exercise } from '@/types/workout';
import { getExerciseById, BODY_PART_TRANSLATIONS } from '@/lib/exercisesDb';
import { CustomRoutineModal } from './CustomRoutineModal';

interface RoutinesTabProps {
  onStartSession: (routineId?: string, dayIndex?: number) => void;
  onOpenAiBuilder: () => void;
}

export const RoutinesTab: React.FC<RoutinesTabProps> = ({
  onStartSession,
  onOpenAiBuilder,
}) => {
  const { routines, activeRoutineId, setActiveRoutineId, deleteRoutine } = useAesthetixStore();
  const { showToast } = useHubStore();

  const [isCustomRoutineModalOpen, setIsCustomRoutineModalOpen] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);

  const activeRoutine =
    routines.find((r) => r.id === activeRoutineId) || routines[0];

  const handleDeleteCurrentRoutine = (routineId: string, name: string) => {
    if (routines.length <= 1) {
      showToast('Debes mantener al menos una rutina en tu biblioteca.');
      return;
    }
    const confirmDelete = window.confirm(`¿Eliminar la rutina "${name}"?`);
    if (confirmDelete) {
      deleteRoutine(routineId);
      const remaining = routines.filter((r) => r.id !== routineId);
      if (remaining.length > 0) {
        setActiveRoutineId(remaining[0].id);
      }
      setSelectedDayIdx(0);
      showToast('Rutina eliminada.');
    }
  };

  if (!activeRoutine) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center text-3xl">
          🏋️
        </div>
        <h3 className="text-lg font-black text-[#F5F5F7]">No tienes ninguna rutina activa</h3>
        <p className="text-xs text-[#8E8E93]">
          Genera una rutina de élite personalizada con Gemini IA en 1 minuto.
        </p>
        <button
          onClick={onOpenAiBuilder}
          className="px-6 py-3 rounded-full bg-[#64D2FF] text-black font-black text-xs shadow-md active:scale-95"
        >
          ✨ Crear con Gemini IA
        </button>
      </div>
    );
  }

  const selectedDay = activeRoutine.days[selectedDayIdx] || activeRoutine.days[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 0. Routines Quick Switcher Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
            MIS RUTINAS ({routines.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomRoutineModalOpen(true)}
              className="text-[11px] font-black text-[#34C759] hover:underline flex items-center gap-1"
            >
              <span>+ Manual (PPL x UL)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {routines.map((r) => {
            const isActive = r.id === activeRoutine.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRoutineId(r.id);
                  setSelectedDayIdx(0);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#34C759] text-black shadow-md'
                    : 'glass-pill text-[#8E8E93] hover:text-white'
                }`}
              >
                <span>{isActive ? '⚡' : '📋'}</span>
                <span className="truncate max-w-[140px]">{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Hero Bento Card: Active Routine */}
      <div className="glass-surface rounded-[30px] p-5 border-t-white/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Rutina Activa
            </span>
          </div>

          <div className="flex items-center gap-2">
            {routines.length > 1 && (
              <button
                onClick={() => handleDeleteCurrentRoutine(activeRoutine.id, activeRoutine.name)}
                className="text-[11px] font-bold text-[#8E8E93] hover:text-[#FF453A] transition-colors px-1"
                title="Eliminar rutina"
              >
                🗑️
              </button>
            )}
            <span className="px-3 py-1 rounded-full bg-[#34C759]/15 text-[#34C759] text-[11px] font-black border border-[#34C759]/25">
              {activeRoutine.targetDaysPerWeek} Días / Sem
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-[#F5F5F7] tracking-tight">
            {activeRoutine.name}
          </h2>
          <p className="text-xs font-semibold text-[#8E8E93] mt-1 leading-relaxed">
            {activeRoutine.description}
          </p>
        </div>

        {/* Start Today's Workout Quick Action */}
        <button
          onClick={() => onStartSession(activeRoutine.id, selectedDayIdx)}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#34C759] to-[#2ECC71] text-black font-black text-xs shadow-[0_0_25px_rgba(52,199,89,0.35)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-base">⚡</span>
          <span>Iniciar: {selectedDay?.dayName || 'Entrenamiento de Hoy'}</span>
        </button>
      </div>

      {/* 2. Days Segmented Horizontal Selector */}
      <div className="space-y-2">
        <div className="px-1 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
            DÍAS DEL PROTOCOLO
          </h3>
          <span className="text-[10px] font-bold text-[#636366]">
            {activeRoutine.days.length} días configurados
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeRoutine.days.map((day, idx) => (
            <button
              key={day.id || idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all ${
                selectedDayIdx === idx
                  ? 'bg-[#64D2FF] text-black shadow-md'
                  : 'glass-pill text-[#8E8E93] hover:text-white'
              }`}
            >
              {day.dayName}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Selected Day Exercises Bento Card */}
      {selectedDay && (
        <div className="glass-surface-elevated rounded-[28px] p-4 border-t-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h4 className="text-sm font-black text-[#F5F5F7]">{selectedDay.dayName}</h4>
              <p className="text-[11px] font-bold text-[#34C759]">{selectedDay.focus}</p>
            </div>

            <button
              onClick={() => onStartSession(activeRoutine.id, selectedDayIdx)}
              className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#34C759] hover:text-white active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Entrenar</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2">
            {selectedDay.exercises.map((ex, eIdx) => {
              const dbEx = getExerciseById(ex.exerciseId);
              return (
                <div
                  key={ex.id || eIdx}
                  onClick={() => dbEx && setSelectedExerciseModal(dbEx)}
                  className="glass-surface p-2.5 rounded-[22px] flex items-center justify-between gap-3 cursor-pointer hover:border-[#34C759]/40 active:scale-98 transition-all"
                >
                  {/* Exercise Thumbnail / GIF */}
                  <div className="w-12 h-12 rounded-[16px] bg-white/[0.04] overflow-hidden flex items-center justify-center shrink-0 border border-white/10 relative">
                    {dbEx?.image ? (
                      <img
                        src={dbEx.image}
                        alt={ex.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-base">🏋️</span>
                    )}
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[8px] text-[#34C759] font-mono">
                      {eIdx + 1}
                    </span>
                  </div>

                  {/* Exercise Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#F5F5F7] capitalize truncate">{ex.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E8E93] mt-0.5">
                      <span className="text-[#34C759]">{ex.restSeconds}s descanso</span>
                      <span>•</span>
                      <span className="text-[#64D2FF] capitalize">
                        {dbEx?.target || ex.target || 'Músculo'}
                      </span>
                    </div>
                  </div>

                  {/* Sets x Reps Pill */}
                  <div className="px-2.5 py-1.5 rounded-full bg-white/[0.06] text-xs font-mono font-black text-[#64D2FF] shrink-0 border border-white/5">
                    {ex.targetSets} x {ex.targetReps}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Action Banners: Manual Builder & AI Generator */}
      <div className="space-y-3">
        {/* Manual Custom Builder Banner */}
        <div
          onClick={() => setIsCustomRoutineModalOpen(true)}
          className="glass-surface rounded-[26px] p-4 flex items-center justify-between cursor-pointer hover:border-[#34C759]/40 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[16px] bg-[#34C759]/15 border border-[#34C759]/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🛠️
            </div>
            <div>
              <h4 className="text-xs font-black text-[#F5F5F7]">Diseñar Rutina Manual (PPL x UL)</h4>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Personaliza días de la semana y ejercicios a medida
              </p>
            </div>
          </div>

          <span className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#34C759]">
            Diseñar
          </span>
        </div>

        {/* AI Generator Banner */}
        <div
          onClick={onOpenAiBuilder}
          className="glass-surface rounded-[26px] p-4 flex items-center justify-between cursor-pointer hover:border-cyan-400/30 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[16px] bg-[#64D2FF]/15 border border-[#64D2FF]/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <h4 className="text-xs font-black text-[#F5F5F7]">Generador Inteligente Gemini</h4>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Crea una rutina personalizada con IA en segundos
              </p>
            </div>
          </div>

          <span className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#64D2FF]">
            Crear
          </span>
        </div>
      </div>

      {/* Custom Routine Designer Modal */}
      <CustomRoutineModal
        isOpen={isCustomRoutineModalOpen}
        onClose={() => setIsCustomRoutineModalOpen(false)}
      />

      {/* Exercise Detail GIF & Instructions Modal */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setSelectedExerciseModal(null)}
          />
          <div className="relative w-full max-w-md glass-surface-elevated rounded-[32px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#F5F5F7] capitalize truncate">
                  {selectedExerciseModal.name}
                </h3>
                <p className="text-[11px] font-bold text-[#34C759] capitalize">
                  {BODY_PART_TRANSLATIONS[selectedExerciseModal.body_part] || selectedExerciseModal.body_part} • {selectedExerciseModal.target}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseModal(null)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {/* High-res GIF / Image Preview */}
              <div className="w-full aspect-video rounded-[20px] bg-black/40 overflow-hidden flex items-center justify-center border border-white/10 relative">
                {selectedExerciseModal.gif_url || selectedExerciseModal.image ? (
                  <img
                    src={selectedExerciseModal.gif_url || selectedExerciseModal.image}
                    alt={selectedExerciseModal.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">🏋️</span>
                )}
              </div>

              {/* Steps / Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                  Técnica de Ejecución
                </h4>
                {selectedExerciseModal.steps_es && selectedExerciseModal.steps_es.length > 0 ? (
                  <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#E5E5EA] font-medium leading-relaxed">
                    {selectedExerciseModal.steps_es.map((step, sIdx) => (
                      <li key={sIdx} className="pl-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    {selectedExerciseModal.instructions_es || 'Mantén la postura controlada y rango de movimiento completo.'}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedExerciseModal(null)}
              className="w-full py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-98 transition-all shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
