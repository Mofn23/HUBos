'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import {
  getExerciseById,
  getExerciseMediaUrls,
  getAllExercises,
  searchExercises,
  BODY_PART_TRANSLATIONS,
} from '@/lib/exercisesDb';
import { calculatePlates } from '@/lib/plateCalculator';
import { WorkoutHistoryItem, Exercise } from '@/types/workout';
import { useScrollLock } from '@/lib/useScrollLock';
import {
  playSetCompleteSound,
  playRestTimerFinishedSound,
  playPersonalRecordSound,
} from '@/lib/soundEffects';
import { WorkoutSummaryCelebrationModal } from './WorkoutSummaryCelebrationModal';

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
    addExerciseToActiveSession,
    removeExerciseFromActiveSession,
    replaceExerciseInActiveSession,
    setExerciseNotes,
    setCurrentExerciseIndex,
    triggerRestTimer,
    adjustRestTimer,
    stopRestTimer,
    soundEnabled,
    prs,
    getMuscleTiers,
    recordPrDirectly,
  } = useAesthetixStore();

  useScrollLock(isOpen);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(150);
  const [selectedPlateCalcWeight, setSelectedPlateCalcWeight] = useState<number | null>(null);
  const [completedSummary, setCompletedSummary] = useState<WorkoutHistoryItem | null>(null);

  // Sub-modals for Symmetry action pills
  const [showTutorial, setShowTutorial] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [showMenuOptions, setShowMenuOptions] = useState(false);

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
        if (soundEnabled) {
          playRestTimerFinishedSound();
        }
        showToast('⏰ ¡Tiempo de descanso completado! A por la siguiente serie 💪');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, activeSession?.isRestTimerRunning, activeSession?.restTimerEndTimestamp, soundEnabled, stopRestTimer, showToast]);

  if (!isOpen || !activeSession) return null;

  const currentExercise =
    activeSession.exercises[activeSession.currentExerciseIndex] || activeSession.exercises[0];
  const dbExercise = currentExercise ? getExerciseById(currentExercise.exerciseId) : null;
  const media = dbExercise ? getExerciseMediaUrls(dbExercise) : null;

  // Muscle tier badge
  const muscleTiers = getMuscleTiers();
  const targetKey = currentExercise?.category || currentExercise?.target || 'pecho';
  const currentTierBadge =
    muscleTiers[targetKey as keyof typeof muscleTiers]?.badgeImage || '/ranks/rubi_2.png';

  // Filtered exercises for replacement modal
  const filteredReplacements = replaceQuery.trim()
    ? searchExercises(replaceQuery).slice(0, 30)
    : getAllExercises().slice(0, 30);

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

  const handleCancelWorkout = () => {
    const confirmCancel = window.confirm(
      '¿Estás seguro de que deseas cancelar la sesión? Todo el progreso no guardado se descartará.'
    );
    if (confirmCancel) {
      cancelWorkout();
      showToast('Entrenamiento cancelado.');
      onClose();
    }
  };

  const handleRemoveCurrentExercise = () => {
    if (!activeSession || activeSession.exercises.length <= 1) {
      showToast('No puedes quitar el único ejercicio. Si deseas salir, cancela la sesión.');
      return;
    }
    const confirmRemove = window.confirm(
      `¿Deseas quitar "${currentExercise.exerciseName}" de esta sesión?`
    );
    if (confirmRemove) {
      removeExerciseFromActiveSession(activeSession.currentExerciseIndex);
      showToast('Ejercicio eliminado de la sesión.');
    }
  };

  const handleToggleSetComplete = (setIndex: number) => {
    const set = currentExercise.sets[setIndex];
    const willBeCompleted = !set.completed;
    updateSet(activeSession.currentExerciseIndex, setIndex, { completed: willBeCompleted });

    if (willBeCompleted) {
      if (soundEnabled) {
        playSetCompleteSound();
      }

      // Real-time PR Detection
      if (set.weightKg > 0 && set.reps > 0) {
        const result = recordPrDirectly(
          currentExercise.exerciseId,
          currentExercise.exerciseName,
          set.weightKg,
          set.reps
        );
        if (result.isNewPr) {
          if (soundEnabled) {
            playPersonalRecordSound();
          }
          showToast(`🏆 ¡Nuevo Récord Personal! ${currentExercise.exerciseName}: ${set.weightKg} kg`);
        }
      }

      triggerRestTimer(150); // 2:30 min rest timer
    }
  };

  // Get previous performance string for an exercise
  const getPreviousPerformance = (sIdx: number) => {
    const pr = prs[currentExercise.exerciseId];
    if (pr && pr.maxWeightKg > 0) {
      return `${pr.maxWeightKg} x ${pr.maxReps}`;
    }
    // If no PR yet, check first set if available
    const firstSet = currentExercise.sets[0];
    if (firstSet && firstSet.weightKg > 0 && sIdx > 0) {
      return `${firstSet.weightKg} x ${firstSet.reps}`;
    }
    return '-';
  };

  return createPortal((
    <div className="live-workout-ui fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden text-[#F5F5F7] animate-fade-in overscroll-contain select-none">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR (Symmetry Style)                       */}
      {/* ======================================================== */}
      <div className="relative z-20 px-4 pt-[max(env(safe-area-inset-top),32px)] pb-3 flex items-center justify-between border-b border-white/[0.07] bg-black">
        {/* Left: Minimize button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/[0.08] flex items-center justify-center text-white active:scale-95 transition-all"
            title="Minimizar sesión"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Three dots options menu */}
          <button
            onClick={() => setShowMenuOptions(!showMenuOptions)}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/[0.08] flex items-center justify-center text-xs text-[#8E8E93] hover:text-white active:scale-95 transition-all"
            title="Opciones de entrenamiento"
          >
            •••
          </button>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-2 rounded-full bg-[#1C1C1E] px-3.5 py-2 font-mono text-sm font-black text-[#F5F5F7] tracking-wider tabular-nums">
          <span className="w-2 h-2 rounded-full bg-[#A1F524] shadow-[0_0_8px_#A1F524] animate-pulse" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Right: Terminar button */}
        <button
          onClick={handleFinish}
          className="px-4 py-2.5 rounded-full bg-[#A1F524] text-black text-xs font-black hover:bg-[#B7FF43] active:scale-95 transition-all"
        >
          Terminar
        </button>
      </div>

      {/* Dropdown menu for more options */}
      {showMenuOptions && (
        <div className="absolute top-24 left-4 z-30 w-56 rounded-[22px] fitness-surface-elevated p-2 border border-white/15 shadow-2xl space-y-1 animate-scale-up">
          <button
            onClick={() => {
              setShowMenuOptions(false);
              handleRemoveCurrentExercise();
            }}
            className="w-full px-3 py-2 text-left text-xs font-bold text-[#FF453A] hover:bg-white/5 rounded-[14px] flex items-center gap-2"
          >
            <span>🗑</span>
            <span>Quitar este ejercicio</span>
          </button>
          <button
            onClick={() => {
              setShowMenuOptions(false);
              handleCancelWorkout();
            }}
            className="w-full px-3 py-2 text-left text-xs font-bold text-[#FF453A] hover:bg-white/5 rounded-[14px] flex items-center gap-2"
          >
            <span>✕</span>
            <span>Cancelar entrenamiento</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TOP EXERCISE BUBBLES CAROUSEL ("Las Bolas de Arriba") */}
      {/* ======================================================== */}
      <div className="relative z-10 px-3 py-2 border-b border-white/[0.07] bg-black overflow-visible">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-2 py-3 min-h-[88px]">
          {activeSession.exercises.map((ex, idx) => {
            const isCurrent = idx === activeSession.currentExerciseIndex;
            const completedSets = ex.sets.filter((s) => s.completed).length;
            const isAllDone = ex.sets.length > 0 && completedSets === ex.sets.length;
            const bubbleDbEx = getExerciseById(ex.exerciseId);
            const bubbleMedia = bubbleDbEx ? getExerciseMediaUrls(bubbleDbEx) : null;

            return (
              <button
                key={idx}
                onClick={() => setCurrentExerciseIndex(idx)}
                className={`shrink-0 relative transition-all duration-200 group flex flex-col items-center p-1 ${
                  isCurrent ? 'scale-105' : 'opacity-60 hover:opacity-90'
                }`}
              >
                {/* Circular Bubble Avatar */}
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-1.5 bg-[#000000] transition-all ${
                    isCurrent
                    ? 'ring-2 ring-[#A1F524] ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(161,245,36,0.25)]'
                      : 'border border-white/10 bg-[#1C1C1E]'
                  }`}
                >
                  {bubbleMedia?.imageUrl ? (
                    <img
                      src={bubbleMedia.imageUrl}
                      alt={ex.exerciseName}
                      className="w-full h-full object-contain pointer-events-none exercise-media-dark"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xl">🏋️</span>
                  )}
                </div>

                {/* Completed Badge Indicator */}
                {isAllDone && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#A1F524] text-black text-[9px] font-black flex items-center justify-center shadow-md">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          {onOpenExercisesCatalog && (
            <button
              type="button"
              onClick={onOpenExercisesCatalog}
              aria-label="Añadir ejercicio a la sesión"
              title="Añadir ejercicio"
              className="w-16 h-16 shrink-0 rounded-full border border-dashed border-[#A1F524]/55 bg-[#A1F524]/[0.07] text-[#A1F524] flex items-center justify-center text-3xl font-light transition-all hover:bg-[#A1F524]/15 active:scale-95"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN SCROLLABLE CONTENT BODY                         */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+7rem)] space-y-4 no-scrollbar overscroll-contain">
        {/* Large Central Animated Figure (Pure Black Seamless OLED Background) */}
        {currentExercise && (
          <div className="w-full h-[min(34svh,280px)] min-h-[210px] bg-[#101012] flex items-center justify-center relative overflow-hidden rounded-[28px] border border-white/[0.07]">
            {/* Subtle Biomechanical Glow behind the figure */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(161,245,36,0.10)_0%,rgba(0,0,0,0)_68%)] pointer-events-none" />
            {media?.gifUrl || media?.imageUrl ? (
              <div className="relative w-full max-w-[320px] h-full flex items-center justify-center p-3">
                <img
                  src={media.gifUrl || media.imageUrl}
                  alt={currentExercise.exerciseName}
                  className="w-full h-full object-contain pointer-events-none exercise-media-dark"
                  loading="eager"
                  onError={(e) => {
                    if (media.imageUrl && e.currentTarget.src !== media.imageUrl) {
                      e.currentTarget.src = media.imageUrl;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/10">
                <span className="text-4xl">🏋️</span>
              </div>
            )}
          </div>
        )}

        {/* Exercise Title & Action Row (Symmetry Format) */}
        {currentExercise && (
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] p-1.5 shrink-0">
                <img src={currentTierBadge} alt="Rango muscular" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">Ejercicio {activeSession.currentExerciseIndex + 1} de {activeSession.exercises.length}</p>
                <h1 className="text-lg sm:text-xl font-black text-[#F5F5F7] tracking-tight capitalize line-clamp-2">
                  {currentExercise.exerciseName}
                </h1>
              </div>
            </div>

            {/* Compact actions grid */}
            <div className="flex items-center justify-around gap-3 px-1">

              {/* ▶ Tutorial Button */}
              <button
                onClick={() => setShowTutorial(true)}
                aria-label="Tutorial"
                title="Tutorial"
                className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/[0.08] hover:border-white/20 text-lg text-[#A1F524] active:scale-95 transition-all flex items-center justify-center"
              >
                ▶
              </button>

              {/* 🔄 Reemplazar Button */}
              <button
                onClick={() => setShowReplaceModal(true)}
                aria-label="Reemplazar ejercicio"
                title="Reemplazar ejercicio"
                className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/[0.08] hover:border-white/20 text-base text-[#64D2FF] active:scale-95 transition-all flex items-center justify-center"
              >
                ↻
              </button>

              {/* ✎ Notas Button */}
              <button
                onClick={() => {
                  setNotesInput(currentExercise.notes || '');
                  setShowNotesModal(true);
                }}
                aria-label="Notas del ejercicio"
                title="Notas del ejercicio"
                className={`w-12 h-12 rounded-full border text-base font-bold active:scale-95 transition-all flex items-center justify-center ${
                  currentExercise.notes
                    ? 'bg-[#FFD60A]/15 border-[#FFD60A]/40 text-[#FFD60A]'
                    : 'bg-[#1C1C1E] border-white/10 text-[#F5F5F7] hover:border-white/25'
                }`}
              >
                ✎
              </button>

              {/* ⏱ Rest Timer Button */}
              <button
                onClick={() => triggerRestTimer(150)}
                aria-label="Iniciar descanso de 2 minutos y 30 segundos"
                title="Iniciar descanso"
                className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/[0.08] hover:border-[#A1F524]/40 flex items-center justify-center text-base text-[#A1F524] active:scale-95 transition-all"
              >
                ⏱
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. SETS TABLE (Exact Symmetry Layout)                    */}
        {/* ======================================================== */}
        {currentExercise && (
          <div className="space-y-3 rounded-[28px] border border-white/[0.07] bg-[#141416] p-3.5">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#8E8E93] px-1 items-center">
              <span className="col-span-2 text-center">SERIE</span>
              <span className="col-span-3 text-center">PREVIA</span>
              <span className="col-span-3 text-center">KG</span>
              <span className="col-span-2 text-center">REPES</span>
              <div className="col-span-2 flex justify-center">
                <span className="text-xs text-[#64D2FF]">✨</span>
              </div>
            </div>

            {/* Set Rows */}
            <div className="space-y-2.5">
              {currentExercise.sets.map((set, sIdx) => {
                const isDone = set.completed;
                const previaStr = getPreviousPerformance(sIdx);

                return (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-1.5 items-center px-1.5 py-2 rounded-[20px] border transition-all ${
                      isDone ? 'bg-[#A1F524]/[0.07] border-[#A1F524]/20' : 'bg-[#1C1C1E] border-white/[0.045]'
                    }`}
                  >
                    {/* SERIE: Pill Number */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono ${isDone ? 'bg-[#A1F524] text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>
                        {sIdx + 1}
                      </div>
                    </div>

                    {/* PREVIA: e.g. 65 x 12 */}
                    <div className="col-span-3 flex items-center justify-center text-xs font-bold text-[#8E8E93] font-mono">
                      {previaStr}
                    </div>

                    {/* KG: Dark rounded input block */}
                    <div className="col-span-3 flex items-center justify-center">
                      <div className="relative w-full">
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
                          className="w-full h-10 rounded-xl bg-[#2C2C2E] border border-white/[0.06] text-center text-sm font-black text-[#F5F5F7] font-mono outline-none focus:border-[#A1F524] transition-all"
                        />
                      </div>
                    </div>

                    {/* REPES: Dark rounded input block */}
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={set.reps || ''}
                        onChange={(e) =>
                          updateSet(activeSession.currentExerciseIndex, sIdx, {
                            reps: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        placeholder="8"
                        className="w-full h-10 rounded-xl bg-[#2C2C2E] border border-white/[0.06] text-center text-sm font-black text-[#F5F5F7] font-mono outline-none focus:border-[#A1F524] transition-all"
                      />
                    </div>

                    {/* CHECK BUTTON: Circular Checkmark */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSetComplete(sIdx)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#A1F524] text-black font-black shadow-[0_0_15px_rgba(161,245,36,0.6)] scale-105'
                            : 'bg-[#2C2C2E] text-[#8E8E93] border border-white/[0.07] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <span className="text-sm leading-none font-black">{isDone ? '✓' : ''}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* + Añadir serie Wide Button (Exact Symmetry Button) */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => addSet(activeSession.currentExerciseIndex)}
                className="w-full py-3.5 rounded-2xl bg-[#2C2C2E] hover:bg-[#38383A] border border-white/[0.06] text-xs font-black text-[#F5F5F7] active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="text-sm font-bold leading-none">+</span>
                <span>Añadir serie</span>
              </button>

              {currentExercise.sets.length > 1 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      removeSet(
                        activeSession.currentExerciseIndex,
                        currentExercise.sets.length - 1
                      )
                    }
                    className="text-[11px] font-bold text-[#8E8E93] hover:text-red-400 active:scale-95 transition-all"
                  >
                    Quitar última serie
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. FLOATING 2:30 REST TIMER POD                          */}
      {/* ======================================================== */}
      {activeSession.isRestTimerRunning && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto fitness-surface-elevated rounded-[28px] p-4 border border-[#A1F524]/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-3xl animate-slide-up overscroll-contain">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#A1F524]/20 border border-[#A1F524]/40 flex items-center justify-center text-sm font-black text-[#A1F524] font-mono shadow-[0_0_15px_rgba(161,245,36,0.35)]">
                {formatTime(timerRemaining)}
              </div>
              <div>
                <p className="text-xs font-black text-[#F5F5F7]">Descanso en curso</p>
                <p className="text-[11px] font-bold text-[#8E8E93]">Respira y prepara la carga</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustRestTimer(-10)}
                className="fitness-pill px-2.5 py-1.5 rounded-full text-xs font-black text-[#8E8E93] hover:text-white active:scale-90"
              >
                -10s
              </button>
              <button
                onClick={() => adjustRestTimer(10)}
                className="fitness-pill px-2.5 py-1.5 rounded-full text-xs font-black text-[#A1F524] hover:text-white active:scale-90"
              >
                +10s
              </button>
              <button
                onClick={stopRestTimer}
                className="w-8 h-8 rounded-full fitness-pill flex items-center justify-center text-xs font-bold text-[#8E8E93] hover:text-white active:scale-90"
                title="Saltar descanso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: TUTORIAL & TECHNIQUE STEPS                     */}
      {/* ======================================================== */}
      {showTutorial && dbExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowTutorial(false)}
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
              <div>
                <h3 className="text-sm font-black text-[#F5F5F7] capitalize">
                  {dbExercise.name}
                </h3>
                <p className="text-[11px] font-bold text-[#A1F524] capitalize">
                  {BODY_PART_TRANSLATIONS[dbExercise.body_part] || dbExercise.body_part} • {dbExercise.target}
                </p>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-8 h-8 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar overscroll-contain">
              <div className="w-full aspect-video rounded-[20px] bg-[#000000] overflow-hidden flex items-center justify-center border border-white/10 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
                {media?.gifUrl || media?.imageUrl ? (
                  <img
                    src={media.gifUrl || media.imageUrl}
                    alt={dbExercise.name}
                    className="w-full h-full object-contain p-2 relative z-10 exercise-media-dark"
                  />
                ) : (
                  <span className="text-3xl">🏋️</span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                  Técnica de Ejecución
                </h4>
                {dbExercise.steps_es && dbExercise.steps_es.length > 0 ? (
                  <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#E5E5EA] font-medium leading-relaxed">
                    {dbExercise.steps_es.map((step, idx) => (
                      <li key={idx} className="pl-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    {dbExercise.instructions_es || 'Mantén postura firme y rango completo de movimiento.'}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTutorial(false)}
              className="w-full py-3 rounded-full bg-[#A1F524] text-black font-black text-xs shadow-md active:scale-98 transition-all shrink-0"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: REEMPLAZAR EJERCICIO                           */}
      {/* ======================================================== */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowReplaceModal(false)}
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
              <div>
                <h3 className="text-sm font-black text-[#F5F5F7]">Reemplazar Ejercicio</h3>
                <p className="text-[10px] font-bold text-[#8E8E93]">
                  Sustituye por cualquier variante del catálogo
                </p>
              </div>
              <button
                onClick={() => setShowReplaceModal(false)}
                className="w-8 h-8 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="shrink-0">
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Buscar ejercicio sustituto..."
                className="w-full fitness-surface rounded-[16px] px-3.5 py-2.5 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#A1F524]"
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar overscroll-contain">
              {filteredReplacements.map((cand) => {
                const candMedia = getExerciseMediaUrls(cand);
                return (
                  <div
                    key={cand.id}
                    onClick={() => {
                      replaceExerciseInActiveSession(activeSession.currentExerciseIndex, {
                        id: cand.id,
                        name: cand.name,
                        category: cand.category || cand.body_part,
                        target: cand.target,
                      });
                      setShowReplaceModal(false);
                      showToast(`Ejercicio reemplazado por "${cand.name}".`);
                    }}
                    className="fitness-surface p-2.5 rounded-[18px] flex items-center justify-between gap-3 hover:border-[#A1F524]/50 cursor-pointer active:scale-98 transition-all"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-[#000000] overflow-hidden flex items-center justify-center shrink-0 border border-white/10 p-0.5">
                      {candMedia.imageUrl ? (
                        <img
                          src={candMedia.imageUrl}
                          alt={cand.name}
                          className="w-full h-full object-contain exercise-media-dark"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm">🏋️</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-[#F5F5F7] capitalize truncate">
                        {cand.name}
                      </p>
                      <p className="text-[10px] font-bold text-[#8E8E93]">
                        {BODY_PART_TRANSLATIONS[cand.body_part] || cand.body_part} • {cand.target}
                      </p>
                    </div>
                    <span className="text-xs text-[#A1F524] font-black shrink-0">Elegir →</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: NOTAS DE EJERCICIO                             */}
      {/* ======================================================== */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowNotesModal(false)}
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
              <div>
                <h3 className="text-sm font-black text-[#F5F5F7]">Notas de Ejercicio</h3>
                <p className="text-[10px] font-bold text-[#8E8E93]">
                  Ajustes de asiento, sensaciones o agarre
                </p>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-8 h-8 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ej: Asiento en posición 4, agarre prono abierto, sensación sólida en dorsales..."
              className="w-full h-32 fitness-surface rounded-[18px] p-3 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#FFD60A] resize-none"
            />

            <button
              type="button"
              onClick={() => {
                setExerciseNotes(activeSession.currentExerciseIndex, notesInput.trim());
                setShowNotesModal(false);
                showToast('Notas guardadas.');
              }}
              className="w-full py-3 rounded-full bg-[#FFD60A] text-black font-black text-xs shadow-md active:scale-98 transition-all shrink-0"
            >
              Guardar Nota
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. FINISHED WORKOUT CELEBRATION MODAL                     */}
      {/* ======================================================== */}
      {completedSummary && (
        <WorkoutSummaryCelebrationModal
          summary={completedSummary}
          onClose={() => {
            setCompletedSummary(null);
            onClose();
          }}
        />
      )}
    </div>
  ), document.body);
};
