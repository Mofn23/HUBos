'use client';

import React, { useState } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { WorkoutRoutine, Exercise } from '@/types/workout';
import { getExerciseById, getExerciseMediaUrls, BODY_PART_TRANSLATIONS } from '@/lib/exercisesDb';
import { useScrollLock } from '@/lib/useScrollLock';
import { CustomRoutineModal } from './CustomRoutineModal';

interface RoutinesTabProps {
  onStartSession: (routineId?: string, dayIndex?: number) => void;
}

export const RoutinesTab: React.FC<RoutinesTabProps> = ({
  onStartSession,
}) => {
  const { routines, activeRoutineId, setActiveRoutineId, deleteRoutine } = useAesthetixStore();
  const { showToast } = useHubStore();

  const [isCustomRoutineModalOpen, setIsCustomRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<WorkoutRoutine | undefined>();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<Exercise | null>(null);

  // Lock background scrolling in iOS WebKit when modal is open
  useScrollLock(!!selectedExerciseModal || isCustomRoutineModalOpen);

  const activeRoutine =
    routines.find((r) => r.id === activeRoutineId) || routines[0];

  const openRoutineCreator = () => {
    setRoutineToEdit(undefined);
    setIsCustomRoutineModalOpen(true);
  };

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
        <p className="text-xs text-[#8E8E93]">Crea una rutina y organiza tus días de entrenamiento.</p>
        <button
          onClick={openRoutineCreator}
          className="px-6 py-3 rounded-full bg-[#A1F524] text-black font-black text-xs shadow-md active:scale-95"
        >
          + Crear rutina
        </button>
      </div>
    );
  }

  const selectedDay = activeRoutine.days[selectedDayIdx] || activeRoutine.days[0];

  return (
    <div className="aesthetix-tab-redesign aesthetix-workouts space-y-4 animate-fade-in">
      {/* 0. Routines Quick Switcher Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
            MIS RUTINAS ({routines.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={openRoutineCreator}
              className="text-[11px] font-black text-[#A1F524] hover:underline flex items-center gap-1"
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
                    ? 'bg-[#A1F524] text-black shadow-md'
                    : 'fitness-pill text-[#8E8E93] hover:text-white'
                }`}
              >
                <span>{isActive ? '⚡' : '📋'}</span>
                  <span className="truncate max-w-[140px]">{r.name.replace(/^Protocolo\s+/i, '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Hero Bento Card: Active Routine */}
      <div className="fitness-surface rounded-[30px] p-5 border-t-white/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A1F524] shadow-[0_0_8px_#A1F524]" />
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
            <span className="px-3 py-1 rounded-full bg-[#A1F524]/15 text-[#A1F524] text-[11px] font-black border border-[#A1F524]/25">
              {activeRoutine.targetDaysPerWeek} Días / Sem
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 text-xl font-black text-[#F5F5F7] tracking-tight truncate">
            {activeRoutine.name.replace(/^Protocolo\s+/i, '')}
          </h2>
          <button
            type="button"
            onClick={() => {
              setRoutineToEdit(activeRoutine);
              setIsCustomRoutineModalOpen(true);
            }}
            className="fitness-pill shrink-0 px-3 py-2 rounded-full text-[11px] font-black text-[#A1F524] fitness-press"
            aria-label={`Editar rutina ${activeRoutine.name}`}
          >
            ✎ Editar
          </button>
        </div>

        {/* Start Today's Workout Quick Action */}
        <button
          onClick={() => onStartSession(activeRoutine.id, selectedDayIdx)}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#A1F524] to-[#2ECC71] text-black font-black text-xs shadow-[0_0_25px_rgba(161,245,36,0.35)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
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
              onClick={() => {
                setSelectedDayIdx(idx);
                setShowAllExercises(false);
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all ${
                selectedDayIdx === idx
                  ? 'bg-[#A1F524] text-black shadow-md'
                  : 'fitness-pill text-[#8E8E93] hover:text-white'
              }`}
            >
              {day.dayName}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Selected Day Exercises Bento Card */}
      {selectedDay && (
        <div className="fitness-surface-elevated rounded-[28px] p-4 border-t-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h4 className="text-sm font-black text-[#F5F5F7]">{selectedDay.dayName}</h4>
              <p className="text-[11px] font-bold text-[#A1F524]">{selectedDay.focus}</p>
            </div>

            <button
              onClick={() => onStartSession(activeRoutine.id, selectedDayIdx)}
              className="fitness-pill px-3 py-1.5 rounded-full text-xs font-black text-[#A1F524] hover:text-white active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Entrenar</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2">
            {selectedDay.exercises
              .slice(0, showAllExercises ? selectedDay.exercises.length : 3)
              .map((ex, eIdx) => {
              const dbEx = getExerciseById(ex.exerciseId);
              return (
                <div
                  key={ex.id || eIdx}
                  onClick={() => dbEx && setSelectedExerciseModal(dbEx)}
                  className="fitness-surface p-2.5 rounded-[22px] flex items-center justify-between gap-3 cursor-pointer hover:border-[#A1F524]/40 active:scale-98 transition-all"
                >
                  {/* Exercise Thumbnail / GIF */}
                  <div className="w-12 h-12 rounded-[16px] bg-[#000000] overflow-hidden flex items-center justify-center shrink-0 border border-white/10 relative p-0.5">
                    {(() => {
                      const media = dbEx ? getExerciseMediaUrls(dbEx) : null;
                      return media?.imageUrl ? (
                        <img
                          src={media.imageUrl}
                          alt={ex.name}
                          className="w-full h-full object-contain exercise-media-dark"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = (e.currentTarget as HTMLElement).parentElement;
                            if (parent && !parent.querySelector('.img-fallback')) {
                              const fallback = document.createElement('span');
                              fallback.className = 'text-base img-fallback';
                              fallback.innerText = '🏋️';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-base">🏋️</span>
                      );
                    })()}
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[8px] text-[#A1F524] font-mono">
                      {eIdx + 1}
                    </span>
                  </div>

                  {/* Exercise Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#F5F5F7] capitalize truncate">{ex.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E8E93] mt-0.5">
                      <span className="text-[#A1F524]">{ex.restSeconds}s descanso</span>
                      <span>•</span>
                      <span className="text-[#A1F524] capitalize">
                        {dbEx?.target || ex.target || 'Músculo'}
                      </span>
                    </div>
                  </div>

                  {/* Sets x Reps Pill */}
                  <div className="px-2.5 py-1.5 rounded-full bg-white/[0.06] text-xs font-mono font-black text-[#A1F524] shrink-0 border border-white/5">
                    {ex.targetSets} x {ex.targetReps}
                  </div>
                </div>
              );
              })}
          </div>

          {selectedDay.exercises.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllExercises((shown) => !shown)}
              aria-expanded={showAllExercises}
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 text-xs font-bold text-[#A1F524] transition-colors hover:bg-white/[0.08]"
            >
              {showAllExercises ? 'Mostrar menos' : `Más · ${selectedDay.exercises.length - 3} ejercicios`}
            </button>
          )}
        </div>
      )}

      {/* Custom Routine Designer Modal */}
      <CustomRoutineModal
        isOpen={isCustomRoutineModalOpen}
        routineToEdit={routineToEdit}
        onClose={() => {
          setIsCustomRoutineModalOpen(false);
          setRoutineToEdit(undefined);
        }}
        onRoutineUpdated={(dayIndex) => {
          setSelectedDayIdx(dayIndex);
          setShowAllExercises(true);
        }}
      />

      {/* Exercise Detail GIF & Instructions Modal */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedExerciseModal(null)}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          <div
            className="relative w-full max-w-md fitness-surface-elevated rounded-[32px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[85vh] flex flex-col overscroll-contain"
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#F5F5F7] capitalize truncate">
                  {selectedExerciseModal.name}
                </h3>
                <p className="text-[11px] font-bold text-[#A1F524] capitalize">
                  {BODY_PART_TRANSLATIONS[selectedExerciseModal.body_part] || selectedExerciseModal.body_part} • {selectedExerciseModal.target}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseModal(null)}
                className="w-7 h-7 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar overscroll-contain">
              {/* High-res GIF / Image Preview */}
              <div className="w-full aspect-video rounded-[20px] bg-[#000000] overflow-hidden flex items-center justify-center border border-white/10 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
                {(() => {
                  const media = getExerciseMediaUrls(selectedExerciseModal);
                  const src = media.gifUrl || media.imageUrl;
                  return src ? (
                    <img
                      src={src}
                      alt={selectedExerciseModal.name}
                      className="w-full h-full object-contain p-2 relative z-10 exercise-media-dark"
                      onError={(e) => {
                        if (media.imageUrl && e.currentTarget.src !== media.imageUrl) {
                          e.currentTarget.src = media.imageUrl;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-3xl">🏋️</span>
                  );
                })()}
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
              className="w-full py-3 rounded-full bg-[#A1F524] text-black font-black text-xs shadow-md active:scale-98 transition-all shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
