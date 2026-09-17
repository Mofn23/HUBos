'use client';

import React from 'react';

interface WaterTrackerProps {
  glasses: number;
  maxGlasses?: number;
  onAddGlass: () => void;
  onRemoveGlass: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  maxGlasses = 12,
  onAddGlass,
  onRemoveGlass,
}) => {
  const liters = (glasses * 0.25).toFixed(1);
  const targetLiters = (maxGlasses * 0.25).toFixed(1);

  return (
    <div className="glass-surface rounded-[28px] p-5 mb-4 border-t-white/20 shadow-lg space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">💧</span>
          <span className="text-xs font-black text-[#F5F5F7]">Hidratación Diaria</span>
        </div>
        <div className="text-xs font-black text-[#8E8E93]">
          <strong className="text-[#64D2FF] font-black">{liters}L</strong> / {targetLiters}L
        </div>
      </div>

      {/* Grid of 12 circular glasses */}
      <div className="grid grid-cols-6 gap-2 py-1">
        {Array.from({ length: maxGlasses }).map((_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              className={`h-11 rounded-2xl flex items-center justify-center text-sm transition-all duration-300 active:scale-90 ${
                isFilled
                  ? 'bg-gradient-to-br from-[#0A84FF]/30 to-[#64D2FF]/20 border border-[#64D2FF]/50 text-white shadow-[0_0_12px_rgba(100,210,255,0.35)] scale-100'
                  : 'glass-pill text-white/20 hover:border-white/20'
              }`}
              onClick={isFilled ? onRemoveGlass : onAddGlass}
              aria-label={`Vaso ${i + 1}`}
            >
              {isFilled ? '💧' : '◦'}
            </button>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-[#F5F5F7] hover:border-white/30 active:scale-90 transition-all disabled:opacity-30"
          onClick={onRemoveGlass}
          disabled={glasses <= 0}
          aria-label="Quitar vaso"
        >
          −
        </button>

        <span className="text-xs font-black text-[#8E8E93]">
          {glasses} vasos <span className="text-[#636366] font-bold">({glasses * 250} ml)</span>
        </span>

        <button
          className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-[#64D2FF] border-[#0A84FF]/30 hover:border-[#64D2FF]/50 active:scale-90 transition-all"
          onClick={onAddGlass}
          aria-label="Añadir vaso"
        >
          +
        </button>
      </div>
    </div>
  );
};
