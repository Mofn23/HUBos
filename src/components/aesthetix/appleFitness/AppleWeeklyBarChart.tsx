'use client';

import React, { useState } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';

interface AppleWeeklyBarChartProps {
  history?: WorkoutHistoryItem[];
}

export type MetricType = 'calories' | 'minutes' | 'stand';

export const AppleWeeklyBarChart: React.FC<AppleWeeklyBarChartProps> = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('calories');

  // Days: S S M T W T F
  const daysData = [
    { day: 'S', cal: 420, min: 28, stand: 10 },
    { day: 'S', cal: 510, min: 35, stand: 12 },
    { day: 'M', cal: 380, min: 24, stand: 9 },
    { day: 'T', cal: 290, min: 20, stand: 8 },
    { day: 'W', cal: 710, min: 52, stand: 14 },
    { day: 'T', cal: 490, min: 32, stand: 11 },
    { day: 'F', cal: 642, min: 41, stand: 12, isToday: true },
  ];

  const metricConfig = {
    calories: {
      color: '#FA114F',
      activeColor: '#FF2D55',
      glow: 'rgba(250, 17, 79, 0.45)',
      unit: 'CAL',
      goal: 600,
      dailyAverage: '628',
      scaleMax: 750,
      getValue: (d: typeof daysData[0]) => d.cal,
    },
    minutes: {
      color: '#A1F524',
      activeColor: '#30D158',
      glow: 'rgba(161, 245, 36, 0.45)',
      unit: 'MIN',
      goal: 30,
      dailyAverage: '33',
      scaleMax: 60,
      getValue: (d: typeof daysData[0]) => d.min,
    },
    stand: {
      color: '#00F0FF',
      activeColor: '#0A84FF',
      glow: 'rgba(0, 240, 255, 0.45)',
      unit: 'HRS',
      goal: 12,
      dailyAverage: '11',
      scaleMax: 16,
      getValue: (d: typeof daysData[0]) => d.stand,
    },
  };

  const current = metricConfig[selectedMetric];

  return (
    <div className="fitness-card p-5 relative overflow-hidden shadow-2xl border border-white/[0.08]">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black text-white tracking-tight">This Week</h3>

        {/* 3 Metric Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10">
          <button
            onClick={() => setSelectedMetric('calories')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              selectedMetric === 'calories'
                ? 'bg-[#FA114F] text-white shadow-[0_0_12px_rgba(250,17,79,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
            title="Move (Calories)"
          >
            <span className="text-xs">🔥</span>
          </button>
          <button
            onClick={() => setSelectedMetric('minutes')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              selectedMetric === 'minutes'
                ? 'bg-[#A1F524] text-black shadow-[0_0_12px_rgba(161,245,36,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
            title="Exercise (Minutes)"
          >
            <span className="text-xs">🏃</span>
          </button>
          <button
            onClick={() => setSelectedMetric('stand')}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              selectedMetric === 'stand'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.5)] scale-105'
                : 'text-[#8E8E93] hover:text-white'
            }`}
            title="Stand / Hours"
          >
            <span className="text-xs">🚶</span>
          </button>
        </div>
      </div>

      {/* Subtitle & Value */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">
          DAILY AVERAGE
        </div>
        <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1 mt-0.5">
          <span>{current.dailyAverage}</span>
          <span className="text-xs font-bold text-[#8E8E93]">{current.unit}</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative h-44 w-full pt-6 pb-2">
        {/* Goal line */}
        <div
          className="absolute left-0 right-10 flex items-center gap-2 pointer-events-none z-10"
          style={{
            bottom: `${(current.goal / current.scaleMax) * 100}%`,
          }}
        >
          <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest shrink-0">
            GOAL {current.goal}
          </span>
          <div className="h-[1px] flex-1 border-b border-dotted border-white/20" />
        </div>

        {/* Y-Axis scale marks on the right */}
        <div className="absolute right-0 top-0 bottom-4 w-8 flex flex-col justify-between text-right pointer-events-none">
          <span className="text-[9px] font-bold text-[#636366]">{current.scaleMax}</span>
          <span className="text-[9px] font-bold text-[#636366]">{Math.round(current.scaleMax * 0.66)}</span>
          <span className="text-[9px] font-bold text-[#636366]">{Math.round(current.scaleMax * 0.33)}</span>
          <span className="text-[9px] font-bold text-[#636366]">0</span>
        </div>

        {/* Bars Container */}
        <div className="h-full pr-10 flex items-end justify-between gap-2 z-0">
          {daysData.map((d, idx) => {
            const val = current.getValue(d);
            const heightPct = Math.min((val / current.scaleMax) * 100, 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Value tooltip label for today / highest day */}
                {d.isToday && (
                  <div
                    className="text-[10px] font-black mb-1 animate-pulse"
                    style={{ color: current.color }}
                  >
                    {val}
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full max-w-[24px] bg-white/[0.05] rounded-full h-full flex items-end p-0.5">
                  <div
                    className="w-full rounded-full transition-all duration-500 ease-out animate-bar-grow"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: d.isToday ? current.activeColor : current.color,
                      opacity: d.isToday ? 1 : 0.82,
                      boxShadow: d.isToday ? `0 0 14px ${current.glow}` : 'none',
                    }}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] font-bold mt-2 uppercase ${
                    d.isToday ? 'text-white font-black' : 'text-[#8E8E93]'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
