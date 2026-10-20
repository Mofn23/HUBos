'use client';

import React from 'react';
import { useRecompStore } from '@/stores/useRecompStore';

export const QuickStatsRow: React.FC = () => {
  const { nutritionStreak } = useRecompStore();
  const nutStreakDays = nutritionStreak?.currentStreak ?? 0;
  const hasLoggedToday = nutritionStreak?.hasLoggedToday ?? false;

  return (
    <div className="mb-4">
      <div className="bg-[#2C2C2E] border border-white/[0.08] px-4 py-3 rounded-[22px] flex items-center gap-3 shadow-sm">
        <span className="text-lg" aria-hidden="true">🥑</span>
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-black tracking-tight"
            style={{ color: hasLoggedToday ? '#A1F524' : '#FF9F43' }}
          >
            Racha de nutrición · {nutStreakDays} {nutStreakDays === 1 ? 'día' : 'días'}
          </div>
          <div className="text-xs font-bold text-[#8E8E93] truncate">
            {hasLoggedToday ? 'Cumplido ✓' : 'Pendiente'}
          </div>
        </div>
      </div>
    </div>
  );
};
