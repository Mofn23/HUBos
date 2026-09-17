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
      {/* Frosted Glass Bento Total Block */}
      <div className="glass-surface rounded-[32px] p-6 w-full text-center space-y-4 border-t-white/25 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Highlight inside card */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#34C759]/10 blur-2xl" />

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
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black backdrop-blur-md shadow-sm ${
                isOver
                  ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30'
                  : 'bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30'
              }`}
            >
              {isOver ? '−' : '+'}
            </div>
            <span className="text-5xl font-black text-[#F5F5F7] tracking-tighter drop-shadow-sm">
              <AnimatedNumber value={displayNum} />
            </span>
            <span className="text-sm font-black text-[#8E8E93] self-end mb-1">kcal</span>
          </div>

          <div className="pt-2">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-black backdrop-blur-md border ${
                status === 'optimal'
                  ? 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30 shadow-[0_0_12px_rgba(52,199,89,0.25)]'
                  : status === 'deficit'
                  ? 'bg-white/[0.08] text-[#F5F5F7] border-white/20'
                  : 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 shadow-[0_0_12px_rgba(255,69,58,0.25)]'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Segmented Glass Pill Dual Selector */}
        <div className="glass-pill p-1 rounded-full flex items-center shadow-inner relative z-10 max-w-sm mx-auto">
          <button
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'consumed'
                ? 'glass-pill-active text-white shadow-sm scale-100'
                : 'text-[#8E8E93] hover:text-white active:scale-95'
            }`}
            onClick={() => setViewMode('consumed')}
          >
            <span>🍽️</span>
            <span>{consumed} kcal consumidas</span>
          </button>
          <button
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'remaining'
                ? 'glass-pill-active text-white shadow-sm scale-100'
                : 'text-[#8E8E93] hover:text-white active:scale-95'
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
