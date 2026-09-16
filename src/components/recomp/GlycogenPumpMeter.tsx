'use client';

import React from 'react';

interface GlycogenPumpMeterProps {
  percent: number;
}

export const GlycogenPumpMeter: React.FC<GlycogenPumpMeterProps> = ({ percent }) => {
  let label = 'Óptimo';
  let badgeColor = 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30';

  if (percent < 35) {
    label = 'Plano';
    badgeColor = 'bg-white/[0.08] text-[#8E8E93] border-white/15';
  } else if (percent >= 80) {
    label = 'Cargado 🔥';
    badgeColor = 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/30 shadow-[0_0_10px_rgba(255,159,10,0.3)]';
  }

  return (
    <div className="glass-surface rounded-[24px] p-4 mb-4 border-t-white/20 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-xs font-black text-[#F5F5F7] tracking-tight">Bomba de Glucógeno</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}>
            {label}
          </span>
        </div>
        <div className="text-sm font-black text-[#F5F5F7]">{percent}%</div>
      </div>

      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF9F0A] to-[#FFD60A] transition-all duration-500 shadow-[0_0_10px_rgba(255,159,10,0.4)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
