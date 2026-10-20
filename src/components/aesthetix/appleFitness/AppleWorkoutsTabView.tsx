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
      <div className="p-1 rounded-full bg-[#1C1C1E] border border-white/5 flex items-center gap-1">
        <button
          onClick={() => setSubTab('routines')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 fitness-press ${
            subTab === 'routines'
              ? 'bg-white text-black font-black shadow-md'
              : 'text-[#8E8E93] font-bold hover:text-white'
          }`}
        >
          <span>📋</span>
          <span>Mis Rutinas</span>
        </button>

        <button
          onClick={() => setSubTab('catalog')}
          className={`flex-1 py-1.5 px-3 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 fitness-press ${
            subTab === 'catalog'
              ? 'bg-white text-black font-black shadow-md'
              : 'text-[#8E8E93] font-bold hover:text-white'
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
