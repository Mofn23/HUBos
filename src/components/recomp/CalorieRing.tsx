'use client';

import React from 'react';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface CalorieRingProps {
  consumed: number;
  target: number;
  difference: number;
  status: 'optimal' | 'deficit' | 'surplus';
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  difference,
  status,
}) => {
  const radius = 72;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const percentage = Math.min(100, Math.round((consumed / Math.max(target, 1)) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const statusLabel =
    status === 'optimal'
      ? 'Objetivo Óptimo'
      : status === 'deficit'
      ? `Déficit (${Math.abs(difference)} kcal)`
      : `Superávit (+${Math.abs(difference)} kcal)`;

  const statusColor =
    status === 'optimal'
      ? 'text-[#34C759]'
      : status === 'deficit'
      ? 'text-[#0A84FF]'
      : 'text-[#FF9500]';

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-[32px] bg-[#1C1C1E] border border-white/10 shadow-xl relative">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress */}
          <circle
            stroke="url(#calorieGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34C759" />
              <stop offset="100%" stopColor="#0A84FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Numbers */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-[#F5F5F7] tracking-tight">
            <AnimatedNumber value={consumed} />
          </span>
          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
            de {target} kcal
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`text-xs font-bold ${statusColor} tracking-tight`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
};
