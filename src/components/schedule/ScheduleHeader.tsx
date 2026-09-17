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
    <header className="flex flex-col space-y-2.5 pt-2 relative z-20">
      {/* Row 1: Unified Minimalist Top Bar */}
      <div className="flex items-center justify-between">
        {/* Left: Minimalist Return to Hub Capsule */}
        <button
          onClick={() => setCurrentApp('hub')}
          className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 hover:border-white/30 active:scale-95 transition-all shadow-sm group"
          title="Volver al HUB principal"
        >
          <span className="text-sm leading-none group-hover:-translate-x-0.5 transition-transform">‹</span>
          <span className="tracking-tight">HUB</span>
        </button>

        {/* Center: Frosted Date Capsule */}
        <div
          className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 shadow-sm"
          title="Fecha de hoy"
        >
          <span className="text-xs">🗓️</span>
          <span>{capitalizedDate}</span>
        </div>

        {/* Right: Actions (AI Scanner & Settings) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAiImport}
            className="glass-pill px-2.5 py-1.5 rounded-full text-xs font-black text-[#64D2FF] border-[#0A84FF]/25 hover:border-[#64D2FF]/50 flex items-center gap-1 active:scale-95 transition-all shadow-sm"
            title="Escanear horario con Gemini IA"
          >
            <span className="animate-pulse">✨</span>
            <span className="hidden xs:inline text-[11px]">IA</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-[#F5F5F7] hover:text-white hover:border-white/30 active:scale-95 transition-all shadow-sm"
            title="Ajustes de Horarios"
          >
            <IconSettings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Apple-style Segmented Frosted Glass Profile Switcher */}
      <div className="glass-surface p-1 rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar shadow-inner">
        {profiles.map((p) => {
          const isSelected = p.id === activeProfileId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'glass-pill-active text-[#F5F5F7] shadow-sm scale-100'
                  : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
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
