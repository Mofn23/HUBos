'use client';

import React, { useState } from 'react';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface CalorieRingProps {
  consumed: number;
  target: number;
  difference: number;
  status: 'optimal' | 'deficit' | 'surplus';
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  status,
}) => {
  const [viewMode, setViewMode] = useState<'remaining' | 'consumed'>('remaining');

  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  const statusLabel =
    status === 'optimal'
      ? 'Óptimo'
      : status === 'deficit'
      ? 'En Déficit'
      : 'En Superávit';

  const displayNum = viewMode === 'remaining' ? (isOver ? consumed - target : remaining) : consumed;

  return (
    <div className="flex flex-col items-center mb-4 w-full">
      {/* Apple Fitness Bento Block */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-6 w-full text-center space-y-4 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Radial Highlight inside card */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#FA114F]/10 blur-2xl" />

        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
            {viewMode === 'remaining'
              ? isOver
                ? 'Calorías Excedidas'
                : 'Calorías Restantes'
              : 'Calorías Consumidas'}
          </span>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${
                isOver
                  ? 'bg-[#FA114F]/20 text-[#FA114F] border border-[#FA114F]/30'
                  : 'bg-[#A1F524]/20 text-[#A1F524] border border-[#A1F524]/30'
              }`}
            >
              {isOver ? '−' : '+'}
            </div>
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-sm">
              <AnimatedNumber value={displayNum} />
            </span>
            <span className="text-sm font-black text-[#8E8E93] self-end mb-1">kcal</span>
          </div>

          <div className="pt-2">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-black border ${
                status === 'optimal'
                  ? 'bg-[#A1F524]/15 text-[#A1F524] border-[#A1F524]/30 shadow-[0_0_12px_rgba(161,245,36,0.2)]'
                  : status === 'deficit'
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30'
                  : 'bg-[#FA114F]/15 text-[#FA114F] border-[#FA114F]/30 shadow-[0_0_12px_rgba(250,17,79,0.2)]'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Segmented Control Dual Selector (Apple Fitness White Pill) */}
        <div className="bg-[#2C2C2E] p-1 rounded-full flex items-center shadow-inner relative z-10 max-w-sm mx-auto">
          <button
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 fitness-press ${
              viewMode === 'consumed'
                ? 'bg-white text-black font-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
            onClick={() => setViewMode('consumed')}
          >
            <span>🍽️</span>
            <span>{consumed} kcal consumidas</span>
          </button>
          <button
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 fitness-press ${
              viewMode === 'remaining'
                ? 'bg-white text-black font-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
            onClick={() => setViewMode('remaining')}
          >
            <span>🎯</span>
            <span>Meta {target} kcal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
