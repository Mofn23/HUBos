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
      {/* 1. Rutina Hoy */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-3.5 rounded-2xl flex flex-col justify-between shadow-md hover:border-white/20 fitness-press transition-all min-h-[92px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">{routine.icon}</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Hoy</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div className="text-xs font-black text-white truncate leading-tight">
            {routine.title}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] truncate">
            {routine.focus}
          </div>
        </div>
      </div>

      {/* 2. Racha Gym */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-3.5 rounded-2xl flex flex-col justify-between shadow-md hover:border-white/20 fitness-press transition-all min-h-[92px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">🔥</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Gym</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div className="text-xs font-black text-white tracking-tight">
            {gymStreakDays} {gymStreakDays === 1 ? 'día' : 'días'}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93]">
            Racha activa
          </div>
        </div>
      </div>

      {/* 3. Nutrición */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-3.5 rounded-2xl flex flex-col justify-between shadow-md hover:border-white/20 fitness-press transition-all min-h-[92px] group">
        <div className="flex items-center justify-between">
          <span className="text-base group-hover:scale-110 transition-transform">🥑</span>
          <span className="text-[9px] font-black uppercase text-[#8E8E93] tracking-wider">Dieta</span>
        </div>
        <div className="space-y-0.5 mt-1">
          <div
            className="text-xs font-black tracking-tight"
            style={{ color: hasLoggedToday ? '#A1F524' : '#FFD60A' }}
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
