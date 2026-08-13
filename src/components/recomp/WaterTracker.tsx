'use client';

import React from 'react';

interface WaterTrackerProps {
  glasses: number;
  maxGlasses?: number;
  onAddGlass: () => void;
  onRemoveGlass: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  maxGlasses = 12,
  onAddGlass,
  onRemoveGlass,
}) => {
  const liters = (glasses * 0.25).toFixed(1);
  const targetLiters = (maxGlasses * 0.25).toFixed(1);

  return (
    <div className="monai-water-card">
      <div className="monai-water-header">
        <div className="monai-water-title">
          <span>💧</span>
          <span>Hidratación</span>
        </div>
        <div className="monai-water-count">
          <strong>{liters}L</strong> / {targetLiters}L
        </div>
      </div>

      {/* Grid of 12 circular glasses (2 rows of 6) */}
      <div className="monai-water-circles-grid">
        {Array.from({ length: maxGlasses }).map((_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              className={`monai-water-circle ${isFilled ? 'filled' : ''}`}
              onClick={isFilled ? onRemoveGlass : onAddGlass}
              aria-label={`Vaso ${i + 1}`}
            >
              {isFilled ? '💧' : ''}
            </button>
          );
        })}
      </div>

      <div className="monai-water-actions">
        <button
          className="monai-water-btn"
          onClick={onRemoveGlass}
          disabled={glasses <= 0}
          aria-label="Quitar vaso"
        >
          −
        </button>
        <span className="monai-water-subtitle">
          {glasses} vasos ({glasses * 250}ml)
        </span>
        <button
          className="monai-water-btn"
          onClick={onAddGlass}
          aria-label="Añadir vaso"
        >
          +
        </button>
      </div>
    </div>
  );
};
