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
    <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-[28px] p-5 mb-4 border-t-white/20 shadow-sm space-y-3.5">
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
              className={`h-11 rounded-2xl flex items-center justify-center text-sm transition-colors duration-150 motion-reduce:transition-none active:scale-90 motion-reduce:active:scale-100 ${
                isFilled
                  ? 'bg-gradient-to-br from-[#0A84FF]/30 to-[#64D2FF]/20 border border-[#64D2FF]/50 text-white  scale-100'
                  : 'bg-[#2C2C2E] border border-white/[0.08] text-white/20 hover:border-white/20'
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
          className="bg-[#2C2C2E] border border-white/[0.08] w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-[#F5F5F7] hover:border-white/30 active:scale-90 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none disabled:opacity-30"
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
          className="bg-[#2C2C2E] border border-white/[0.08] w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-[#64D2FF] border-[#0A84FF]/30 hover:border-[#64D2FF]/50 active:scale-90 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none"
          onClick={onAddGlass}
          aria-label="Añadir vaso"
        >
          +
        </button>
      </div>
    </div>
  );
};
