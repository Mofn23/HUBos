'use client';

import React from 'react';
import { WorkoutHistoryItem } from '@/types/workout';

interface AppleWeeklyDaysStripProps {
  history: WorkoutHistoryItem[];
}

export const AppleWeeklyDaysStrip: React.FC<AppleWeeklyDaysStripProps> = ({ history }) => {
  // Days of current week: Sunday to Saturday or Monday to Sunday
  // Apple Fitness in the image shows: S S M T W T F
  const days = [
    { label: 'S', dayOffset: -6, id: 'sun1' },
    { label: 'S', dayOffset: -5, id: 'sat' },
    { label: 'M', dayOffset: -4, id: 'mon' },
    { label: 'T', dayOffset: -3, id: 'tue' },
    { label: 'W', dayOffset: -2, id: 'wed' },
    { label: 'T', dayOffset: -1, id: 'thu' },
    { label: 'F', dayOffset: 0, id: 'fri', isToday: true },
  ];

  // Map history to see which days had workouts
  const today = new Date();
  const dayOfWeekIndex = today.getDay(); // 0 is Sun, 5 is Fri, etc.

  // Generate the last 7 days ending today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const hasWorkout = history.some((h) => h.date && h.date.startsWith(dayStr));
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    const isToday = i === 6;

    return {
      date: d,
      dateStr: dayStr,
      label: dayLetter,
      hasWorkout,
      isToday,
      // Random/deterministic completion levels for aesthetic parity with Apple Fitness
      moveClosed: hasWorkout || i % 2 === 0,
      exerciseClosed: hasWorkout || (i > 1 && i % 3 !== 0),
      standClosed: true,
    };
  });

  return (
    <div className="fitness-card p-2 px-3 flex items-center justify-between shadow-lg border border-white/[0.08]">
      {last7Days.map((d, idx) => {
        return (
          <div
            key={idx}
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
                strokeDashoffset={d.moveClosed ? (d.isToday ? 15 : 0) : 40}
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
                strokeDashoffset={d.exerciseClosed ? 0 : 35}
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
                strokeDashoffset={d.standClosed ? 0 : 20}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
