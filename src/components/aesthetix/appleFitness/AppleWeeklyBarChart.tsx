'use client';

import React, { useMemo, useState } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { getDailyAesthetixActivity, getLocalDateKey } from '@/lib/aesthetixActivity';

interface AppleWeeklyBarChartProps {
  history: WorkoutHistoryItem[];
}

export type MetricType = 'calories' | 'minutes' | 'sets';

const metricOptions: { id: MetricType; icon: string; label: string }[] = [
  { id: 'calories', icon: '🔥', label: 'Calorías estimadas' },
  { id: 'minutes', icon: '🏃', label: 'Minutos de ejercicio' },
  { id: 'sets', icon: '💪', label: 'Series completadas' },
];

export const AppleWeeklyBarChart: React.FC<AppleWeeklyBarChartProps> = ({ history }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('calories');

  const daysData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index, 12);
      const dateKey = getLocalDateKey(date);
      const activity = getDailyAesthetixActivity(history, dateKey);
      return {
        dateKey,
        day: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()],
        isToday: index === 6,
        calories: activity.movementCalories,
        minutes: activity.exerciseMinutes,
        sets: activity.completedSets,
      };
    });
  }, [history]);

  const metricConfig = {
    calories: { color: '#FA114F', activeColor: '#FF2D55', glow: 'rgba(250, 17, 79, 0.45)', unit: 'KCAL EST.', goal: 600, scaleMax: 750, getValue: (day: typeof daysData[number]) => day.calories },
    minutes: { color: '#A1F524', activeColor: '#30D158', glow: 'rgba(161, 245, 36, 0.45)', unit: 'MIN', goal: 30, scaleMax: 60, getValue: (day: typeof daysData[number]) => day.minutes },
    sets: { color: '#00F0FF', activeColor: '#0A84FF', glow: 'rgba(0, 240, 255, 0.45)', unit: 'SERIES', goal: 12, scaleMax: 16, getValue: (day: typeof daysData[number]) => day.sets },
  };

  const current = metricConfig[selectedMetric];
  const values = daysData.map(current.getValue);
  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / 7);
  const maxValue = Math.max(current.scaleMax, ...values);
  const scaleMax = selectedMetric === 'calories'
    ? Math.ceil(maxValue / 100) * 100
    : selectedMetric === 'minutes'
      ? Math.ceil(maxValue / 10) * 10
      : Math.ceil(maxValue / 4) * 4;
  const hasActivity = values.some((value) => value > 0);

  return (
    <div className="fitness-card p-5 relative overflow-hidden shadow-2xl border border-white/[0.08]">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-lg font-black text-white tracking-tight">Esta semana</h3>
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/10">
          {metricOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedMetric(option.id)}
              aria-label={option.label}
              aria-pressed={selectedMetric === option.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedMetric === option.id
                  ? option.id === 'calories'
                    ? 'bg-[#FA114F] text-white'
                    : option.id === 'minutes'
                      ? 'bg-[#A1F524] text-black'
                      : 'bg-[#00F0FF] text-black'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <span className="text-xs">{option.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">
          Promedio diario · 7 días
        </div>
        <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1 mt-0.5">
          <span>{average}</span>
          <span className="text-xs font-bold text-[#8E8E93]">{current.unit}</span>
        </div>
      </div>

      <div className="relative h-44 w-full pt-6 pb-2">
        <div
          className="absolute left-0 right-10 flex items-center gap-2 pointer-events-none z-10"
          style={{ bottom: `${(current.goal / scaleMax) * 100}%` }}
        >
          <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest shrink-0">
            Meta {current.goal}
          </span>
          <div className="h-[1px] flex-1 border-b border-dotted border-white/20" />
        </div>

        <div className="absolute right-0 top-0 bottom-4 w-8 flex flex-col justify-between text-right pointer-events-none">
          <span className="text-[9px] font-bold text-[#636366]">{scaleMax}</span>
          <span className="text-[9px] font-bold text-[#636366]">{Math.round(scaleMax * 0.66)}</span>
          <span className="text-[9px] font-bold text-[#636366]">{Math.round(scaleMax * 0.33)}</span>
          <span className="text-[9px] font-bold text-[#636366]">0</span>
        </div>

        <div className="h-full pr-10 flex items-end justify-between gap-2 z-0">
          {daysData.map((day) => {
            const value = current.getValue(day);
            const heightPct = Math.min((value / scaleMax) * 100, 100);
            return (
              <div key={day.dateKey} className="flex-1 flex flex-col items-center h-full justify-end">
                {day.isToday && value > 0 && (
                  <div className="text-[10px] font-black mb-1" style={{ color: current.color }}>{value}</div>
                )}
                <div className="w-full max-w-[24px] bg-white/[0.05] rounded-full h-full flex items-end p-0.5">
                  <div
                    className="w-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: day.isToday ? current.activeColor : current.color,
                      opacity: day.isToday ? 1 : 0.82,
                      boxShadow: day.isToday && value > 0 ? `0 0 14px ${current.glow}` : 'none',
                    }}
                  />
                </div>
                <span className={`text-[10px] font-bold mt-2 uppercase ${day.isToday ? 'text-white font-black' : 'text-[#8E8E93]'}`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {!hasActivity && (
        <p className="mt-2 text-center text-[11px] font-medium text-[#8E8E93]">
          Aquí aparecerán tus datos cuando guardes un entrenamiento.
        </p>
      )}
    </div>
  );
};
