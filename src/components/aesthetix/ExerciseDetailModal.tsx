'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types/workout';
import { getExerciseMediaUrls, BODY_PART_TRANSLATIONS, EQUIPMENT_TRANSLATIONS } from '@/lib/exercisesDb';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToActiveWorkout?: (exercise: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onAddToActiveWorkout,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'gif' | 'image'>('gif');
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!isOpen || !exercise) return null;

  const { imageUrl, gifUrl } = getExerciseMediaUrls(exercise);
  const bodyPartLabel = BODY_PART_TRANSLATIONS[exercise.body_part] || exercise.body_part;
  const equipmentLabel = EQUIPMENT_TRANSLATIONS[exercise.equipment.toLowerCase()] || exercise.equipment;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg glass-surface-elevated rounded-t-[36px] max-h-[92vh] flex flex-col overflow-hidden z-10 border-t border-white/20 shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/25 text-[10px] font-black uppercase tracking-wider">
              {bodyPartLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#8E8E93] text-[10px] font-bold border border-white/10">
              {equipmentLabel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Title */}
          <div>
            <h2 className="text-xl font-black text-[#F5F5F7] capitalize tracking-tight">
              {exercise.name}
            </h2>
            <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
              Enfoque: <span className="text-[#34C759] capitalize">{exercise.target}</span>
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                <span> • Secundarios: {exercise.secondary_muscles.join(', ')}</span>
              )}
            </p>
          </div>

          {/* Media Player Bento Card (GIF Animation & Thumbnail) */}
          <div className="glass-surface rounded-[26px] p-3 space-y-2 relative border-t-white/20 flex flex-col items-center">
            {/* Tab switch GIF / JPG */}
            <div className="flex items-center gap-1.5 self-end mb-1">
              <button
                onClick={() => setActiveMediaTab('gif')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                  activeMediaTab === 'gif'
                    ? 'bg-[#34C759] text-black shadow-md'
                    : 'glass-pill text-[#8E8E93] hover:text-white'
                }`}
              >
                Animación GIF
              </button>
              <button
                onClick={() => setActiveMediaTab('image')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                  activeMediaTab === 'image'
                    ? 'bg-[#34C759] text-black shadow-md'
                    : 'glass-pill text-[#8E8E93] hover:text-white'
                }`}
              >
                Foto fija
              </button>
            </div>

            {/* Media Container */}
            <div className="w-full max-w-[280px] aspect-square rounded-[22px] overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative shadow-inner">
              <img
                src={activeMediaTab === 'gif' ? gifUrl : imageUrl}
                alt={exercise.name}
                className="w-full h-full object-contain p-2"
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
              />
            </div>
            <p className="text-[10px] font-bold text-[#636366]">
              Visualización biomecánica oficial de ejecución
            </p>
          </div>

          {/* Instructions in Spanish */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
              Instrucciones de Ejecución Paso a Paso
            </h3>

            {exercise.steps_es && exercise.steps_es.length > 0 ? (
              <div className="space-y-2">
                {exercise.steps_es.map((step, idx) => (
                  <div
                    key={idx}
                    className="glass-pill p-3 rounded-[18px] flex items-start gap-2.5 text-xs text-[#F5F5F7] leading-relaxed"
                  >
                    <span className="w-5 h-5 shrink-0 rounded-full bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 flex items-center justify-center font-black text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{step}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="glass-pill p-3 rounded-[18px] text-xs text-[#8E8E93]">
                {exercise.instructions_es || 'Mantén la postura erguida y controla el peso en todo momento.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3">
          {onAddToActiveWorkout && (
            <button
              onClick={() => {
                onAddToActiveWorkout(exercise);
                onClose();
              }}
              className="flex-1 py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-[0_4px_20px_rgba(52,199,89,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>+</span>
              <span>Añadir a Sesión Activa</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-full glass-pill text-xs font-black text-[#F5F5F7] hover:text-white active:scale-95 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
