'use client';

import React from 'react';
import { SupplementEntry } from '@/stores/useRecompStore';
import { IconCheck } from '../common/Icons';

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
  return (
    <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Suplementos Diarios
        </h3>
        <span className="text-[11px] font-bold text-[#34C759]">
          {supplements.filter((s) => s.takenDates.includes(todayKey)).length} / {supplements.length} tomados
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {supplements.map((supp) => {
          const isTaken = supp.takenDates.includes(todayKey);
          return (
            <div
              key={supp.id}
              onClick={() => onToggle(supp.id)}
              className={`p-3 rounded-2xl border cursor-pointer active:scale-95 transition-all flex items-center justify-between ${
                isTaken
                  ? 'bg-[#34C759]/10 border-[#34C759]/40 text-[#F5F5F7]'
                  : 'bg-[#242426] border-white/5 text-[#8E8E93]'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg shrink-0">{supp.icon}</span>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-[#F5F5F7]">{supp.name}</p>
                  <p className="text-[10px] text-[#8E8E93] truncate">{supp.dosage}</p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isTaken ? 'bg-[#34C759] text-black font-bold' : 'border border-white/20'
                }`}
              >
                {isTaken && <IconCheck className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
