'use client';

import React from 'react';
import { SupplementEntry } from '@/stores/useRecompStore';

interface SupplementTrackerProps {
  supplements: SupplementEntry[];
  todayKey: string;
  onToggle: (id: string) => void;
}

export const SupplementTracker: React.FC<SupplementTrackerProps> = ({
  supplements,
  todayKey,
  onToggle,
}) => {
  const takenCount = supplements.filter((s) => s.takenDates.includes(todayKey)).length;

  return (
    <div className="mb-4">
      {/* MonAI List Header */}
      <div className="monai-list-header">
        <div className="monai-list-header-pill">
          <span>💊 Suplementos</span>
        </div>
        <div className="monai-list-header-total">
          {takenCount} / {supplements.length} tomados
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {supplements.map((supp) => {
          const isTaken = supp.takenDates.includes(todayKey);
          return (
            <div
              key={supp.id}
              className="monai-settings-row cursor-pointer"
              onClick={() => onToggle(supp.id)}
            >
              <div className="monai-settings-icon">{supp.icon || '💊'}</div>

              <div className="monai-settings-col">
                <div className="monai-settings-title">{supp.name}</div>
                <div className="monai-settings-sub">
                  {supp.dosage} • {supp.timeOfDay}
                </div>
              </div>

              <div className="monai-settings-control" onClick={(e) => e.stopPropagation()}>
                <label className="monai-toggle-switch">
                  <input
                    type="checkbox"
                    checked={isTaken}
                    onChange={() => onToggle(supp.id)}
                  />
                  <span className="monai-toggle-slider" />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
