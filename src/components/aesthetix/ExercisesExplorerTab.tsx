'use client';

import React, { useState, useMemo } from 'react';
import { Exercise } from '@/types/workout';
import {
  searchExercises,
  getAvailableBodyParts,
  getAvailableEquipment,
  getExerciseMediaUrls,
  BODY_PART_TRANSLATIONS,
} from '@/lib/exercisesDb';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface ExercisesExplorerTabProps {
  onAddToActiveWorkout?: (exercise: Exercise) => void;
}

export const ExercisesExplorerTab: React.FC<ExercisesExplorerTabProps> = ({
  onAddToActiveWorkout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  const bodyParts = useMemo(() => getAvailableBodyParts(), []);
  const equipments = useMemo(() => getAvailableEquipment(), []);

  const filteredExercises = useMemo(() => {
    return searchExercises(searchQuery, {
      bodyPart: selectedBodyPart,
      equipment: selectedEquipment,
    });
  }, [searchQuery, selectedBodyPart, selectedEquipment]);

  const paginatedExercises = useMemo(() => {
    return filteredExercises.slice(0, page * PAGE_SIZE);
  }, [filteredExercises, page]);

  const handleOpenDetail = (ex: Exercise) => {
    setSelectedExercise(ex);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar entre 1.324 ejercicios por nombre, músculo..."
          className="w-full glass-surface rounded-[24px] pl-11 pr-4 py-3 text-xs text-[#F5F5F7] placeholder-[#636366] font-bold border border-white/10 outline-none focus:border-[#34C759] transition-all shadow-inner"
        />
        <span className="absolute left-4 top-3 text-sm text-[#8E8E93]">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 w-5 h-5 rounded-full bg-white/[0.1] text-[10px] text-[#8E8E93] hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Body Part Muscle Filter Pills (Horizontal Scroll) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-1">
          GRUPO MUSCULAR
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedBodyPart('all');
              setPage(1);
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              selectedBodyPart === 'all'
                ? 'bg-[#34C759] text-black shadow-md'
                : 'glass-pill text-[#8E8E93] hover:text-white'
            }`}
          >
            Todos ({filteredExercises.length})
          </button>

          {bodyParts.map((bp) => (
            <button
              key={bp.key}
              onClick={() => {
                setSelectedBodyPart(bp.key);
                setPage(1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                selectedBodyPart === bp.key
                  ? 'bg-[#34C759] text-black shadow-md'
                  : 'glass-pill text-[#8E8E93] hover:text-white'
              }`}
            >
              {bp.label} ({bp.count})
            </button>
          ))}
        </div>
      </div>

      {/* 3. Equipment Filter Pills (Horizontal Scroll) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-1">
          EQUIPAMIENTO
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedEquipment('all');
              setPage(1);
            }}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedEquipment === 'all'
                ? 'bg-white/[0.18] text-white border border-white/30'
                : 'glass-pill text-[#8E8E93]'
            }`}
          >
            Todos
          </button>
          {equipments.map((eq) => (
            <button
              key={eq.key}
              onClick={() => {
                setSelectedEquipment(eq.key);
                setPage(1);
              }}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                selectedEquipment === eq.key
                  ? 'bg-white/[0.18] text-white border border-white/30'
                  : 'glass-pill text-[#8E8E93]'
              }`}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Results Grid */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#8E8E93]">
            Mostrando {paginatedExercises.length} de {filteredExercises.length} ejercicios
          </span>
        </div>

        {paginatedExercises.length === 0 ? (
          <div className="glass-surface rounded-[26px] p-8 text-center space-y-2">
            <span className="text-2xl">🔍</span>
            <p className="text-xs font-bold text-[#8E8E93]">
              No se encontraron ejercicios con esos filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {paginatedExercises.map((exercise) => {
              const { imageUrl } = getExerciseMediaUrls(exercise);
              const bodyLabel = BODY_PART_TRANSLATIONS[exercise.body_part] || exercise.body_part;

              return (
                <div
                  key={exercise.id}
                  onClick={() => handleOpenDetail(exercise)}
                  className="glass-surface rounded-[24px] p-3 cursor-pointer hover:border-white/25 active:scale-[0.98] transition-all flex flex-col justify-between space-y-2 group shadow-sm hover:shadow-[0_8px_25px_rgba(52,199,89,0.12)]"
                >
                  {/* Thumbnail */}
                  <div className="w-full aspect-square rounded-[18px] bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform">
                    <img
                      src={imageUrl}
                      alt={exercise.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] text-[9px] font-black uppercase tracking-wider">
                      {bodyLabel}
                    </span>
                    <h4 className="text-xs font-black text-[#F5F5F7] capitalize leading-snug line-clamp-2">
                      {exercise.name}
                    </h4>
                    <p className="text-[10px] font-bold text-[#8E8E93] truncate">
                      {exercise.equipment} • {exercise.target}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {paginatedExercises.length < filteredExercises.length && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full py-3 rounded-full glass-pill text-xs font-black text-[#34C759] hover:text-white active:scale-95 transition-all shadow-sm"
          >
            Cargar más ejercicios (+30)
          </button>
        )}
      </div>

      {/* Exercise Detail Sheet */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToActiveWorkout={onAddToActiveWorkout}
      />
    </div>
  );
};
