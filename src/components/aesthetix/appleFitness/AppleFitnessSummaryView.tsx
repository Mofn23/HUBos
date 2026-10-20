'use client';

import React from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { AppleWeeklyDaysStrip } from './AppleWeeklyDaysStrip';
import { AppleActivityRingsCard } from './AppleActivityRingsCard';
import { AppleFitnessBentoCards } from './AppleFitnessBentoCards';
import { AppleWeeklyBarChart } from './AppleWeeklyBarChart';
import { AppleWorkoutsSection } from './AppleWorkoutsSection';
import { WorkoutHistoryItem } from '@/types/workout';

interface AppleFitnessSummaryViewProps {
  onStartSession: (routineId?: string, dayIndex?: number) => void;
  onOpenLiveWorkout: () => void;
  onSelectSessionDetail: (session: WorkoutHistoryItem) => void;
  onNavigateToWorkouts: () => void;
}

export const AppleFitnessSummaryView: React.FC<AppleFitnessSummaryViewProps> = ({
  onStartSession,
  onOpenLiveWorkout,
  onSelectSessionDetail,
  onNavigateToWorkouts,
}) => {
  const {
    history,
    routines,
    activeRoutineId,
    activeSession,
    currentStreak,
  } = useAesthetixStore();

  const activeRoutine =
    routines.find((r) => r.id === activeRoutineId) || routines[0];

  const totalVolumeKg = history.reduce((total, workout) => total + (Number(workout.totalVolumeKg) || 0), 0);

  return (
    <div className="space-y-4">
      {/* 1. Weekly Days Ring Strip */}
      <div className="stagger-1">
        <AppleWeeklyDaysStrip history={history} />
      </div>

      {/* 2. Concentric Activity Rings Card */}
      <div className="stagger-2">
        <AppleActivityRingsCard
          history={history}
          onOpenLiveWorkout={onOpenLiveWorkout}
        />
      </div>

      {/* 3. Resumen de actividad registrada */}
      <div className="stagger-3">
        <AppleFitnessBentoCards
          sessions={history.length}
          totalVolumeKg={totalVolumeKg}
          streak={currentStreak}
        />
      </div>

      {/* 4. This Week Bar Chart Card */}
      <div className="stagger-4">
        <AppleWeeklyBarChart history={history} />
      </div>

      {/* 5. Workouts List Section */}
      <div className="stagger-5">
        <AppleWorkoutsSection
          history={history}
          activeRoutine={activeRoutine}
          activeSession={activeSession}
          onStartSession={onStartSession}
          onOpenLiveWorkout={onOpenLiveWorkout}
          onSelectSessionDetail={onSelectSessionDetail}
          onShowAllWorkouts={onNavigateToWorkouts}
        />
      </div>
    </div>
  );
};
