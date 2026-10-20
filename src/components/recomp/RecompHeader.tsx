'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey, getYesterdayKey } from '@/lib/date';
import { format, parseISO } from 'date-fns';
import { DateSelectionModal } from './DateSelectionModal';

interface RecompHeaderProps {
  onOpenSettings?: () => void;
}

export const RecompHeader: React.FC<RecompHeaderProps> = () => {
  const { userName, setCurrentApp } = useHubStore();
  const { selectedDate } = useRecompStore();
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  const isToday = selectedDate === todayKey;
  const isYesterday = selectedDate === yesterdayKey;

  let dateLabel = 'Hoy';
  if (isYesterday) {
    dateLabel = 'Ayer';
  } else if (!isToday) {
    try {
      dateLabel = format(parseISO(selectedDate), 'dd/MM');
    } catch {
      dateLabel = selectedDate;
    }
  }

  return (
    <>
      <header className="mb-4 space-y-2 relative z-20">
        {/* Top Bar Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Date Selector Pill (Glassmorphism) */}
          <button
            className="bg-[#2C2C2E] border border-white/[0.08] h-8 px-3.5 rounded-full text-xs font-black text-[#F5F5F7] inline-flex items-center gap-1.5 shadow-sm hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none relative shrink-0"
            onClick={() => setIsDateModalOpen(true)}
            aria-label="Seleccionar fecha"
          >
            <span>🗓️</span>
            <span>{dateLabel}</span>
            <span className="text-[10px] text-[#8E8E93] ml-0.5">▾</span>
            {!isToday && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A1F524] " />
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Return to HUB Button */}
            <button
              onClick={() => setCurrentApp('hub')}
              className="bg-[#2C2C2E] border border-white/[0.08] h-8 px-3 rounded-full inline-flex items-center gap-1.5 hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none text-xs font-black text-[#F5F5F7] shadow-sm group"
              title="Regresar al HUB principal"
              aria-label="Regresar al HUB"
            >
              <span className="text-sm leading-none group-hover:-translate-x-0.5 transition-transform duration-150 motion-reduce:transition-none">‹</span>
              <span className="text-[11px] font-black tracking-tight">HUB</span>
            </button>
          </div>
        </div>

        {/* User Sub-header */}
        <div className="px-1 flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5F5F7]">
            <strong className="font-black">{userName}</strong> 👋
            {!isToday && (
              <span className="text-xs text-[#A1F524] font-black ml-2">
                • {isYesterday ? 'Ayer' : selectedDate}
              </span>
            )}
          </span>
        </div>
      </header>

      {/* Sheet Modal para Seleccionar Fecha */}
      <DateSelectionModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />
    </>
  );
};
