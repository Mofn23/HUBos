'use client';

import React, { useState } from 'react';
import { RoutinesTab } from '../RoutinesTab';
import { ExercisesExplorerTab } from '../ExercisesExplorerTab';
import { Exercise } from '@/types/workout';

interface AppleWorkoutsTabViewProps {
  onStartSession: (routineId?: string, dayIndex?: number) => void;
  onOpenAiBuilder: () => void;
  onAddToActiveWorkout?: (exercise: Exercise) => void;
}

export type WorkoutsSubTab = 'routines' | 'catalog';

export const AppleWorkoutsTabView: React.FC<AppleWorkoutsTabViewProps> = ({
  onStartSession,
  onOpenAiBuilder,
  onAddToActiveWorkout,
}) => {
  const [subTab, setSubTab] = useState<WorkoutsSubTab>('routines');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Apple Segmented Control Bar */}
      <div className="p-1 rounded-full bg-white/[0.06] border border-white/10 flex items-center gap-1">
        <button
          onClick={() => setSubTab('routines')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 fitness-press ${
            subTab === 'routines'
              ? 'bg-[#1C1C1E] text-white shadow-md border border-white/10'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>📋</span>
          <span>Mis Rutinas</span>
        </button>

        <button
          onClick={() => setSubTab('catalog')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 fitness-press ${
            subTab === 'catalog'
              ? 'bg-[#1C1C1E] text-white shadow-md border border-white/10'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span>🔍</span>
          <span>1.324 Ejercicios</span>
        </button>
      </div>

      {/* Subtab Content */}
      {subTab === 'routines' ? (
        <RoutinesTab
          onStartSession={onStartSession}
          onOpenAiBuilder={onOpenAiBuilder}
        />
      ) : (
        <ExercisesExplorerTab
          onAddToActiveWorkout={onAddToActiveWorkout}
        />
      )}
    </div>
  );
};
