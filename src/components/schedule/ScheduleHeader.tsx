'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { IconSettings } from '../common/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScheduleHeaderProps {
  onOpenSettings: () => void;
  onOpenAiImport: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onOpenSettings,
  onOpenAiImport,
}) => {
  const { setCurrentApp } = useHubStore();
  const { profiles, activeProfileId, setActiveProfileId } = useScheduleStore();

  const now = new Date();
  const formattedDate = format(now, 'EEE, d MMM', { locale: es });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="flex flex-col space-y-2.5 pt-1 relative z-20">
      {/* Row 1: Apple Fitness Top Navigation Bar */}
      <div className="flex items-center justify-between">
        {/* Left: Return to Hub Capsule */}
        <button
          onClick={() => setCurrentApp('hub')}
          className="h-8 px-3 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center gap-1 text-xs font-bold text-white hover:border-white/30 fitness-press shadow-sm group"
          title="Volver al HUB principal"
        >
          <span className="text-sm leading-none font-bold group-hover:-translate-x-0.5 transition-transform">‹</span>
          <span>HUB</span>
        </button>

        {/* Center: Apple Date Capsule */}
        <div
          className="h-8 px-3.5 rounded-full bg-[#1C1C1E] border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
          title="Fecha de hoy"
        >
          <span className="text-xs">🗓️</span>
          <span>{capitalizedDate}</span>
        </div>

        {/* Right: Actions (AI Scanner & Settings) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAiImport}
            className="h-8 px-2.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-bold text-[#00F0FF] flex items-center gap-1 active:scale-95 transition-all shadow-sm fitness-press"
            title="Escanear horario con Gemini IA"
          >
            <span className="animate-pulse">✨</span>
            <span className="hidden xs:inline text-[11px]">IA</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90 transition-all fitness-press shadow-sm"
            title="Ajustes de Horarios"
          >
            <IconSettings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Apple-style Segmented Profile Switcher */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-1 rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar shadow-md">
        {profiles.map((p) => {
          const isSelected = p.id === activeProfileId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 fitness-press ${
                isSelected
                  ? 'bg-white text-black shadow-md scale-100'
                  : 'text-[#8E8E93] hover:text-white active:scale-95'
              }`}
            >
              <span className="text-xs">{p.icon}</span>
              <span className="truncate">{p.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
