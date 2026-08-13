'use client';

import React, { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState<'remaining' | 'consumed'>('remaining');

  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  const statusLabel =
    status === 'optimal'
      ? 'Óptimo'
      : status === 'deficit'
      ? 'Déficit'
      : 'Superávit';

  const statusClass =
    status === 'optimal'
      ? 'tag-pill-green'
      : status === 'deficit'
      ? 'tag-pill'
      : 'tag-pill-coral';

  const displayNum = viewMode === 'remaining' ? (isOver ? consumed - target : remaining) : consumed;

  return (
    <div className="flex flex-col items-center mb-3">
      {/* MonAI TotalBlock */}
      <div className="monai-total-block">
        <span className="monai-total-label">
          {viewMode === 'remaining'
            ? isOver
              ? 'Calorías Excedidas'
              : 'CALORÍAS RESTANTES'
            : 'Calorías Consumidas'}
        </span>

        <div className="monai-total-row">
          <div className={`monai-total-badge ${isOver ? 'negative' : 'positive'}`}>
            {isOver ? '−' : '+'}
          </div>
          <span className="monai-total-number">
            <AnimatedNumber value={displayNum} />
          </span>
          <span className="monai-total-suffix">kcal</span>
        </div>

        <div className="monai-total-status-wrapper">
          <span className={`tag-pill ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>

      {/* SegmentedPill MonAI Dual Selector */}
      <div className="monai-segmented-pill">
        <button
          className={`monai-segmented-item ${viewMode === 'consumed' ? 'active' : ''}`}
          onClick={() => setViewMode('consumed')}
        >
          <span>⊝</span>
          <span>{consumed} kcal consumidas</span>
        </button>
        <button
          className={`monai-segmented-item ${viewMode === 'remaining' ? 'active' : ''}`}
          onClick={() => setViewMode('remaining')}
        >
          <span>⊝</span>
          <span>Meta {target} kcal</span>
        </button>
      </div>
    </div>
  );
};
