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
      emoji: '🥩',
      consumed: protein.consumed,
      target: protein.target,
      barColor: '#FA114F',
      glowColor: 'rgba(250, 17, 79, 0.4)',
    },
    {
      key: 'carbs',
      label: 'Carbohidratos',
      emoji: '⚡',
      consumed: carbs.consumed,
      target: carbs.target,
      barColor: '#00F0FF',
      glowColor: 'rgba(0, 240, 255, 0.4)',
    },
    {
      key: 'fat',
      label: 'Grasas Saludables',
      emoji: '🥑',
      consumed: fat.consumed,
      target: fat.target,
      barColor: '#FFD60A',
      glowColor: 'rgba(255, 214, 10, 0.4)',
    },
  ];

  return (
    <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-5 mb-4 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
          Macronutrientes Diarios
        </span>
        <span className="text-[10px] font-bold text-[#8E8E93]">Meta por gramos</span>
      </div>

      <div className="space-y-3">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.consumed / Math.max(m.target, 1)) * 100));

          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-sm">{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
                <div className="text-[11px] font-black text-[#8E8E93]">
                  <strong className="text-white font-black">{m.consumed}g</strong> / {m.target}g
                  <span className="text-[10px] text-[#8E8E93] ml-1.5 font-bold">({pct}%)</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: m.barColor,
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
