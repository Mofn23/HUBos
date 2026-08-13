'use client';

import React from 'react';
import { IconFlame } from '../common/Icons';

interface GlycogenPumpMeterProps {
  percent: number;
}

export const GlycogenPumpMeter: React.FC<GlycogenPumpMeterProps> = ({ percent }) => {
  let statusText = 'Nivel Bajo';
  let statusColor = 'text-[#8E8E93]';
  if (percent >= 80) {
    statusText = '🔥 Pump & Glucógeno Óptimo';
    statusColor = 'text-[#34C759]';
  } else if (percent >= 50) {
    statusText = '⚡ Repleción Moderada';
    statusColor = 'text-[#FF9500]';
  }

  return (
    <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF9500]/15 border border-[#FF9500]/30 flex items-center justify-center text-[#FF9500]">
          <IconFlame className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#F5F5F7]">Medidor de Glucógeno & Pump</p>
          <p className={`text-[11px] font-semibold ${statusColor}`}>{statusText}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-20 h-2 rounded-full bg-[#2A2A2C] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF9500] to-[#34C759] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs font-black text-[#F5F5F7] min-w-[36px] text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
};
