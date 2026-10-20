'use client';

import React from 'react';

interface GlycogenPumpMeterProps {
  percent: number;
}

export const GlycogenPumpMeter: React.FC<GlycogenPumpMeterProps> = ({ percent }) => {
  let label = 'Óptimo';
  let badgeColor = 'bg-[#A1F524]/15 text-[#A1F524] border-[#A1F524]/30';

  if (percent < 35) {
    label = 'Plano';
    badgeColor = 'bg-[#2C2C2E] text-[#8E8E93] border-white/5';
  } else if (percent >= 80) {
    label = 'Cargado 🔥';
    badgeColor = 'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30 shadow-[0_0_10px_rgba(255,214,10,0.3)]';
  }

  return (
    <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-4 mb-4 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-xs font-black text-white tracking-tight">Bomba de Glucógeno</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}>
            {label}
          </span>
        </div>
        <div className="text-sm font-black text-white">{percent}%</div>
      </div>

      <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FFD60A] to-[#A1F524] transition-all duration-500 shadow-[0_0_10px_rgba(161,245,36,0.3)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
