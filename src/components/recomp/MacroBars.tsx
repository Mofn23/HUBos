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
      colorClass: 'protein',
    },
    {
      key: 'carbs',
      label: 'Carbos',
      emoji: '🍞',
      consumed: carbs.consumed,
      target: carbs.target,
      colorClass: 'carbs',
    },
    {
      key: 'fat',
      label: 'Grasas',
      emoji: '🥑',
      consumed: fat.consumed,
      target: fat.target,
      colorClass: 'fats',
    },
  ];

  return (
    <div className="monai-macrobars-card">
      <div className="monai-macrobars-list">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.consumed / Math.max(m.target, 1)) * 100));

          return (
            <div className="monai-macro-row" key={m.key}>
              <div className="monai-macro-header">
                <span className="monai-macro-title">
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </span>
                <span className="monai-macro-values">
                  <strong>{m.consumed}g</strong> / {m.target}g
                </span>
              </div>
              <div className="monai-progress-track">
                <div
                  className={`monai-progress-fill ${m.colorClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
