'use client';

import React from 'react';
import { WorkoutHistoryItem, WorkoutRoutine, ActiveWorkoutSession } from '@/types/workout';
import { formatShortDateSpanish } from '@/lib/date';

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

  // Show only sessions the user has saved.
  const displayItems = history.slice(0, 4).map((h) => {
        const isRunOrLegs = h.dayName?.toLowerCase().includes('leg') || h.dayName?.toLowerCase().includes('pierna');
        const isHIITorPush = h.dayName?.toLowerCase().includes('push') || h.dayName?.toLowerCase().includes('pecho');
        
        const themeColor = isRunOrLegs ? '#A1F524' : isHIITorPush ? '#FA114F' : '#00F0FF';
        const icon = isRunOrLegs ? '🏃' : isHIITorPush ? '⚡' : '🏋️';

        return {
          id: h.id,
          title: h.dayName || 'Entrenamiento',
          metric: `${(h.totalVolumeKg || 0).toLocaleString('es-CO')} kg`,
          timeStr: h.durationMinutes > 0 ? `${h.durationMinutes} min` : '',
          dateLabel: formatShortDateSpanish(h.date),
          color: themeColor,
          icon,
          hasAward: h.prCount > 0,
          rawItem: h,
        };
      });

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-black text-white tracking-tight">Entrenamientos</h3>
        <button
          onClick={onShowAllWorkouts}
          className="text-xs font-black text-[#A1F524] hover:underline transition-all"
        >
          Ver todos
        </button>
      </div>

      {/* 1. Live Session in progress Banner (if any) */}
      {activeSession ? (
        <div
          onClick={onOpenLiveWorkout}
          className="fitness-card p-4 border border-[#FA114F]/40 bg-[#FA114F]/10 flex items-center justify-between cursor-pointer fitness-press shadow-[0_0_24px_rgba(250,17,79,0.25)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FA114F] flex items-center justify-center text-white shadow-md ">
              <span className="w-3 h-3 rounded-full bg-white " />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FA114F]">
                  ENTRENAMIENTO EN VIVO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FA114F] " />
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

      {/* Historial guardado */}
      {displayItems.length === 0 ? (
        <div className="fitness-card p-5 border border-white/[0.08] text-center">
          <div className="text-2xl mb-2">🏋️</div>
          <p className="text-sm font-bold text-white">Aún no hay entrenamientos registrados</p>
          <p className="mt-1 text-xs text-[#8E8E93]">Cuando guardes tu primera sesión, aparecerá aquí.</p>
        </div>
      ) : (
      <div className="space-y-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onSelectSessionDetail(item.rawItem)
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
                  {item.rawItem.totalVolumeKg > 0 ? item.metric : `${item.rawItem.totalSets} series`}
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
      )}
    </div>
  );
};
