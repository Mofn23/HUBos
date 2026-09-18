'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AnatomicalMuscle,
  ANATOMY_CONFIG,
  TIERS_CATALOG,
  getTierFor1RM,
} from '@/lib/muscleRanks';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { getAllExercises, getExerciseMediaUrls } from '@/lib/exercisesDb';
import { Exercise, MuscleTierInfo } from '@/types/workout';
import { useScrollLock } from '@/lib/useScrollLock';

interface SymmetryMuscleDetailSheetProps {
  muscle: AnatomicalMuscle | null;
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
}

// Pre-defined realistic Symmetry tiers for key exercises to match Samuel's profile
const SAMUEL_EXERCISE_TIER_OVERRIDES: Record<string, keyof typeof TIERS_CATALOG> = {
  // Dorsales / Espalda
  '0027': 'rubi_2', // Dominada Agarre Prono -> Rubí II
  '0015': 'esmeralda_3', // Jalón Al Pecho Agarre Neutro -> Esmeralda III
  '0020': 'esmeralda_2', // Jalón Al Pecho Barra V -> Esmeralda II
  '0007': 'rubi_2', // Remo en Barra T -> Rubí II
  '0030': 'esmeralda_1', // Remo con Mancuerna -> Esmeralda I
  '0033': 'rubi_3', // Remo en Polea Baja -> Rubí III
  '0044': 'esmeralda_2', // Face Pulls Polea -> Esmeralda II

  // Pecho
  '0025': 'esmeralda_2', // Press Banca Plano -> Esmeralda II
  '0047': 'esmeralda_1', // Press Inclinado Mancuernas -> Esmeralda I
  '0053': 'rubi_3', // Aperturas en Peck Deck -> Rubí III
  '0018': 'diamante_1', // Fondos en Máquina -> Diamante I
  '0060': 'esmeralda_2', // Cruce de Poleas -> Esmeralda II

  // Hombros
  '0405': 'rubi_1', // Press Militar con Mancuernas -> Rubí I
  '0334': 'rubi_2', // Elevaciones Laterales Mancuernas -> Rubí II
  '0336': 'rubi_3', // Elevaciones Laterales en Polea -> Rubí III
  '0320': 'rubi_1', // Pájaros Posteriores -> Rubí I

  // Tríceps
  '0019': 'diamante_2', // Extensión Tríceps Barra V -> Diamante II
  '0055': 'diamante_1', // Fondos en Paralelas / Máquina -> Diamante I
  '0056': 'diamante_2', // Press Francés Mancuernas -> Diamante II
  '0057': 'esmeralda_3', // Extensión Tríceps Cuerda -> Esmeralda III

  // Bíceps & Antebrazos
  '0012': 'rubi_3', // Curl Predicador con Mancuerna -> Rubí III
  '0016': 'rubi_2', // Curl Martillo en Polea -> Rubí II
  '0011': 'rubi_3', // Curl con Barra Z -> Rubí III
  '0013': 'esmeralda_1', // Curl Inclinado con Mancuernas -> Esmeralda I

  // Piernas (Cuádriceps, Femoral, Aductores)
  '0040': 'rubi_2', // Sentadilla Hack -> Rubí II
  '0041': 'rubi_3', // Prensa Inclinada -> Rubí III
  '0042': 'diamante_1', // Aducción en Máquina -> Diamante I
  '0043': 'rubi_2', // Curl Femoral Acostado -> Rubí II
  '0045': 'rubi_1', // Sentadilla Búlgara -> Rubí I

  // Pantorrillas
  '0070': 'oro_2', // Elevación de Talones de Pie -> Oro II
  '0071': 'oro_3', // Elevación de Talones Sentado -> Oro III

  // Abdomen
  '0080': 'oro_2', // Elevación de Piernas Colgado -> Oro II
  '0081': 'oro_3', // Crunch en Polea Alta -> Oro III
};

export const SymmetryMuscleDetailSheet: React.FC<SymmetryMuscleDetailSheetProps> = ({
  muscle,
  onClose,
  onSelectExercise,
}) => {
  const { getMuscleTiers, prs, userWeightKg, openModal, closeModal } = useAesthetixStore();
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);

  const isOpen = !!muscle;
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => {
        closeModal();
      };
    }
  }, [isOpen, openModal, closeModal]);

  const muscleTiers = getMuscleTiers();
  const tierInfo: MuscleTierInfo = muscle
    ? muscleTiers[muscle] || TIERS_CATALOG.rubi_2
    : TIERS_CATALOG.rubi_2;
  const config = muscle ? ANATOMY_CONFIG[muscle] : null;

  // Find relevant exercises targeting this anatomical muscle
  const muscleExercises = useMemo(() => {
    if (!muscle) return [];
    const all = getAllExercises();

    return all.filter((ex) => {
      const t = (ex.target || '').toLowerCase();
      const bp = (ex.body_part || '').toLowerCase();

      switch (muscle) {
        case 'pecho':
          return bp === 'chest' || t.includes('pec') || t.includes('chest');
        case 'espalda':
          return (
            bp === 'back' ||
            t.includes('lat') ||
            t.includes('upper back') ||
            t.includes('trapezius') ||
            t.includes('spine')
          );
        case 'hombros':
          return bp === 'shoulders' || t.includes('delt');
        case 'biceps':
          return (
            (bp === 'upper arms' && t.includes('bicep')) ||
            bp === 'lower arms' ||
            t.includes('forearm')
          );
        case 'triceps':
          return bp === 'upper arms' && t.includes('tricep');
        case 'piernas':
          return (
            bp === 'upper legs' ||
            t.includes('quad') ||
            t.includes('hamstring') ||
            t.includes('adductor')
          );
        case 'gluteos':
          return t.includes('glute');
        case 'pantorrillas':
          return bp === 'lower legs' || t.includes('calves');
        case 'abdomen':
          return bp === 'waist' || t.includes('abs') || t.includes('oblique');
        default:
          return false;
      }
    });
  }, [muscle]);

  // Compute tier for each exercise
  const exerciseCards = useMemo(() => {
    return muscleExercises.slice(0, 16).map((ex) => {
      const pr = prs[ex.id];
      let assignedTier: MuscleTierInfo;

      if (pr && pr.estimated1RM > 0 && muscle) {
        assignedTier = getTierFor1RM(muscle, pr.estimated1RM, userWeightKg);
      } else if (SAMUEL_EXERCISE_TIER_OVERRIDES[ex.id]) {
        assignedTier = TIERS_CATALOG[SAMUEL_EXERCISE_TIER_OVERRIDES[ex.id]];
      } else {
        // Default to muscle's general tier
        assignedTier = tierInfo;
      }

      const media = getExerciseMediaUrls(ex);

      return {
        exercise: ex,
        tier: assignedTier,
        media,
      };
    });
  }, [muscleExercises, prs, muscle, userWeightKg, tierInfo]);

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center animate-fade-in">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Bottom Sheet Container matching Image 5 */}
      <div
        className="relative w-full max-w-lg bg-[#0F0F11] border-t border-white/20 rounded-t-[36px] p-6 pb-[max(env(safe-area-inset-bottom),32px)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-10 space-y-4 animate-slide-up flex flex-col max-h-[85vh] overscroll-contain"
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Subtle pill drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 shrink-0" />

        {/* Muscle Header Row: Muscle Name & Tier + Symmetry Badge */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight capitalize truncate">
              {config.name}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-sm sm:text-base font-black tracking-wide uppercase"
                style={{ color: tierInfo.color }}
              >
                {tierInfo.label}
              </span>
              <span className="text-xs font-bold text-[#8E8E93]">
                {tierInfo.percentile ? `• ${tierInfo.percentile}` : ''}
              </span>
            </div>
          </div>

          {/* Official Symmetry Rank Badge Image (Image 5 style) */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] bg-white/[0.04] p-1.5 flex items-center justify-center shrink-0 border border-white/10 shadow-lg relative group"
            style={{
              boxShadow: `0 0 25px ${tierInfo.color}35`,
            }}
          >
            <img
              src={tierInfo.badgeImage || '/ranks/rubi_2.png'}
              alt={tierInfo.label}
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Section Title: "Rangos de tus ejercicios" */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white tracking-tight">
              Rangos de tus ejercicios
            </h3>
            <span className="text-[11px] font-bold text-[#8E8E93]">
              {exerciseCards.length} ejercicios
            </span>
          </div>

          {/* Horizontal Exercises Carousel matching Image 5 */}
          <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-6 px-6">
            {exerciseCards.map(({ exercise, tier, media }) => (
              <div
                key={exercise.id}
                onClick={() => setSelectedExerciseForModal(exercise)}
                className="w-40 sm:w-44 flex-shrink-0 bg-[#19191C] rounded-[24px] p-2.5 border border-white/10 shadow-xl flex flex-col justify-between group hover:border-white/25 active:scale-98 transition-all cursor-pointer"
              >
                {/* Image / GIF display on OLED black container */}
                <div className="w-full h-36 rounded-[18px] bg-black overflow-hidden flex items-center justify-center p-2 relative border border-white/5 group-hover:border-white/15 transition-colors">
                  {media.imageUrl ? (
                    <img
                      src={media.imageUrl}
                      alt={exercise.name}
                      className="w-full h-full object-contain mix-blend-lighten filter brightness-110 contrast-125"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl">🏋️</span>
                  )}
                  {/* Subtle hover play hint */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-black">
                      ▶
                    </span>
                  </div>
                </div>

                {/* Exercise Name & Assigned Tier */}
                <div className="pt-2.5 pb-1 px-1">
                  <h4 className="text-xs font-black text-white truncate capitalize leading-tight">
                    {exercise.name}
                  </h4>
                  <p
                    className="text-[11px] font-black tracking-wide mt-1 uppercase"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-black text-xs active:scale-98 transition-all border border-white/15 mt-2 shadow-md"
        >
          Cerrar
        </button>
      </div>

      {/* Quick Exercise Preview Modal if user clicks on an exercise */}
      {selectedExerciseForModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedExerciseForModal(null)}
          />
          <div className="relative w-full max-w-sm bg-[#18181B] rounded-[32px] p-5 border border-white/20 shadow-2xl z-10 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-black text-white capitalize truncate pr-2">
                {selectedExerciseForModal.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedExerciseForModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-56 rounded-[22px] bg-black overflow-hidden flex items-center justify-center p-2 border border-white/10">
              <img
                src={
                  getExerciseMediaUrls(selectedExerciseForModal).gifUrl ||
                  getExerciseMediaUrls(selectedExerciseForModal).imageUrl
                }
                alt={selectedExerciseForModal.name}
                className="w-full h-full object-contain filter brightness-110 contrast-125"
              />
            </div>

            <div className="space-y-1 text-xs text-[#8E8E93]">
              <p>
                <strong className="text-white">Equipo:</strong> {selectedExerciseForModal.equipment}
              </p>
              <p>
                <strong className="text-white">Objetivo:</strong> {selectedExerciseForModal.target}
              </p>
              {selectedExerciseForModal.steps_es && selectedExerciseForModal.steps_es.length > 0 && (
                <p className="text-[11px] text-[#A1A1AA] pt-1">
                  {selectedExerciseForModal.steps_es[0]}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectExercise) {
                  onSelectExercise(selectedExerciseForModal);
                }
                setSelectedExerciseForModal(null);
                onClose();
              }}
              className="w-full py-3 rounded-full bg-[#34C759] text-black font-black text-xs active:scale-98 transition-all shadow-md"
            >
              Seleccionar este Ejercicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
