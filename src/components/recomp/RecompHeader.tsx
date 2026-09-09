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
      <header className="mb-4">
        {/* MonAI TopBar */}
        <div className="monai-topbar flex items-center justify-between gap-2">
          {/* Date Selector Pill */}
          <button
            className="monai-topbar-pill relative shrink-0"
            onClick={() => setIsDateModalOpen(true)}
            aria-label="Seleccionar fecha"
          >
            <span>{dateLabel}</span>
            <span className="text-xs text-[#8E8E93]">∨</span>
            {!isToday && (
              <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-[#34C759] ring-2 ring-[#0B0B0D]" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Unified Streaks Pill (Workout + Nutrition) */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-xs font-black shadow-sm"
              title="Rachas de Entrenamiento y Nutrición"
            >
              <div className="flex items-center gap-1">
                <span>💪</span>
                <span className="text-[#F5F5F7]">{streak?.currentStreak ?? 0}d</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1">
                <span>🥑</span>
                <span style={{ color: nutritionStreak?.hasLoggedToday ? '#34C759' : '#FF9F43' }}>
                  {nutritionStreak?.currentStreak ?? 0}d
                </span>
              </div>
            </div>

            {/* Return to HUB Button */}
            <button
              onClick={() => setCurrentApp('hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#252528] active:scale-95 border border-white/10 transition-all text-xs font-black text-[#F5F5F7]"
              title="Regresar al HUB principal"
              aria-label="Regresar al HUB"
            >
              <span className="text-sm">🏠</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93]">HUB</span>
            </button>
          </div>
        </div>

        {/* Greeting Sub-header */}
        <div className="monai-greeting-row">
          <span className="monai-greeting-text">
            {greeting},{' '}
            <strong className="text-[#F5F5F7] font-black">{userName}</strong> 👋
            {!isToday && (
              <span className="text-xs text-[#34C759] font-black ml-2">
                (Historial: {isYesterday ? 'Ayer' : selectedDate})
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
