'use client';

import React, { useState } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useScrollLock } from '@/lib/useScrollLock';

interface StartWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (routineId?: string, dayIndex?: number) => void;
}

export const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({
  isOpen,
  onClose,
  onStart,
}) => {
  const { routines, activeRoutineId } = useAesthetixStore();

  // Prevent background scroll bleed in iOS
  useScrollLock(isOpen);

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    activeRoutineId || (routines[0]?.id ?? 'free')
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId);
  const isFreeWorkout = selectedRoutineId === 'free' || !currentRoutine;
  const currentDay = currentRoutine?.days?.[selectedDayIdx];

  const handleStartConfirm = () => {
    if (isFreeWorkout) {
      onStart(undefined, undefined);
    } else {
      onStart(currentRoutine.id, selectedDayIdx);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Apple Fitness Modal Card */}
      <div
        className="relative w-full max-w-md bg-[#1C1C1E] rounded-t-[36px] sm:rounded-[36px] p-6 z-10 border-t sm:border border-white/15 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar overscroll-contain"
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#A1F524]/20 border border-[#A1F524]/40 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-[#F5F5F7] tracking-tight">
                Iniciar Entrenamiento
              </h2>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Selecciona qué vas a entrenar hoy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center text-xs text-[#8E8E93] hover:text-white fitness-press transition-all"
          >
            ✕
          </button>
        </div>

        {/* Routine Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] block px-1">
            SELECCIONA TU RUTINA O MODO
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {routines.map((routine) => {
              const isSelected = selectedRoutineId === routine.id;
              return (
                <div
                  key={routine.id}
                  onClick={() => {
                    setSelectedRoutineId(routine.id);
                    setSelectedDayIdx(0);
                  }}
                  className={`p-3 rounded-[20px] cursor-pointer transition-all border flex items-center justify-between fitness-press ${
                    isSelected
                      ? 'bg-[#242426] border-[#A1F524]/50 shadow-sm'
                      : 'bg-[#242426]/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <p className="text-xs font-black text-[#F5F5F7]">{routine.name}</p>
                      <p className="text-[10px] font-bold text-[#8E8E93]">
                        {routine.targetDaysPerWeek} días/sem • {routine.days.length} días configurados
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-[#A1F524] text-black text-xs font-black flex items-center justify-center">
                      ✓
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-white/20" />
                  )}
                </div>
              );
            })}

            {/* Free Workout Option */}
            <div
              onClick={() => setSelectedRoutineId('free')}
              className={`p-3 rounded-[20px] cursor-pointer transition-all border flex items-center justify-between fitness-press ${
                isFreeWorkout
                  ? 'bg-[#242426] border-[#00F0FF]/50 shadow-sm'
                  : 'bg-[#242426]/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🆓</span>
                <div>
                  <p className="text-xs font-black text-[#F5F5F7]">Entrenamiento Libre</p>
                  <p className="text-[10px] font-bold text-[#8E8E93]">
                    Sesión abierta: añade los ejercicios que desees en vivo
                  </p>
                </div>
              </div>

              {isFreeWorkout ? (
                <span className="w-5 h-5 rounded-full bg-[#00F0FF] text-black text-xs font-black flex items-center justify-center">
                  ✓
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-white/20" />
              )}
            </div>
          </div>
        </div>

        {/* Day Selection (if routine selected) */}
        {!isFreeWorkout && currentRoutine && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] block px-1">
              DÍA A ENTRENAR HOY
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currentRoutine.days.map((day, idx) => {
                const isSelected = selectedDayIdx === idx;
                return (
                  <button
                    key={day.id || idx}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`p-2.5 rounded-[18px] text-left transition-all border fitness-press ${
                      isSelected
                        ? 'bg-white text-black border-white font-black shadow-md'
                        : 'bg-[#2C2C2E] border-white/5 text-[#8E8E93] hover:text-white font-bold'
                    }`}
                  >
                    <p className="text-xs truncate">{day.dayName}</p>
                    <p
                      className={`text-[9px] truncate ${
                        isSelected ? 'text-black/80 font-bold' : 'text-[#8E8E93]'
                      }`}
                    >
                      {day.exercises.length} ejercicios
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Preview of exercises for the selected day */}
            {currentDay && (
              <div className="p-3 rounded-[20px] bg-[#242426] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black text-[#F5F5F7]">
                  <span>{currentDay.dayName}</span>
                  <span className="text-[#A1F524] text-[10px] font-black">{currentDay.focus}</span>
                </div>
                <div className="space-y-1">
                  {currentDay.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="text-[11px] text-[#8E8E93] flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px] capitalize">
                        {i + 1}. {ex.name}
                      </span>
                      <span className="font-mono text-[10px] text-white/80">
                        {ex.targetSets}x{ex.targetReps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: Iniciar / Cancelar */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            onClick={handleStartConfirm}
            className="w-full py-4 rounded-full bg-[#A1F524] text-black font-black text-sm shadow-md shadow-[#A1F524]/20 fitness-press transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">⚡</span>
            <span>Comenzar Entrenamiento Ahora</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-black text-[#8E8E93] hover:text-white fitness-press transition-all"
          >
            ✕ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
