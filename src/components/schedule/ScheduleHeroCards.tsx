'use client';

import React from 'react';
import { SubjectItem, TaskItem } from '@/stores/useScheduleStore';
import { NextClassStatus } from '@/lib/scheduleNotifications';

interface ScheduleHeroCardsProps {
  nextClassStatus: NextClassStatus;
  tasks: TaskItem[];
  onOpenTasks: () => void;
  onSelectSubject?: (subject: SubjectItem) => void;
  onOpenAddClass: () => void;
}

export const ScheduleHeroCards: React.FC<ScheduleHeroCardsProps> = ({
  nextClassStatus,
  tasks,
  onOpenTasks,
  onSelectSubject,
  onOpenAddClass,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  // Sort pending tasks by due date (closest first)
  const sortedPending = [...pendingTasks].sort((a, b) => {
    return new Date(`${a.dueDate} ${a.dueTime || '23:59'}`).getTime() -
      new Date(`${b.dueDate} ${b.dueTime || '23:59'}`).getTime();
  });
  const closestTask = sortedPending[0];

  const isLive = nextClassStatus.type === 'live';
  const hasNext = nextClassStatus.type === 'upcoming' && nextClassStatus.subject;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Left Pill: "Siguiente Clase" (Directly matches sketch) */}
      <div
        onClick={() => {
          if (nextClassStatus.subject && onSelectSubject) {
            onSelectSubject(nextClassStatus.subject);
          } else {
            onOpenAddClass();
          }
        }}
        className={`p-4 rounded-[26px] bg-[#1C1C1E] border transition-all cursor-pointer active:scale-98 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[110px] group ${
          isLive
            ? 'border-[#34C759]/40 ring-1 ring-[#34C759]/30 bg-gradient-to-b from-[#1C1C1E] to-[#1E2E20]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            {isLive ? '🔴 En Curso' : 'Siguiente Clase'}
          </span>
          {isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
            </span>
          )}
        </div>

        {/* Content */}
        {isLive && nextClassStatus.subject && nextClassStatus.slot ? (
          <div className="space-y-1.5 my-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{nextClassStatus.subject.emoji}</span>
              <h3 className="text-sm font-black text-[#F5F5F7] tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>
            
            {/* Live Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#34C759] h-full rounded-full transition-all duration-500"
                style={{ width: `${nextClassStatus.progressPercent || 20}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-[#8E8E93]">
              <span className="text-[#34C759]">Faltan {nextClassStatus.minutesRemaining}m</span>
              <span className="truncate max-w-[80px]">
                {nextClassStatus.slot.room || nextClassStatus.subject.shortInfo || 'En aula'}
              </span>
            </div>
          </div>
        ) : hasNext && nextClassStatus.subject && nextClassStatus.slot ? (
          <div className="space-y-0.5 my-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{nextClassStatus.subject.emoji}</span>
              <h3 className="text-sm font-black text-[#F5F5F7] tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>
            <p className="text-[11px] font-bold text-[#8E8E93] truncate">
              {nextClassStatus.relativeDayLabel} {nextClassStatus.slot.startHour} •{' '}
              {nextClassStatus.slot.room || nextClassStatus.subject.shortInfo || 'Sin aula'}
            </p>
            {nextClassStatus.minutesRemaining && nextClassStatus.minutesRemaining <= 120 && (
              <span className="text-[10px] font-black text-[#FF9500] block">
                En {nextClassStatus.minutesRemaining} min
              </span>
            )}
          </div>
        ) : (
          <div className="my-auto py-1">
            <span className="text-sm font-black text-[#F5F5F7] block">Sin clases</span>
            <span className="text-[10px] font-bold text-[#8E8E93] block">
              + Toca para programar
            </span>
          </div>
        )}

        {/* Bottom Accent */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-bold text-[#8E8E93]">
          <span>{nextClassStatus.timeLabel || 'Horario'}</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-[#34C759]">→</span>
        </div>
      </div>

      {/* 2. Right Pill: "PENDIENTES" (Directly matches sketch) */}
      <div
        onClick={onOpenTasks}
        className="p-4 rounded-[26px] bg-[#1C1C1E] border border-white/5 hover:border-white/10 transition-all cursor-pointer active:scale-98 flex flex-col justify-between shadow-sm min-h-[110px] group"
      >
        {/* Top Tag & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            Pendientes
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              pendingTasks.length > 0
                ? 'bg-[#FF9500]/20 text-[#FF9500]'
                : 'bg-[#34C759]/20 text-[#34C759]'
            }`}
          >
            {pendingTasks.length}
          </span>
        </div>

        {/* Content: Closest task or all clear */}
        {closestTask ? (
          <div className="space-y-0.5 my-1">
            <h3 className="text-sm font-black text-[#F5F5F7] tracking-tight truncate">
              {closestTask.title}
            </h3>
            <p className="text-[10px] font-bold text-[#8E8E93] truncate">
              {closestTask.dueDate ? `Entrega: ${closestTask.dueDate}` : 'Sin fecha límite'}
            </p>
            <span
              className={`text-[9px] font-black uppercase tracking-wider ${
                closestTask.priority === 'high'
                  ? 'text-[#FF453A]'
                  : closestTask.priority === 'medium'
                  ? 'text-[#FF9500]'
                  : 'text-[#34C759]'
              }`}
            >
              Prioridad {closestTask.priority}
            </span>
          </div>
        ) : (
          <div className="my-auto py-1">
            <span className="text-sm font-black text-[#F5F5F7] block">¡Todo al día! ✨</span>
            <span className="text-[10px] font-bold text-[#8E8E93] block">
              Sin entregas pendientes
            </span>
          </div>
        )}

        {/* Bottom Interactive Prompt */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-bold text-[#8E8E93]">
          <span className="text-[#8E8E93]">Ver lista interactiva</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-[#34C759]">→</span>
        </div>
      </div>
    </div>
  );
};
