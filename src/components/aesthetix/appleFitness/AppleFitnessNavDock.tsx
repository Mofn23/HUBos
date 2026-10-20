'use client';

import React from 'react';
import { ActiveWorkoutSession } from '@/types/workout';

export type AppleFitnessTab = 'summary' | 'workouts' | 'awards' | 'profile';

interface AppleFitnessNavDockProps {
  activeTab: AppleFitnessTab;
  onTabChange: (tab: AppleFitnessTab) => void;
  activeSession: ActiveWorkoutSession | null;
  onOpenLiveWorkout: () => void;
  isHidden?: boolean;
}

export const AppleFitnessNavDock: React.FC<AppleFitnessNavDockProps> = ({
  activeTab,
  onTabChange,
  activeSession,
  onOpenLiveWorkout,
  isHidden = false,
}) => {
  return (
    <div
      className={`fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto transition-all duration-300 ease-out ${
        isHidden ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Live Workout Floating Mini Dynamic Island if active */}
      {activeSession && (
        <div className="flex justify-center mb-2">
          <button
            onClick={onOpenLiveWorkout}
            className="px-4 py-1.5 rounded-full bg-[#FA114F] text-white text-xs font-black shadow-[0_0_20px_rgba(250,17,79,0.5)] border border-white/20 flex items-center gap-2 fitness-press"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>En vivo: {activeSession.dayName || 'Entreno'}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-mono">
              Reanudar ›
            </span>
          </button>
        </div>
      )}

      {/* Main Glass Navigation Dock */}
      <nav className="fitness-glass-dock rounded-full p-1.5 flex items-center justify-around">
        {/* 1. Summary Tab */}
        <button
          onClick={() => onTabChange('summary')}
          className="flex-1 py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 fitness-press transition-all"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'summary'
                ? 'bg-[#A1F524] text-black shadow-[0_0_14px_rgba(161,245,36,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            {/* Concentric rings mini icon */}
            <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="56"
                strokeDashoffset="12"
              />
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="38"
                strokeDashoffset="6"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="18"
                strokeDashoffset="2"
              />
            </svg>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'summary' ? 'text-[#A1F524] font-black' : 'text-[#8E8E93]'
            }`}
          >
            Resumen
          </span>
        </button>

        {/* 2. Workouts Tab */}
        <button
          onClick={() => onTabChange('workouts')}
          className="flex-1 py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 fitness-press transition-all"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'workouts'
                ? 'bg-[#A1F524] text-black shadow-[0_0_14px_rgba(161,245,36,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span className="text-base font-bold">🏃</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'workouts' ? 'text-[#A1F524] font-black' : 'text-[#8E8E93]'
            }`}
          >
            Entrenos
          </span>
        </button>

        {/* 3. Awards Tab */}
        <button
          onClick={() => onTabChange('awards')}
          className="flex-1 py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 fitness-press transition-all"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'awards'
                ? 'bg-[#A1F524] text-black shadow-[0_0_14px_rgba(161,245,36,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span className="text-base font-bold">🏅</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'awards' ? 'text-[#A1F524] font-black' : 'text-[#8E8E93]'
            }`}
          >
            Premios
          </span>
        </button>

        {/* 4. Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className="flex-1 py-1 px-1 rounded-full flex flex-col items-center justify-center gap-0.5 fitness-press transition-all"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'profile'
                ? 'bg-[#A1F524] text-black shadow-[0_0_14px_rgba(161,245,36,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span className="text-base font-bold">👤</span>
          </div>
          <span
            className={`text-[10px] font-bold ${
              activeTab === 'profile' ? 'text-[#A1F524] font-black' : 'text-[#8E8E93]'
            }`}
          >
            Perfil
          </span>
        </button>
      </nav>
    </div>
  );
};
