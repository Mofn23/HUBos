'use client';

import React, { useState } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { AesthetixHeader } from './AesthetixHeader';
import { AppleFitnessSummaryView } from './appleFitness/AppleFitnessSummaryView';
import { AppleWorkoutsTabView } from './appleFitness/AppleWorkoutsTabView';
import { AppleAwardsTabView } from './appleFitness/AppleAwardsTabView';
import { AppleProfileTabView } from './appleFitness/AppleProfileTabView';
import { AppleFitnessNavDock, AppleFitnessTab } from './appleFitness/AppleFitnessNavDock';
import { LiveWorkoutFullscreen } from './LiveWorkoutFullscreen';
import { StartWorkoutModal } from './StartWorkoutModal';
import { SessionDetailModal } from './SessionDetailModal';
import { Exercise, WorkoutHistoryItem } from '@/types/workout';
import { useScrollLock } from '@/lib/useScrollLock';

export const AesthetixView: React.FC = () => {
  const {
    activeSession,
    startWorkout,
    addExerciseToActiveSession,
    activeModalCount,
    deleteHistorySession,
  } = useAesthetixStore();

  const [activeTab, setActiveTab] = useState<AppleFitnessTab>('summary');
  const [catalogRequest, setCatalogRequest] = useState(0);
  const [isLiveWorkoutOpen, setIsLiveWorkoutOpen] = useState(false);
  const [isStartWorkoutModalOpen, setIsStartWorkoutModalOpen] = useState(false);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<WorkoutHistoryItem | null>(null);

  const isAnyModalOpen =
    isStartWorkoutModalOpen ||
    isLiveWorkoutOpen ||
    !!selectedSessionForDetail ||
    activeModalCount > 0;

  useScrollLock(isAnyModalOpen);

  const handleStartSession = (routineId?: string, dayIndex?: number) => {
    startWorkout(routineId, dayIndex);
    setIsLiveWorkoutOpen(true);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    addExerciseToActiveSession({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category || exercise.body_part,
      target: exercise.target,
    });
    setIsLiveWorkoutOpen(true);
  };

  return (
    <div
      className={`flex-1 flex flex-col px-4 pt-10 pb-36 ${
        isAnyModalOpen ? 'overflow-hidden' : 'overflow-y-auto'
      } no-scrollbar bg-black text-white space-y-4 relative min-h-screen`}
    >
      {/* Top Apple Fitness Header */}
      <div className="relative z-10">
        <AesthetixHeader
          activeTab={activeTab}
          onOpenLiveWorkout={() => {
            if (activeSession) {
              setIsLiveWorkoutOpen(true);
            } else {
              setIsStartWorkoutModalOpen(true);
            }
          }}
        />
      </div>

      {/* Active Tab Content */}
      <div className="relative z-10">
        {activeTab === 'summary' && (
          <AppleFitnessSummaryView
            onStartSession={handleStartSession}
            onOpenLiveWorkout={() => {
              if (activeSession) {
                setIsLiveWorkoutOpen(true);
              } else {
                setIsStartWorkoutModalOpen(true);
              }
            }}
            onSelectSessionDetail={(session) => setSelectedSessionForDetail(session)}
            onNavigateToWorkouts={() => setActiveTab('workouts')}
          />
        )}

        {activeTab === 'workouts' && (
          <AppleWorkoutsTabView
            onStartSession={handleStartSession}
            onAddToActiveWorkout={handleAddExerciseToWorkout}
            catalogRequest={catalogRequest}
          />
        )}

        {activeTab === 'awards' && <AppleAwardsTabView />}

        {activeTab === 'profile' && <AppleProfileTabView />}
      </div>

      {/* Floating Apple Fitness Glass Dock */}
      <AppleFitnessNavDock
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeSession={activeSession}
        onOpenLiveWorkout={() => {
          if (activeSession) {
            setIsLiveWorkoutOpen(true);
          } else {
            setIsStartWorkoutModalOpen(true);
          }
        }}
        isHidden={isAnyModalOpen}
      />

      {/* Pre-Workout Start Selector Modal */}
      <StartWorkoutModal
        isOpen={isStartWorkoutModalOpen}
        onClose={() => setIsStartWorkoutModalOpen(false)}
        onStart={handleStartSession}
      />

      {/* Fullscreen Live Workout Session Modal */}
      <LiveWorkoutFullscreen
        isOpen={isLiveWorkoutOpen}
        onClose={() => setIsLiveWorkoutOpen(false)}
        onOpenExercisesCatalog={() => {
          setIsLiveWorkoutOpen(false);
          setActiveTab('workouts');
          setCatalogRequest((request) => request + 1);
        }}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={!!selectedSessionForDetail}
        session={selectedSessionForDetail}
        onClose={() => setSelectedSessionForDetail(null)}
        onDelete={(id) => {
          deleteHistorySession(id);
          setSelectedSessionForDetail(null);
        }}
      />
    </div>
  );
};
