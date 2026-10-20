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
  const { selectedDate, streak, nutritionStreak } = useRecompStore();
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

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 5 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

  return (
    <>
      <header className="mb-4 space-y-2 relative z-20">
        {/* Top Bar Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Date Selector Pill (Apple Fitness Pill) */}
          <button
            className="bg-[#1C1C1E] border border-white/[0.08] h-8 px-3.5 rounded-full text-xs font-black text-white inline-flex items-center gap-1.5 shadow-sm hover:border-white/20 fitness-press transition-all relative shrink-0"
            onClick={() => setIsDateModalOpen(true)}
            aria-label="Seleccionar fecha"
          >
            <span>🗓️</span>
            <span>{dateLabel}</span>
            <span className="text-[10px] text-[#8E8E93] ml-0.5">▾</span>
            {!isToday && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A1F524] shadow-[0_0_8px_#A1F524]" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Unified Streaks Pill (Workout + Nutrition) */}
            <div
              className="bg-[#1C1C1E] border border-white/[0.08] h-8 px-3 rounded-full text-xs font-black shadow-sm inline-flex items-center gap-2 text-white"
              title="Rachas de Entrenamiento y Nutrición"
            >
              <div className="flex items-center gap-1">
                <span>💪</span>
                <span className="text-white">{streak?.currentStreak ?? 0}d</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1">
                <span>🥑</span>
                <span style={{ color: nutritionStreak?.hasLoggedToday ? '#A1F524' : '#FFD60A' }}>
                  {nutritionStreak?.currentStreak ?? 0}d
                </span>
              </div>
            </div>

            {/* Return to HUB Button */}
            <button
              onClick={() => setCurrentApp('hub')}
              className="bg-[#1C1C1E] border border-white/[0.08] h-8 px-3.5 rounded-full inline-flex items-center gap-1.5 hover:border-white/20 fitness-press transition-all text-xs font-black text-white shadow-sm group"
              title="Regresar al HUB principal"
              aria-label="Regresar al HUB"
            >
              <span className="text-sm leading-none group-hover:-translate-x-0.5 transition-transform text-[#A1F524]">‹</span>
              <span className="text-[11px] font-black tracking-tight">HUB</span>
            </button>
          </div>
        </div>

        {/* Greeting Sub-header */}
        <div className="px-1 flex items-center justify-between">
          <span className="text-xs font-bold text-[#8E8E93]">
            {greeting},{' '}
            <strong className="text-white font-black">{userName}</strong> 👋
            {!isToday && (
              <span className="text-xs text-[#A1F524] font-black ml-2">
                • {isYesterday ? 'Ayer' : selectedDate}
              </span>
            )}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
            Recomp AI
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
