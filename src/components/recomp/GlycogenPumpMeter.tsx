'use client';

import React from 'react';

interface GlycogenPumpMeterProps {
  percent: number;
}

export const GlycogenPumpMeter: React.FC<GlycogenPumpMeterProps> = ({ percent }) => {
  let label = 'Óptimo';
  let tagClass = 'tag-pill-green';

  if (percent < 35) {
    label = 'Plano';
    tagClass = 'tag-pill';
  } else if (percent >= 80) {
    label = 'Cargado';
    tagClass = 'tag-pill-green';
  }

  return (
    <div className="monai-glycogen-card">
      <div className="monai-glycogen-header">
        <div className="monai-glycogen-title-group">
          <span className="text-base">⚡</span>
          <span className="monai-glycogen-title">Pump Glucógeno</span>
          <span className={`tag-pill ${tagClass}`}>{label}</span>
        </div>
        <div className="monai-glycogen-value">{percent}%</div>
      </div>

      <div className="monai-progress-track">
        <div
          className="monai-progress-fill carbs"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
