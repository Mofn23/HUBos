'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey, getYesterdayKey } from '@/lib/date';
import { format, parseISO } from 'date-fns';
import { IconSettings } from '../common/Icons';
import { DateSelectionModal } from './DateSelectionModal';

interface RecompHeaderProps {
  onOpenSettings: () => void;
}

export const RecompHeader: React.FC<RecompHeaderProps> = ({ onOpenSettings }) => {
  const { userName } = useHubStore();
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
        <div className="monai-topbar">
          {/* Date Selector Pill */}
          <button
            className="monai-topbar-pill relative"
            onClick={() => setIsDateModalOpen(true)}
            aria-label="Seleccionar fecha"
          >
            <span>{dateLabel}</span>
            <span className="text-xs text-[#8E8E93]">∨</span>
            {!isToday && (
              <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-[#34C759] ring-2 ring-[#0B0B0D]" />
            )}
          </button>

          <div className="monai-topbar-actions">
            {/* Workout Streak Pill */}
            <div className="monai-streak-pill" title="Racha de Entrenamiento">
              <span>💪</span>
              <span>{streak.currentStreak || 1}d</span>
            </div>

            {/* Nutrition Streak Pill */}
            <div
              className="monai-streak-pill"
              style={{
                background: nutritionStreak.hasLoggedToday
                  ? 'rgba(52, 199, 89, 0.16)'
                  : 'rgba(255, 159, 67, 0.16)',
                border: `1px solid ${
                  nutritionStreak.hasLoggedToday
                    ? 'rgba(52, 199, 89, 0.4)'
                    : 'rgba(255, 159, 67, 0.3)'
                }`,
              }}
              title="Racha de Nutrición"
            >
              <span>🥑</span>
              <span style={{ color: nutritionStreak.hasLoggedToday ? '#34C759' : '#FF9F43' }}>
                {nutritionStreak.currentStreak || 2}d
              </span>
            </div>

            {/* Settings Button */}
            <button
              className="monai-topbar-btn"
              onClick={onOpenSettings}
              aria-label="Ajustes"
            >
              <IconSettings className="w-5 h-5 text-[#F5F5F7]" />
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
