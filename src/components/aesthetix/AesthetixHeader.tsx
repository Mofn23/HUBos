'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { AppleFitnessTab } from './appleFitness/AppleFitnessNavDock';

interface AesthetixHeaderProps {
  activeTab: AppleFitnessTab;
  onOpenAiBuilder: () => void;
  onOpenLiveWorkout: () => void;
  onOpenProfile?: () => void;
}

export const AesthetixHeader: React.FC<AesthetixHeaderProps> = ({
  activeTab,
  onOpenAiBuilder,
  onOpenLiveWorkout,
  onOpenProfile,
}) => {
  const { setCurrentApp } = useHubStore();
  const { currentStreak, activeSession, workoutDaysTarget } = useAesthetixStore();

  // Formatted Apple Fitness date e.g. "FRIDAY, SEPTEMBER 25" or Spanish "LUNES, 19 DE OCTUBRE"
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  const tabTitles: Record<AppleFitnessTab, string> = {
    summary: 'Summary',
    workouts: 'Workouts',
    awards: 'Awards',
    profile: 'Profile',
  };

  return (
    <header className="relative z-20 w-full mb-3 space-y-2">
      {/* Top Utilities Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Return to HUB button */}
        <button
          onClick={() => setCurrentApp('hub')}
          className="fitness-card h-8 px-3 rounded-full flex items-center gap-1 text-xs font-black text-[#F5F5F7] hover:text-white hover:border-white/30 fitness-press shadow-sm"
        >
          <span className="text-sm font-bold leading-none">‹</span>
          <span>HUB</span>
        </button>

        {/* Center: Live Session Pulse or Streak Pill */}
        {activeSession ? (
          <button
            onClick={onOpenLiveWorkout}
            className="h-8 px-3.5 rounded-full bg-[#FA114F]/20 border border-[#FA114F]/40 backdrop-blur-xl text-[#FA114F] text-xs font-black flex items-center gap-2 animate-pulse shadow-[0_0_16px_rgba(250,17,79,0.4)] fitness-press"
          >
            <span className="w-2 h-2 rounded-full bg-[#FA114F]" />
            <span>En vivo: {activeSession.dayName || 'Entreno'}</span>
          </button>
        ) : (
          <div className="fitness-card h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-black text-[#FFD60A] border-white/10">
            <span>🔥</span>
            <span>{currentStreak}d racha</span>
            <span className="text-[10px] text-[#8E8E93] font-bold">({workoutDaysTarget}d/sem)</span>
          </div>
        )}

        {/* Right: AI Builder Button */}
        <button
          onClick={onOpenAiBuilder}
          className="fitness-card h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-black text-[#00F0FF] hover:text-white hover:border-[#00F0FF]/40 fitness-press shadow-sm"
          title="Crear rutina con IA"
        >
          <span>✨</span>
          <span>IA Builder</span>
        </button>
      </div>

      {/* Big Apple Fitness Title & Date */}
      <div className="pt-1">
        <h1 className="text-3xl font-black text-white tracking-tight leading-none">
          {tabTitles[activeTab]}
        </h1>
        <div className="text-[11px] font-bold tracking-widest text-[#8E8E93] uppercase mt-1">
          {formattedDate}
        </div>
      </div>
    </header>
  );
};
