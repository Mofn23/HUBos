'use client';

import React, { useEffect, useState } from 'react';
import { RoutinesTab } from '../RoutinesTab';
import { ExercisesExplorerTab } from '../ExercisesExplorerTab';
import { Exercise } from '@/types/workout';

interface AppleWorkoutsTabViewProps {
  onStartSession: (routineId?: string, dayIndex?: number) => void;
  onAddToActiveWorkout?: (exercise: Exercise) => void;
  catalogRequest?: number;
}

export type WorkoutsSubTab = 'routines' | 'catalog';

export const AppleWorkoutsTabView: React.FC<AppleWorkoutsTabViewProps> = ({
  onStartSession,
  onAddToActiveWorkout,
  catalogRequest = 0,
}) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  useEffect(() => {
    if (catalogRequest > 0) setIsCatalogOpen(true);
  }, [catalogRequest]);

  return (
    <div className="aesthetix-tab-redesign aesthetix-workouts space-y-4 animate-fade-in">
      {isCatalogOpen ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsCatalogOpen(false)}
            className="fitness-pill rounded-full px-4 py-2 text-xs font-bold text-[#A1F524]"
          >
            ‹ Volver a rutinas
          </button>
          <ExercisesExplorerTab onAddToActiveWorkout={onAddToActiveWorkout} />
        </div>
      ) : (
        <RoutinesTab onStartSession={onStartSession} />
      )}
    </div>
  );
};
