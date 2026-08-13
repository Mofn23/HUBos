'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey, formatDateSpanish } from '@/lib/date';
import { IconSettings, IconChevronRight } from '../common/Icons';

interface RecompHeaderProps {
  onOpenSettings: () => void;
}

export const RecompHeader: React.FC<RecompHeaderProps> = ({ onOpenSettings }) => {
  const { userName } = useHubStore();
  const { streak, meals } = useRecompStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayKey = getTodayKey();
  const hasLoggedToday = meals.some((m) => m.date === todayKey);

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 5 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

  return (
    <header className="mb-4">
      {/* MonAI TopBar */}
      <div className="monai-topbar">
        <button
          className="monai-topbar-pill"
          onClick={() => setShowDatePicker(true)}
          aria-label="Seleccionar fecha"
        >
          <span>Hoy</span>
          <span className="text-xs text-[#8E8E93]">∨</span>
        </button>

        <div className="monai-topbar-actions">
          {/* Workout Streak Pill */}
          <div className="monai-streak-pill">
            <span>💪</span>
            <span>{streak?.currentStreak || 1}d</span>
          </div>

          {/* Nutrition Streak Pill */}
          <div
            className="monai-streak-pill"
            style={{
              background: hasLoggedToday ? 'rgba(52, 199, 89, 0.16)' : 'rgba(255, 159, 67, 0.16)',
              border: `1px solid ${hasLoggedToday ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 159, 67, 0.3)'}`,
            }}
          >
            <span>🥑</span>
            <span style={{ color: hasLoggedToday ? '#34C759' : '#FF9F43' }}>2d</span>
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
        </span>
      </div>
    </header>
  );
};
