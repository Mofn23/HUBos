'use client';

import React from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';

export const QuickStatsRow: React.FC = () => {
  const { streak, trainingLogs, meals } = useRecompStore();
  const todayKey = getTodayKey();

  const latestTraining = trainingLogs[0]?.title || 'Upper B';
  const shortRoutine = latestTraining.split(' (')[0].split(' - ')[0];
  const hasLoggedToday = meals.some((m) => m.date === todayKey);

  return (
    <div className="dashboard-quick-stats">
      {/* 1. Rutina Hoy */}
      <div className="quick-stat">
        <div className="quick-stat-icon-top">💪</div>
        <div className="quick-stat-content">
          <div className="quick-stat-val">{shortRoutine}</div>
          <div className="quick-stat-lbl">Rutina Hoy</div>
        </div>
      </div>

      {/* 2. Racha Gym */}
      <div className="quick-stat">
        <div className="quick-stat-icon-top">🔥</div>
        <div className="quick-stat-content">
          <div className="quick-stat-val">{streak?.currentStreak || 1} días</div>
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
            2 días
          </div>
          <div className="quick-stat-lbl">
            {hasLoggedToday ? 'Nutrición ✓' : 'Nutrición ⚠️'}
          </div>
        </div>
      </div>
    </div>
  );
};
