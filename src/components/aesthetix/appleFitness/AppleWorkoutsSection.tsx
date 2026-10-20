'use client';

import React from 'react';
import { WorkoutHistoryItem, WorkoutRoutine, ActiveWorkoutSession } from '@/types/workout';

interface AppleWorkoutsSectionProps {
  history: WorkoutHistoryItem[];
  activeRoutine?: WorkoutRoutine;
  activeSession: ActiveWorkoutSession | null;
  onStartSession: (routineId?: string, dayIndex?: number) => void;
  onOpenLiveWorkout: () => void;
  onSelectSessionDetail: (session: WorkoutHistoryItem) => void;
  onShowAllWorkouts: () => void;
}

export const AppleWorkoutsSection: React.FC<AppleWorkoutsSectionProps> = ({
  history,
  activeRoutine,
  activeSession,
  onStartSession,
  onOpenLiveWorkout,
  onSelectSessionDetail,
  onShowAllWorkouts,
}) => {
  // If activeSession is in progress, show glowing quick action
  const currentDay = activeRoutine?.days[0];

  // Pick the top 3-4 sessions from history, or fallback mock items matching Apple Fitness
  const displayItems = history.length > 0
    ? history.slice(0, 4).map((h, i) => {
        const isRunOrLegs = h.dayName?.toLowerCase().includes('leg') || h.dayName?.toLowerCase().includes('pierna');
        const isHIITorPush = h.dayName?.toLowerCase().includes('push') || h.dayName?.toLowerCase().includes('pecho');
        
        const themeColor = isRunOrLegs ? '#A1F524' : isHIITorPush ? '#FA114F' : '#00F0FF';
        const icon = isRunOrLegs ? '🏃' : isHIITorPush ? '⚡' : '🏋️';

        const min = h.durationMinutes || 40;

        return {
          id: h.id,
          title: h.dayName || 'Gym Workout',
          metric: `${(h.totalVolumeKg || 0).toLocaleString()} KG`,
          timeStr: `${min}:00`,
          dateLabel: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : 'Recent',
          color: themeColor,
          icon,
          hasAward: true,
          rawItem: h,
        };
      })
    : [
        {
          id: 'mock-1',
          title: 'Outdoor Run',
          metric: '7.24 KM',
          timeStr: '42:15',
          dateLabel: 'Today',
          color: '#A1F524',
          icon: '🏃',
          hasAward: true,
          rawItem: null,
        },
        {
          id: 'mock-2',
          title: 'HIIT & Core',
          metric: '308 CAL',
          timeStr: '28:00',
          dateLabel: 'Yesterday',
          color: '#FA114F',
          icon: '⚡',
          hasAward: false,
          rawItem: null,
        },
        {
          id: 'mock-3',
          title: 'Outdoor Cycle',
          metric: '32.60 KM',
          timeStr: '1:12:00',
          dateLabel: 'Wednesday',
          color: '#00F0FF',
          icon: '🚴',
          hasAward: true,
          rawItem: null,
        },
      ];

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-black text-white tracking-tight">Workouts</h3>
        <button
          onClick={onShowAllWorkouts}
          className="text-xs font-black text-[#A1F524] hover:underline transition-all"
        >
          Show All
        </button>
      </div>

      {/* 1. Live Session in progress Banner (if any) */}
      {activeSession ? (
        <div
          onClick={onOpenLiveWorkout}
          className="fitness-card p-4 border border-[#FA114F]/40 bg-[#FA114F]/10 flex items-center justify-between cursor-pointer fitness-press shadow-[0_0_24px_rgba(250,17,79,0.25)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FA114F] flex items-center justify-center text-white shadow-md animate-pulse">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FA114F]">
                  ENTRENAMIENTO EN VIVO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FA114F] animate-ping" />
              </div>
              <div className="text-base font-black text-white">
                {activeSession.dayName || 'Sesión Activa'}
              </div>
            </div>
          </div>
          <button className="px-3.5 py-1.5 rounded-full bg-[#FA114F] text-white text-xs font-black shadow-lg">
            Reanudar
          </button>
        </div>
      ) : currentDay ? (
        /* Quick Start Today's Routine Banner */
        <div className="fitness-card p-4 border border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-white/[0.04] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A1F524]/15 border border-[#A1F524]/30 flex items-center justify-center text-[#A1F524] shadow-md">
              <span className="text-lg">🏋️</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                HOY TOCA
              </div>
              <div className="text-sm font-black text-white">{currentDay.dayName}</div>
            </div>
          </div>
          <button
            onClick={() => onStartSession(activeRoutine?.id, 0)}
            className="px-4 py-2 rounded-full bg-[#A1F524] text-black text-xs font-black fitness-press shadow-[0_0_16px_rgba(161,245,36,0.35)] flex items-center gap-1.5"
          >
            <span>▶</span>
            <span>Iniciar</span>
          </button>
        </div>
      ) : null}

      {/* Workout Items List (Apple Fitness 1:1) */}
      <div className="space-y-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.rawItem) {
                onSelectSessionDetail(item.rawItem);
              }
            }}
            className="fitness-card p-3.5 flex items-center justify-between border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer fitness-press"
          >
            <div className="flex items-center gap-3.5">
              {/* Colored Circular Icon */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 shadow-md"
                style={{
                  backgroundColor: `${item.color}22`,
                  border: `1px solid ${item.color}44`,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              {/* Title & Metric */}
              <div>
                <div className="text-sm font-black text-white leading-tight">
                  {item.title}
                </div>
                <div
                  className="text-xs font-black tracking-tight mt-0.5"
                  style={{ color: item.color }}
                >
                  {item.metric}
                </div>
              </div>
            </div>

            {/* Right: Date label & Award Medal */}
            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-white">{item.dateLabel}</div>
                {item.timeStr && (
                  <div className="text-[10px] font-bold text-[#8E8E93]">
                    {item.timeStr}
                  </div>
                )}
              </div>

              {item.hasAward && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm"
                  title="Personal Record / Completed"
                >
                  🎖️
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
