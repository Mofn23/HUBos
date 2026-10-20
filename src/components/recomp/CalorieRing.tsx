'use client';

import React, { useState } from 'react';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
}) => {
  const [viewMode, setViewMode] = useState<'remaining' | 'consumed'>('remaining');

  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  const displayNum = viewMode === 'remaining' ? (isOver ? consumed - target : remaining) : consumed;

  return (
    <div className="flex flex-col items-center mb-4 w-full">
      {/* Daily calorie summary */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-[32px] p-6 w-full text-center space-y-4 border-t-white/25 shadow-sm relative overflow-hidden">

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
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black  shadow-sm ${
                isOver
                  ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30'
                  : 'bg-[#A1F524]/20 text-[#A1F524] border border-[#A1F524]/30'
              }`}
            >
              {isOver ? '−' : '+'}
            </div>
            <span className="text-5xl font-black text-[#F5F5F7] tracking-tighter drop-shadow-sm">
              <AnimatedNumber value={displayNum} />
            </span>
            <span className="text-sm font-black text-[#8E8E93] self-end mb-1">kcal</span>
          </div>

        </div>

        {/* Calorie view selector */}
        <div className="bg-[#2C2C2E] border border-white/[0.08] p-1 rounded-full flex items-center shadow-inner relative z-10 max-w-sm mx-auto">
          <button
            className={`min-w-0 flex-1 py-1.5 px-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center gap-1 ${
              viewMode === 'consumed'
                ? 'bg-[#3A3A3C] text-white shadow-sm scale-100'
                : 'text-[#8E8E93] hover:text-white active:scale-95 motion-reduce:active:scale-100'
            }`}
            onClick={() => setViewMode('consumed')}
          >
            <span>🍽️</span>
            <span>{consumed} kcal consumidas</span>
          </button>
          <button
            className={`min-w-0 flex-1 py-1.5 px-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center gap-1 ${
              viewMode === 'remaining'
                ? 'bg-[#3A3A3C] text-white shadow-sm scale-100'
                : 'text-[#8E8E93] hover:text-white active:scale-95 motion-reduce:active:scale-100'
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
