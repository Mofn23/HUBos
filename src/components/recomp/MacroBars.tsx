'use client';

import React from 'react';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface MacroBarsProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

export const MacroBars: React.FC<MacroBarsProps> = ({ protein, carbs, fat }) => {
  const macros = [
    {
      name: 'Proteína',
      consumed: protein.consumed,
      target: protein.target,
      color: 'bg-[#34C759]',
      textColor: 'text-[#34C759]',
      barColor: 'from-[#34C759] to-[#30D158]',
    },
    {
      name: 'Carbohidratos',
      consumed: carbs.consumed,
      target: carbs.target,
      color: 'bg-[#FF9500]',
      textColor: 'text-[#FF9500]',
      barColor: 'from-[#FF9500] to-[#FF9F0A]',
    },
    {
      name: 'Grasas',
      consumed: fat.consumed,
      target: fat.target,
      color: 'bg-[#0A84FF]',
      textColor: 'text-[#0A84FF]',
      barColor: 'from-[#0A84FF] to-[#64D2FF]',
    },
  ];

  return (
    <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
        Distribución de Macronutrientes
      </h3>

      <div className="space-y-3.5">
        {macros.map((m) => {
          const percent = Math.min(100, Math.round((m.consumed / Math.max(m.target, 1)) * 100));
          return (
            <div key={m.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#F5F5F7]">{m.name}</span>
                <span className={m.textColor}>
                  <AnimatedNumber value={m.consumed} /> / {m.target}g{' '}
                  <span className="text-[10px] text-[#8E8E93]">({percent}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#2A2A2C] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.barColor} transition-all duration-700`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
