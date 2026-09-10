'use client';

import React, { useState } from 'react';
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const now = new Date();
  // Formats as "Mié, 9 Sep 2026"
  const formattedDate = format(now, 'EEE, d MMM yyyy', { locale: es });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  return (
    <header className="flex flex-col space-y-3 pt-2">
      {/* Top Row: Date Pill (Left) & Hub / Settings (Right) */}
      <div className="flex items-center justify-between">
        {/* Date Pill: Directly matches sketch "DIA MES AÑO [ D/M/A ]" */}
        <div className="flex items-center gap-2">
          <div
            className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 shadow-sm"
            title="Fecha actual del calendario"
          >
            <span className="text-sm">🗓️</span>
            <span>{capitalizedDate}</span>
          </div>

          {/* AI Scanner Button pill */}
          <button
            onClick={onOpenAiImport}
            className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#0A84FF]/20 to-[#BF5AF2]/20 border border-[#0A84FF]/30 text-[11px] font-black text-[#64D2FF] flex items-center gap-1 active:scale-95 transition-transform"
            title="Escanear o importar horario con Gemini IA"
          >
            <span className="animate-pulse">✨</span>
            <span className="hidden xs:inline">IA Scan</span>
          </button>
        </div>

        {/* Right Actions: Return to Hub & Settings */}
        <div className="flex items-center gap-2">
          {/* Volver HUB: Directly matches sketch "VOLVER HUB" */}
          <button
            onClick={() => setCurrentApp('hub')}
            className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 hover:bg-[#2A2A2C] active:scale-95 transition-all shadow-sm"
          >
            <span className="text-xs">🏠</span>
            <span className="tracking-tight">Volver HUB</span>
          </button>

          {/* Settings Icon: Directly matches sketch "[ ⚙️ ]" */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-95 transition-all shadow-sm"
            title="Ajustes de Horarios y Notificaciones"
          >
            <IconSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Selector Chips Row (Universidad / Conducción / etc.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-extrabold text-[#8E8E93] uppercase tracking-wider px-1 shrink-0">
          Perfil:
        </span>
        {profiles.map((p) => {
          const isSelected = p.id === activeProfileId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#F5F5F7] text-[#131313] shadow-md scale-100'
                  : 'bg-[#1C1C1E] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
