'use client';

import React from 'react';
import { SupplementEntry } from '@/stores/useRecompStore';

interface SupplementTrackerProps {
  supplements: SupplementEntry[];
  todayKey: string;
  onToggle: (id: string) => void;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({
  supplements,
  todayKey,
  onToggle,
}) => {
  const takenCount = supplements.filter((s) => s.takenDates.includes(todayKey)).length;

  return (
    <div className="mb-4 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="glass-pill px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>💊</span>
          <span className="text-xs font-black text-[#F5F5F7]">Suplementos</span>
        </div>
        <div className="text-[11px] font-black text-[#8E8E93]">
          {takenCount} / {supplements.length} tomados
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {supplements.map((supp) => {
          const isTaken = supp.takenDates.includes(todayKey);
          return (
            <div
              key={supp.id}
              className={`glass-surface rounded-[22px] p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all border ${
                isTaken
                  ? 'border-[#34C759]/30 bg-gradient-to-r from-white/[0.06] to-[#34C759]/10'
                  : 'hover:border-white/20'
              }`}
              onClick={() => onToggle(supp.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-lg shadow-sm">
                  {supp.icon || '💊'}
                </div>

                <div>
                  <div className="text-xs font-black text-[#F5F5F7] tracking-tight">
                    {supp.name}
                  </div>
                  <div className="text-[10px] font-bold text-[#8E8E93]">
                    {supp.dosage} • {supp.timeOfDay}
                  </div>
                </div>
              </div>

              {/* Custom Liquid Glass Checkbox */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isTaken
                    ? 'bg-[#34C759] text-black shadow-[0_0_12px_#34C759]'
                    : 'glass-pill text-transparent'
                }`}
              >
                {isTaken ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
