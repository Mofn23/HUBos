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
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      {/* 1. Rutina Hoy (Dinámica según nuevo split) */}
      <div className="glass-pill p-3 rounded-[22px] flex flex-col justify-between shadow-sm hover:border-white/25 active:scale-95 transition-all min-h-[90px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">{routine.icon}</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Hoy</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div className="text-xs font-black text-[#F5F5F7] truncate leading-tight">
            {routine.title}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] truncate">
            {routine.focus}
          </div>
        </div>
      </div>

      {/* 2. Racha Gym */}
      <div className="glass-pill p-3 rounded-[22px] flex flex-col justify-between shadow-sm hover:border-white/25 active:scale-95 transition-all min-h-[90px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">🔥</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Gym</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div className="text-xs font-black text-[#F5F5F7] tracking-tight">
            {gymStreakDays} {gymStreakDays === 1 ? 'día' : 'días'}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93]">
            Racha activa
          </div>
        </div>
      </div>

      {/* 3. Nutrición */}
      <div className="glass-pill p-3 rounded-[22px] flex flex-col justify-between shadow-sm hover:border-white/25 active:scale-95 transition-all min-h-[90px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">🥑</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Dieta</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div
            className="text-xs font-black tracking-tight"
            style={{ color: hasLoggedToday ? '#34C759' : '#FF9F43' }}
          >
            {nutStreakDays} {nutStreakDays === 1 ? 'día' : 'días'}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] truncate">
            {hasLoggedToday ? 'Cumplido ✓' : 'Pendiente'}
          </div>
        </div>
      </div>
    </div>
  );
};
