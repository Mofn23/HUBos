'use client';

import React from 'react';
import { IconDroplets, IconPlus } from '../common/Icons';

interface WaterTrackerProps {
  glasses: number;
  targetGlasses: number;
  onAddGlass: () => void;
  onRemoveGlass: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  targetGlasses,
  onAddGlass,
  onRemoveGlass,
}) => {
  const liters = (glasses * 0.25).toFixed(1);
  const targetLiters = (targetGlasses * 0.25).toFixed(1);

  return (
    <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
          <IconDroplets className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#F5F5F7]">Registro de Agua</p>
          <p className="text-[11px] text-[#8E8E93]">
            {glasses} de {targetGlasses} vasos ({liters}L / {targetLiters}L)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onRemoveGlass}
          disabled={glasses <= 0}
          className="w-8 h-8 rounded-full bg-[#2A2A2C] text-[#F5F5F7] font-bold text-sm flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
        >
          -
        </button>
        <button
          onClick={onAddGlass}
          className="w-8 h-8 rounded-full bg-[#0A84FF] text-white font-bold text-sm flex items-center justify-center hover:bg-[#0A84FF]/80 active:scale-90 transition-all shadow-md"
        >
          <IconPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
