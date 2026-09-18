'use client';

import React, { useState } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { AesthetixHeader } from './AesthetixHeader';
import { RoutinesTab } from './RoutinesTab';
import { ExercisesExplorerTab } from './ExercisesExplorerTab';
import { AnatomyRanksTab } from './AnatomyRanksTab';
import { ProfileHistoryTab } from './ProfileHistoryTab';
import { LiveWorkoutFullscreen } from './LiveWorkoutFullscreen';
import { AiRoutineBuilderModal } from './AiRoutineBuilderModal';
import { StartWorkoutModal } from './StartWorkoutModal';
import { Exercise } from '@/types/workout';
import { useScrollLock } from '@/lib/useScrollLock';

export type AesthetixTab = 'routines' | 'exercises' | 'ranks' | 'profile';

export const AesthetixView: React.FC = () => {
  const {
    activeSession,
    startWorkout,
    addExerciseToActiveSession,
  } = useAesthetixStore();

  const [activeTab, setActiveTab] = useState<AesthetixTab>('routines');
  const [isAiBuilderOpen, setIsAiBuilderOpen] = useState(false);
  const [isLiveWorkoutOpen, setIsLiveWorkoutOpen] = useState(false);
  const [isStartWorkoutModalOpen, setIsStartWorkoutModalOpen] = useState(false);

  const isAnyModalOpen = isStartWorkoutModalOpen || isLiveWorkoutOpen || isAiBuilderOpen;
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
      className={`flex-1 flex flex-col px-4 pt-12 pb-36 ${
        isAnyModalOpen ? 'overflow-hidden' : 'overflow-y-auto'
      } no-scrollbar animate-fade-in space-y-4 relative`}
    >
      {/* Ambient Radial Glowing Orbs for Frosted Glass Depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#64D2FF]/10 blur-[110px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[#34C759]/10 blur-[110px]" />
        <div className="absolute -bottom-16 right-1/4 w-80 h-80 rounded-full bg-[#BF5AF2]/10 blur-[110px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10">
        <AesthetixHeader
          onOpenAiBuilder={() => setIsAiBuilderOpen(true)}
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
        {activeTab === 'routines' && (
          <RoutinesTab
            onStartSession={handleStartSession}
            onOpenAiBuilder={() => setIsAiBuilderOpen(true)}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesExplorerTab onAddToActiveWorkout={handleAddExerciseToWorkout} />
        )}

        {activeTab === 'ranks' && <AnatomyRanksTab />}

        {activeTab === 'profile' && <ProfileHistoryTab />}
      </div>

      {/* Floating Bottom Glass Navigation Dock */}
      <nav className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto glass-surface-elevated rounded-full p-1.5 flex items-center justify-around border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
        <button
          onClick={() => setActiveTab('routines')}
          className={`flex-1 py-2 px-1 rounded-full text-xs font-black transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'routines'
              ? 'glass-pill-active text-[#34C759] border-[#34C759]/40 shadow-[0_0_15px_rgba(52,199,89,0.25)]'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px]">Rutinas</span>
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 py-2 px-1 rounded-full text-xs font-black transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'exercises'
              ? 'glass-pill-active text-[#64D2FF] border-[#64D2FF]/40 shadow-[0_0_15px_rgba(100,210,255,0.25)]'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span className="text-base">🔍</span>
          <span className="text-[10px]">1.324 Ejercicios</span>
        </button>

        {/* Center Live Workout Quick Trigger */}
        <button
          onClick={() => {
            if (activeSession) {
              setIsLiveWorkoutOpen(true);
            } else {
              setIsStartWorkoutModalOpen(true);
            }
          }}
          className={`flex-1 py-2 px-1 rounded-full text-xs font-black transition-all flex flex-col items-center gap-0.5 ${
            activeSession
              ? 'bg-[#FF375F] text-white shadow-[0_0_20px_rgba(255,55,95,0.5)] animate-pulse'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span className="text-base">{activeSession ? '🔴' : '⚡'}</span>
          <span className="text-[10px]">{activeSession ? 'Gym En Vivo' : 'Entrenar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ranks')}
          className={`flex-1 py-2 px-1 rounded-full text-xs font-black transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'ranks'
              ? 'glass-pill-active text-[#FFD60A] border-[#FFD60A]/40 shadow-[0_0_15px_rgba(255,214,10,0.25)]'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span className="text-base">🧬</span>
          <span className="text-[10px]">Rangos</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-1 rounded-full text-xs font-black transition-all flex flex-col items-center gap-0.5 ${
            activeTab === 'profile'
              ? 'glass-pill-active text-[#BF5AF2] border-[#BF5AF2]/40 shadow-[0_0_15px_rgba(191,90,242,0.25)]'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          <span className="text-base">👤</span>
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>

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
          setActiveTab('exercises');
        }}
      />

      {/* AI Routine Generator Modal */}
      <AiRoutineBuilderModal
        isOpen={isAiBuilderOpen}
        onClose={() => setIsAiBuilderOpen(false)}
      />
    </div>
  );
};
