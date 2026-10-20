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
import { AiRoutineBuilderModal } from './AiRoutineBuilderModal';
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
  const [isAiBuilderOpen, setIsAiBuilderOpen] = useState(false);
  const [isLiveWorkoutOpen, setIsLiveWorkoutOpen] = useState(false);
  const [isStartWorkoutModalOpen, setIsStartWorkoutModalOpen] = useState(false);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<WorkoutHistoryItem | null>(null);

  const isAnyModalOpen =
    isStartWorkoutModalOpen ||
    isLiveWorkoutOpen ||
    isAiBuilderOpen ||
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
      {/* Ambient Apple Fitness Radial Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#FA114F]/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[#A1F524]/10 blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-[120px]" />
      </div>

      {/* Top Apple Fitness Header */}
      <div className="relative z-10">
        <AesthetixHeader
          activeTab={activeTab}
          onOpenAiBuilder={() => setIsAiBuilderOpen(true)}
          onOpenLiveWorkout={() => {
            if (activeSession) {
              setIsLiveWorkoutOpen(true);
            } else {
              setIsStartWorkoutModalOpen(true);
            }
          }}
          onOpenProfile={() => setActiveTab('profile')}
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
            onOpenAiBuilder={() => setIsAiBuilderOpen(true)}
            onAddToActiveWorkout={handleAddExerciseToWorkout}
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
        }}
      />

      {/* AI Routine Generator Modal */}
      <AiRoutineBuilderModal
        isOpen={isAiBuilderOpen}
        onClose={() => setIsAiBuilderOpen(false)}
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
