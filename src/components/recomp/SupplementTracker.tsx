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
        <div className="bg-[#1C1C1E] border border-white/[0.08] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>💊</span>
          <span className="text-xs font-black text-white">Suplementos</span>
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
              className={`rounded-2xl p-3.5 flex items-center justify-between cursor-pointer fitness-press transition-all border ${
                isTaken
                  ? 'bg-[#242426] border-[#A1F524]/40'
                  : 'bg-[#1C1C1E] border-white/[0.08] hover:border-white/20'
              }`}
              onClick={() => onToggle(supp.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-lg shadow-sm">
                  {supp.icon || '💊'}
                </div>

                <div>
                  <div className="text-xs font-black text-white tracking-tight">
                    {supp.name}
                  </div>
                  <div className="text-[10px] font-bold text-[#8E8E93]">
                    {supp.dosage} • {supp.timeOfDay}
                  </div>
                </div>
              </div>

              {/* Apple Fitness Circular Checkbox */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isTaken
                    ? 'bg-[#A1F524] text-black shadow-[0_0_10px_#A1F524]'
                    : 'bg-[#2C2C2E] border border-white/10 text-transparent'
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
