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

  const [isMuscleDropdownOpen, setIsMuscleDropdownOpen] = useState(false);
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] = useState(false);

  const bodyParts = useMemo(() => getAvailableBodyParts(), []);
  const equipments = useMemo(() => getAvailableEquipment(), []);

  const selectedBodyPartObj = bodyParts.find((b) => b.key === selectedBodyPart);
  const selectedEquipmentObj = equipments.find((e) => e.key === selectedEquipment);

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

  const handleSelectBodyPart = (key: string) => {
    setSelectedBodyPart(key);
    setIsMuscleDropdownOpen(false);
    setPage(1);
  };

  const handleSelectEquipment = (key: string) => {
    setSelectedEquipment(key);
    setIsEquipmentDropdownOpen(false);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedBodyPart('all');
    setSelectedEquipment('all');
    setSearchQuery('');
    setPage(1);
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

      {/* 2. Fast Dropdown Filter Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Grupo Muscular */}
          <button
            type="button"
            onClick={() => {
              setIsMuscleDropdownOpen(!isMuscleDropdownOpen);
              setIsEquipmentDropdownOpen(false);
            }}
            className={`px-3.5 py-2.5 rounded-[20px] text-xs font-black transition-all flex items-center justify-between border ${
              selectedBodyPart !== 'all'
                ? 'bg-[#34C759]/20 border-[#34C759]/50 text-[#34C759] shadow-[0_0_15px_rgba(52,199,89,0.2)]'
                : isMuscleDropdownOpen
                ? 'bg-white/[0.12] border-white/30 text-white'
                : 'glass-surface border-white/10 text-[#F5F5F7] hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">💪</span>
              <span className="truncate">
                {selectedBodyPart === 'all'
                  ? 'Músculo: Todos'
                  : selectedBodyPartObj?.label || selectedBodyPart}
              </span>
            </div>
            <span className="text-[10px] opacity-70 shrink-0 ml-1">
              {isMuscleDropdownOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* Button 2: Equipamiento */}
          <button
            type="button"
            onClick={() => {
              setIsEquipmentDropdownOpen(!isEquipmentDropdownOpen);
              setIsMuscleDropdownOpen(false);
            }}
            className={`px-3.5 py-2.5 rounded-[20px] text-xs font-black transition-all flex items-center justify-between border ${
              selectedEquipment !== 'all'
                ? 'bg-[#64D2FF]/20 border-[#64D2FF]/50 text-[#64D2FF] shadow-[0_0_15px_rgba(100,210,255,0.2)]'
                : isEquipmentDropdownOpen
                ? 'bg-white/[0.12] border-white/30 text-white'
                : 'glass-surface border-white/10 text-[#F5F5F7] hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">🏋️</span>
              <span className="truncate">
                {selectedEquipment === 'all'
                  ? 'Equipo: Todos'
                  : selectedEquipmentObj?.label || selectedEquipment}
              </span>
            </div>
            <span className="text-[10px] opacity-70 shrink-0 ml-1">
              {isEquipmentDropdownOpen ? '▲' : '▼'}
            </span>
          </button>
        </div>

        {/* Muscle Dropdown Popover List */}
        {isMuscleDropdownOpen && (
          <div className="glass-surface-elevated rounded-[24px] p-3 border border-white/20 shadow-2xl space-y-1 max-h-60 overflow-y-auto no-scrollbar animate-slide-up">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#8E8E93] border-b border-white/5 mb-1">
              <span>Selecciona Grupo Muscular</span>
              <span>Total: {bodyParts.reduce((a, b) => a + b.count, 0)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleSelectBodyPart('all')}
              className={`w-full px-3 py-2 rounded-[16px] text-xs font-black flex items-center justify-between transition-all ${
                selectedBodyPart === 'all'
                  ? 'bg-[#34C759] text-black shadow-md'
                  : 'text-[#F5F5F7] hover:bg-white/[0.08]'
              }`}
            >
              <span>Todos los Músculos</span>
              <span className="text-[11px] opacity-80">1.324 ejercicios</span>
            </button>

            {bodyParts.map((bp) => {
              const isSelected = selectedBodyPart === bp.key;
              return (
                <button
                  key={bp.key}
                  type="button"
                  onClick={() => handleSelectBodyPart(bp.key)}
                  className={`w-full px-3 py-2 rounded-[16px] text-xs font-black flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#34C759] text-black shadow-md'
                      : 'text-[#F5F5F7] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="capitalize">{bp.label}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-black/80' : 'text-[#8E8E93]'}`}>
                    {bp.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Equipment Dropdown Popover List */}
        {isEquipmentDropdownOpen && (
          <div className="glass-surface-elevated rounded-[24px] p-3 border border-white/20 shadow-2xl space-y-1 max-h-60 overflow-y-auto no-scrollbar animate-slide-up">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#8E8E93] border-b border-white/5 mb-1">
              <span>Selecciona Equipamiento</span>
              <span>{equipments.length} Tipos</span>
            </div>

            <button
              type="button"
              onClick={() => handleSelectEquipment('all')}
              className={`w-full px-3 py-2 rounded-[16px] text-xs font-black flex items-center justify-between transition-all ${
                selectedEquipment === 'all'
                  ? 'bg-[#64D2FF] text-black shadow-md'
                  : 'text-[#F5F5F7] hover:bg-white/[0.08]'
              }`}
            >
              <span>Todo el Equipamiento</span>
              <span className="text-[11px] opacity-80">Todos</span>
            </button>

            {equipments.map((eq) => {
              const isSelected = selectedEquipment === eq.key;
              return (
                <button
                  key={eq.key}
                  type="button"
                  onClick={() => handleSelectEquipment(eq.key)}
                  className={`w-full px-3 py-2 rounded-[16px] text-xs font-black flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#64D2FF] text-black shadow-md'
                      : 'text-[#F5F5F7] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="capitalize">{eq.label}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filter Chips & Reset */}
        {(selectedBodyPart !== 'all' || selectedEquipment !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between px-1 text-[11px] text-[#8E8E93]">
            <span>
              Mostrando <strong className="text-white">{filteredExercises.length}</strong> ejercicios
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#FF453A] font-bold hover:underline"
            >
              Limpiar filtros ✕
            </button>
          </div>
        )}
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
                  <div className="w-full aspect-square rounded-[18px] bg-[#000000] border border-white/10 overflow-hidden flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
                    <img
                      src={imageUrl}
                      alt={exercise.name}
                      className="w-full h-full object-contain relative z-10 exercise-media-dark"
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
