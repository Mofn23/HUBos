'use client';

import React from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { getDailyRoutine } from '@/lib/trainingSchedule';

export const QuickStatsRow: React.FC = () => {
  const { streak, nutritionStreak, selectedDate } = useRecompStore();

  const routine = getDailyRoutine(selectedDate);
  const gymStreakDays = streak?.currentStreak ?? 0;
  const nutStreakDays = nutritionStreak?.currentStreak ?? 0;
  const hasLoggedToday = nutritionStreak?.hasLoggedToday ?? false;

  return (
    <div className="dashboard-quick-stats">
      {/* 1. Rutina Hoy (Dinámica según día de la semana) */}
      <div className="quick-stat">
        <div className="quick-stat-icon-top">{routine.icon}</div>
        <div className="quick-stat-content">
          <div className="quick-stat-val text-xs truncate max-w-[90px]">{routine.title}</div>
          <div className="quick-stat-lbl">{routine.focus} • Hoy</div>
        </div>
      </div>

      {/* 2. Racha Gym */}
      <div className="quick-stat">
        <div className="quick-stat-icon-top">🔥</div>
        <div className="quick-stat-content">
          <div className="quick-stat-val">{gymStreakDays} {gymStreakDays === 1 ? 'día' : 'días'}</div>
          <div className="quick-stat-lbl">Racha Gym</div>
        </div>
      </div>

      {/* 3. Nutrición */}
      <div className="quick-stat">
        <div className="quick-stat-icon-top">🥑</div>
        <div className="quick-stat-content">
          <div
            className="quick-stat-val"
            style={{ color: hasLoggedToday ? '#34C759' : '#FF9F43' }}
          >
            {nutStreakDays} {nutStreakDays === 1 ? 'día' : 'días'}
          </div>
          <div className="quick-stat-lbl">
            {hasLoggedToday ? 'Nutrición ✓' : 'Nutrición (min 2)'}
          </div>
        </div>
      </div>
    </div>
  );
};
