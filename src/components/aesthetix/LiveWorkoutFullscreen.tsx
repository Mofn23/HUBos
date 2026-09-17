'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { getExerciseById, getExerciseMediaUrls } from '@/lib/exercisesDb';
import { calculatePlates } from '@/lib/plateCalculator';
import { WorkoutHistoryItem } from '@/types/workout';

interface LiveWorkoutFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExercisesCatalog?: () => void;
}

export const LiveWorkoutFullscreen: React.FC<LiveWorkoutFullscreenProps> = ({
  isOpen,
  onClose,
  onOpenExercisesCatalog,
}) => {
  const { showToast } = useHubStore();
  const {
    activeSession,
    cancelWorkout,
    finishWorkout,
    updateSet,
    addSet,
    removeSet,
    setCurrentExerciseIndex,
    triggerRestTimer,
    adjustRestTimer,
    stopRestTimer,
    soundEnabled,
  } = useAesthetixStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(150);
  const [selectedPlateCalcWeight, setSelectedPlateCalcWeight] = useState<number | null>(null);
  const [completedSummary, setCompletedSummary] = useState<WorkoutHistoryItem | null>(null);

  // Track workout duration
  useEffect(() => {
    if (!isOpen || !activeSession) return;
    const interval = setInterval(() => {
      const sec = Math.max(0, Math.floor((Date.now() - activeSession.startTime) / 1000));
      setElapsedSeconds(sec);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeSession]);

  // Track rest countdown
  useEffect(() => {
    if (!isOpen || !activeSession?.isRestTimerRunning || !activeSession.restTimerEndTimestamp) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((activeSession.restTimerEndTimestamp! - now) / 1000));
      setTimerRemaining(left);

      if (left <= 0) {
        stopRestTimer();
        // Play audio chime if enabled
        if (soundEnabled && typeof window !== 'undefined') {
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.8);
            }
          } catch {}
        }
        showToast('⏰ ¡Tiempo de descanso completado! A por la siguiente serie 💪');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, activeSession?.isRestTimerRunning, activeSession?.restTimerEndTimestamp, soundEnabled, stopRestTimer, showToast]);

  if (!isOpen || !activeSession) return null;

  const currentExercise = activeSession.exercises[activeSession.currentExerciseIndex] || activeSession.exercises[0];
  const dbExercise = currentExercise ? getExerciseById(currentExercise.exerciseId) : null;
  const media = dbExercise ? getExerciseMediaUrls(dbExercise) : null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const summary = finishWorkout();
    if (summary) {
      setCompletedSummary(summary);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0D] flex flex-col overflow-hidden text-[#F5F5F7] animate-fade-in">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#34C759]/10 blur-[120px]" />
        <div className="absolute top-2/3 -right-20 w-80 h-80 rounded-full bg-[#FF375F]/10 blur-[120px]" />
      </div>

      {/* Top Bar Navigation */}
      <div className="relative z-10 px-4 pt-12 pb-3 flex items-center justify-between border-b border-white/10 glass-surface">
        <button
          onClick={onClose}
          className="glass-pill h-8 px-3 rounded-full text-xs font-black text-[#8E8E93] hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>⌄ Minimizar</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#34C759] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
            <span>En vivo • {formatTime(elapsedSeconds)}</span>
          </span>
          <span className="text-xs font-bold text-[#8E8E93] truncate max-w-[180px]">
            {activeSession.dayName || activeSession.routineName}
          </span>
        </div>

        <button
          onClick={handleFinish}
          className="px-3.5 h-8 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
        >
          <span>Finalizar</span>
          <span>✓</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar relative z-10 pb-44">
        {/* Exercise Selector Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeSession.exercises.map((ex, idx) => {
            const isCurrent = idx === activeSession.currentExerciseIndex;
            const completedSets = ex.sets.filter((s) => s.completed).length;
            const isAllDone = ex.sets.length > 0 && completedSets === ex.sets.length;

            return (
              <button
                key={idx}
                onClick={() => setCurrentExerciseIndex(idx)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#34C759] text-black shadow-md'
                    : isAllDone
                    ? 'glass-pill text-[#34C759] border-[#34C759]/40'
                    : 'glass-pill text-[#8E8E93] hover:text-white'
                }`}
              >
                <span>{idx + 1}.</span>
                <span className="truncate max-w-[110px] capitalize">{ex.exerciseName}</span>
                {isAllDone && <span>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Current Exercise Bento Hero with Live GIF Animation */}
        {currentExercise && (
          <div className="glass-surface-elevated rounded-[30px] p-4 border-t-white/20 shadow-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/25 text-[10px] font-black uppercase tracking-wider">
                  Ejercicio {activeSession.currentExerciseIndex + 1} de {activeSession.exercises.length}
                </span>
                <h2 className="text-xl font-black text-[#F5F5F7] capitalize tracking-tight mt-1">
                  {currentExercise.exerciseName}
                </h2>
                <p className="text-xs font-bold text-[#8E8E93]">
                  Objetivo: <span className="text-[#34C759] capitalize">{currentExercise.target}</span>
                </p>
              </div>

              {/* Prev / Next Exercise Buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={activeSession.currentExerciseIndex === 0}
                  onClick={() => setCurrentExerciseIndex(activeSession.currentExerciseIndex - 1)}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-xs disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  disabled={activeSession.currentExerciseIndex >= activeSession.exercises.length - 1}
                  onClick={() => setCurrentExerciseIndex(activeSession.currentExerciseIndex + 1)}
                  className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-xs disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Live Looping Animated GIF */}
            {media && (
              <div className="w-full flex items-center justify-center py-1">
                <div className="w-44 h-44 rounded-[22px] bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner relative">
                  <img
                    src={media.gifUrl}
                    alt={currentExercise.exerciseName}
                    className="w-full h-full object-contain p-2"
                    loading="eager"
                  />
                  <span className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[9px] font-black text-[#8E8E93] backdrop-blur-md">
                    GIF Técnica
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Set Logger Table */}
        {currentExercise && (
          <div className="glass-surface rounded-[28px] p-4 border-t-white/10 space-y-3">
            <div className="grid grid-cols-12 gap-1 text-[10px] font-black uppercase tracking-wider text-[#8E8E93] px-2 pb-1 border-b border-white/5">
              <span className="col-span-2 text-center">Serie</span>
              <span className="col-span-4 text-center">Peso (kg)</span>
              <span className="col-span-4 text-center">Reps</span>
              <span className="col-span-2 text-center">Hecho</span>
            </div>

            <div className="space-y-2">
              {currentExercise.sets.map((set, sIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-1 items-center p-2 rounded-[20px] transition-all ${
                    set.completed
                      ? 'glass-pill-active border-[#34C759]/40 bg-[#34C759]/10'
                      : 'glass-pill'
                  }`}
                >
                  {/* Set Number */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-black text-[#F5F5F7]">
                      {sIdx + 1}
                    </span>
                  </div>

                  {/* Weight Input + Plate Calculator Trigger */}
                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={set.weightKg || ''}
                      onChange={(e) =>
                        updateSet(activeSession.currentExerciseIndex, sIdx, {
                          weightKg: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="w-14 h-9 rounded-[14px] bg-black/40 border border-white/10 text-center text-xs font-black text-[#F5F5F7] outline-none focus:border-[#34C759]"
                    />
                    <button
                      onClick={() => setSelectedPlateCalcWeight(set.weightKg)}
                      title="Ver discos barra"
                      className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-[10px] text-[#8E8E93] hover:text-white"
                    >
                      🏋️
                    </button>
                  </div>

                  {/* Reps Input with +/- Buttons */}
                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <button
                      onClick={() =>
                        updateSet(activeSession.currentExerciseIndex, sIdx, {
                          reps: Math.max(1, set.reps - 1),
                        })
                      }
                      className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs font-black text-[#8E8E93] active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-black text-[#F5F5F7] w-6 text-center">
                      {set.reps}
                    </span>
                    <button
                      onClick={() =>
                        updateSet(activeSession.currentExerciseIndex, sIdx, {
                          reps: set.reps + 1,
                        })
                      }
                      className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs font-black text-[#8E8E93] active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  {/* Done Checkbox */}
                  <div className="col-span-2 flex items-center justify-center">
                    <button
                      onClick={() =>
                        updateSet(activeSession.currentExerciseIndex, sIdx, {
                          completed: !set.completed,
                        })
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-[#34C759] text-black font-black text-sm shadow-[0_0_15px_rgba(52,199,89,0.5)] scale-105'
                          : 'glass-pill text-[#8E8E93] border-white/20 hover:border-white/40'
                      }`}
                    >
                      {set.completed ? '✓' : ''}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Set Actions: Add Set & Remove Set */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                onClick={() => addSet(activeSession.currentExerciseIndex)}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#34C759] hover:text-white active:scale-95 transition-all flex items-center gap-1"
              >
                <span>+</span>
                <span>Agregar Serie</span>
              </button>

              {currentExercise.sets.length > 1 && (
                <button
                  onClick={() =>
                    removeSet(
                      activeSession.currentExerciseIndex,
                      currentExercise.sets.length - 1
                    )
                  }
                  className="text-[11px] font-bold text-[#8E8E93] hover:text-red-400 active:scale-95"
                >
                  Quitar última
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Another Exercise to this Session */}
        {onOpenExercisesCatalog && (
          <button
            onClick={onOpenExercisesCatalog}
            className="w-full py-3 rounded-[20px] glass-pill text-xs font-black text-[#64D2FF] hover:border-cyan-400/40 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Añadir otro ejercicio del catálogo (1.324 disponibles)</span>
          </button>
        )}
      </div>

      {/* Floating 2:30 Rest Timer Bar / Bottom Pod */}
      {activeSession.isRestTimerRunning && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto glass-surface-elevated rounded-[28px] p-4 border border-[#34C759]/40 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Circular Mini Progress */}
              <div className="w-12 h-12 rounded-full bg-[#34C759]/20 border border-[#34C759]/40 flex items-center justify-center text-sm font-black text-[#34C759] font-mono shadow-[0_0_15px_rgba(52,199,89,0.3)]">
                {formatTime(timerRemaining)}
              </div>

              <div>
                <p className="text-xs font-black text-[#F5F5F7]">Descanso en curso</p>
                <p className="text-[11px] font-bold text-[#8E8E93]">Respira y prepara la carga</p>
              </div>
            </div>

            {/* Quick +/- 10s and Skip */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustRestTimer(-10)}
                className="glass-pill px-2.5 py-1.5 rounded-full text-xs font-black text-[#8E8E93] hover:text-white active:scale-90"
              >
                -10s
              </button>
              <button
                onClick={() => adjustRestTimer(10)}
                className="glass-pill px-2.5 py-1.5 rounded-full text-xs font-black text-[#34C759] hover:text-white active:scale-90"
              >
                +10s
              </button>
              <button
                onClick={stopRestTimer}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-xs font-bold text-[#8E8E93] hover:text-white active:scale-90"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Olympic Plate Calculator Sheet Modal */}
      {selectedPlateCalcWeight !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedPlateCalcWeight(null)}
          />
          <div className="relative w-full max-w-sm glass-surface-elevated rounded-t-[32px] p-5 z-10 border-t border-white/20 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#F5F5F7]">
                Discos por lado: {selectedPlateCalcWeight} kg
              </h3>
              <button
                onClick={() => setSelectedPlateCalcWeight(null)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {(() => {
              const calc = calculatePlates(selectedPlateCalcWeight, 20);
              return (
                <div className="space-y-2">
                  <p className="text-xs text-[#8E8E93]">
                    Barra olímpica de <span className="text-[#F5F5F7] font-bold">20 kg</span> +{' '}
                    <span className="text-[#34C759] font-bold">{calc.perSideWeight} kg</span> en cada extremo.
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {calc.platesPerSide.length > 0 ? (
                      calc.platesPerSide.map((plate, pIdx) => (
                        <div
                          key={pIdx}
                          className="glass-pill p-2.5 rounded-[16px] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: plate.color }}
                            />
                            <span className="font-black text-[#F5F5F7]">{plate.weight} kg</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.08] font-mono font-black text-[#34C759]">
                            x {plate.count} {plate.count === 1 ? 'disco' : 'discos'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#8E8E93]">Solo la barra (sin discos adicionales).</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Finished Workout Celebration Modal */}
      {completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl" />
          <div className="relative w-full max-w-sm glass-surface-elevated rounded-[36px] p-6 z-10 border border-[#34C759]/40 text-center space-y-4 shadow-[0_0_50px_rgba(52,199,89,0.3)] animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#34C759]/20 border border-[#34C759]/40 flex items-center justify-center text-3xl mx-auto">
              🏆
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#34C759]">
                ¡Sesión Completada!
              </span>
              <h2 className="text-xl font-black text-[#F5F5F7] mt-1">{completedSummary.routineName}</h2>
              <p className="text-xs font-bold text-[#8E8E93]">{completedSummary.dayName}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="glass-pill p-2.5 rounded-[18px]">
                <p className="text-[10px] font-bold text-[#8E8E93]">Duración</p>
                <p className="text-sm font-black text-[#F5F5F7]">{completedSummary.durationMinutes}m</p>
              </div>
              <div className="glass-pill p-2.5 rounded-[18px]">
                <p className="text-[10px] font-bold text-[#8E8E93]">Volumen</p>
                <p className="text-sm font-black text-[#34C759]">{completedSummary.totalVolumeKg}kg</p>
              </div>
              <div className="glass-pill p-2.5 rounded-[18px]">
                <p className="text-[10px] font-bold text-[#8E8E93]">Series</p>
                <p className="text-sm font-black text-[#64D2FF]">{completedSummary.totalSets}</p>
              </div>
            </div>

            {completedSummary.prCount > 0 && (
              <div className="p-3 rounded-[18px] bg-[#FFD60A]/15 border border-[#FFD60A]/30 text-xs text-[#FFD60A] font-black flex items-center justify-center gap-1.5">
                <span>🔥</span>
                <span>¡{completedSummary.prCount} Nuevos Récords Personales (PR) batidos!</span>
              </div>
            )}

            <button
              onClick={() => {
                setCompletedSummary(null);
                onClose();
              }}
              className="w-full py-3.5 rounded-full bg-[#34C759] text-black font-black text-xs shadow-lg active:scale-95 transition-all"
            >
              Volver al HUB de Aesthetix
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
