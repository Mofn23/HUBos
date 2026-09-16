'use client';

import React from 'react';

interface MacroBarsProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

export const MacroBars: React.FC<MacroBarsProps> = ({ protein, carbs, fat }) => {
  const macros = [
    {
      key: 'protein',
      label: 'Proteína',
      emoji: '💪',
      consumed: protein.consumed,
      target: protein.target,
      gradient: 'from-[#0A84FF] to-[#64D2FF]',
      glowColor: 'rgba(10, 132, 255, 0.4)',
    },
    {
      key: 'carbs',
      label: 'Carbohidratos',
      emoji: '🍞',
      consumed: carbs.consumed,
      target: carbs.target,
      gradient: 'from-[#FF9F0A] to-[#FFD60A]',
      glowColor: 'rgba(255, 159, 10, 0.4)',
    },
    {
      key: 'fat',
      label: 'Grasas Saludables',
      emoji: '🥑',
      consumed: fat.consumed,
      target: fat.target,
      gradient: 'from-[#BF5AF2] to-[#DA8FFF]',
      glowColor: 'rgba(191, 90, 242, 0.4)',
    },
  ];

  return (
    <div className="glass-surface rounded-[28px] p-5 mb-4 border-t-white/20 shadow-lg space-y-3.5">
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
          Macronutrientes Diarios
        </span>
        <span className="text-[10px] font-bold text-[#636366]">Meta por gramos</span>
      </div>

      <div className="space-y-3">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.consumed / Math.max(m.target, 1)) * 100));

          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5 text-[#F5F5F7]">
                  <span className="text-sm">{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] font-black text-[#8E8E93]">
                  <strong className="text-[#F5F5F7] font-black">{m.consumed}g</strong> / {m.target}g
                  <span className="text-[10px] text-[#636366] ml-1.5 font-bold">({pct}%)</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.gradient} transition-all duration-500`}
                  style={{
                    width: `${pct}%`,
                    boxShadow: `0 0 10px ${m.glowColor}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
