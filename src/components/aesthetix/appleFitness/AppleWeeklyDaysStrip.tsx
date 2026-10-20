'use client';

import React from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { getDailyAesthetixActivity, getLocalDateKey } from '@/lib/aesthetixActivity';

interface AppleWeeklyDaysStripProps {
  history: WorkoutHistoryItem[];
}

export const AppleWeeklyDaysStrip: React.FC<AppleWeeklyDaysStripProps> = ({ history }) => {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index, 12);
    const dateKey = getLocalDateKey(date);
    const activity = getDailyAesthetixActivity(history, dateKey);
    return {
      dateKey,
      label: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()],
      isToday: index === 6,
      move: Math.min(activity.movementCalories / 600, 1),
      exercise: Math.min(activity.exerciseMinutes / 30, 1),
      sets: Math.min(activity.completedSets / 12, 1),
    };
  });

  return (
    <div className="fitness-card p-2 px-3 flex items-center justify-between shadow-lg border border-white/[0.08]">
      {last7Days.map((d, idx) => {
        return (
          <div
            key={d.dateKey}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-full transition-all ${
              d.isToday ? 'bg-white/[0.08] ring-1 ring-white/20' : ''
            }`}
          >
            {/* Day Letter */}
            <span
              className={`text-[10px] font-black uppercase mb-1 ${
                d.isToday ? 'text-white' : 'text-[#8E8E93]'
              }`}
            >
              {d.label}
            </span>

            {/* Mini Activity Rings SVG */}
            <svg
              className="w-5 h-5 -rotate-90"
              viewBox="0 0 32 32"
            >
              {/* Outer Ring: Move (Red) */}
              <circle
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke="rgba(250, 17, 79, 0.2)"
                strokeWidth="2.8"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke="#FA114F"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray={81.68}
                strokeDashoffset={81.68 * (1 - d.move)}
              />

              {/* Middle Ring: Exercise (Green) */}
              <circle
                cx="16"
                cy="16"
                r="9.5"
                fill="none"
                stroke="rgba(161, 245, 36, 0.2)"
                strokeWidth="2.8"
              />
              <circle
                cx="16"
                cy="16"
                r="9.5"
                fill="none"
                stroke="#A1F524"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray={59.69}
                strokeDashoffset={59.69 * (1 - d.exercise)}
              />

              {/* Inner Ring: Stand (Cyan) */}
              <circle
                cx="16"
                cy="16"
                r="6"
                fill="none"
                stroke="rgba(0, 240, 255, 0.2)"
                strokeWidth="2.8"
              />
              <circle
                cx="16"
                cy="16"
                r="6"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray={37.7}
                strokeDashoffset={37.7 * (1 - d.sets)}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
