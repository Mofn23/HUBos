'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { AppleFitnessTab } from './appleFitness/AppleFitnessNavDock';

interface AesthetixHeaderProps {
  activeTab: AppleFitnessTab;
  onOpenLiveWorkout: () => void;
}

export const AesthetixHeader: React.FC<AesthetixHeaderProps> = ({
  activeTab,
  onOpenLiveWorkout,
}) => {
  const { setCurrentApp } = useHubStore();
  const { activeSession } = useAesthetixStore();

  // Formatted Apple Fitness date e.g. "FRIDAY, SEPTEMBER 25" or Spanish "LUNES, 19 DE OCTUBRE"
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  const tabTitles: Record<AppleFitnessTab, string> = {
    summary: 'Resumen',
    workouts: 'Entrenamientos',
    awards: 'Premios',
    profile: 'Perfil',
  };

  return (
    <header className="relative z-20 w-full mb-3 space-y-2">
      {/* Top Utilities Bar */}
      <div className="flex items-center justify-end gap-2 w-full">
        {/* A live session remains available without duplicating the streak. */}
        {activeSession ? (
          <button
            onClick={onOpenLiveWorkout}
            className="h-8 px-3.5 rounded-full bg-[#FA114F]/15 border border-[#FA114F]/30 text-[#FA114F] text-xs font-black flex items-center gap-2 fitness-press"
          >
            <span className="w-2 h-2 rounded-full bg-[#FA114F]" />
            <span>En vivo: {activeSession.dayName || 'Entreno'}</span>
          </button>
        ) : null}

        <button
          onClick={() => setCurrentApp('hub')}
          className="bg-[#2C2C2E] border border-white/[0.08] h-8 px-3 rounded-full inline-flex items-center gap-1.5 hover:border-white/30 fitness-press text-xs font-black text-[#F5F5F7] shadow-sm group"
          title="Regresar al HUB principal"
          aria-label="Regresar al HUB"
        >
          <span className="text-sm leading-none group-hover:-translate-x-0.5 transition-transform duration-150">‹</span>
          <span className="text-[11px] font-black tracking-tight">HUB</span>
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
