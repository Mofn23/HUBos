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
    return (
      new Date(`${a.dueDate} ${a.dueTime || '23:59'}`).getTime() -
      new Date(`${b.dueDate} ${b.dueTime || '23:59'}`).getTime()
    );
  });
  const closestTask = sortedPending[0];

  const isLive = nextClassStatus.type === 'live';
  const hasNext = nextClassStatus.type === 'upcoming' && nextClassStatus.subject;

  return (
    <div className="grid grid-cols-2 gap-3 relative z-10">
      {/* 1. Left Card: "Siguiente Clase" / "En Curso" (Glassmorphism Bento) */}
      <div
        onClick={() => {
          if (nextClassStatus.subject && onSelectSubject) {
            onSelectSubject(nextClassStatus.subject);
          } else {
            onOpenAddClass();
          }
        }}
        className={`glass-surface p-4 rounded-[24px] cursor-pointer active:scale-98 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[112px] group transition-all ${
          isLive
            ? 'border-[#34C759]/40 ring-1 ring-[#34C759]/30 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#34C759]/10'
            : 'hover:border-white/20'
        }`}
      >
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93]">
            {isLive ? '🔴 En Curso' : 'Siguiente Clase'}
          </span>
          {isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759] shadow-[0_0_6px_#34C759]" />
            </span>
          )}
        </div>

        {/* Content */}
        {isLive && nextClassStatus.subject && nextClassStatus.slot ? (
          <div className="space-y-1.5 my-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{nextClassStatus.subject.emoji}</span>
              <h3 className="text-xs font-black text-[#F5F5F7] tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#34C759] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#34C759]"
                style={{ width: `${nextClassStatus.progressPercent || 20}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-[#8E8E93]">
              <span className="text-[#34C759] font-black">
                Faltan {nextClassStatus.minutesRemaining}m
              </span>
              <span className="truncate max-w-[70px]">
                {nextClassStatus.slot.room || nextClassStatus.subject.shortInfo || 'En aula'}
              </span>
            </div>
          </div>
        ) : hasNext && nextClassStatus.subject && nextClassStatus.slot ? (
          <div className="space-y-0.5 my-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{nextClassStatus.subject.emoji}</span>
              <h3 className="text-xs font-black text-[#F5F5F7] tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-[#8E8E93] truncate">
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
            <span className="text-xs font-black text-[#F5F5F7] block">Sin clases</span>
            <span className="text-[10px] font-bold text-[#8E8E93] block">
              + Toca para programar
            </span>
          </div>
        )}

        {/* Bottom Status / Chevron */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-bold text-[#8E8E93]">
          <span className="truncate">{nextClassStatus.timeLabel || 'Horario'}</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-[#34C759] font-black">
            →
          </span>
        </div>
      </div>

      {/* 2. Right Card: "PENDIENTES" (Glassmorphism Bento) */}
      <div
        onClick={onOpenTasks}
        className="glass-surface p-4 rounded-[24px] hover:border-white/20 transition-all cursor-pointer active:scale-98 flex flex-col justify-between shadow-sm min-h-[112px] group relative overflow-hidden"
      >
        {/* Top Tag & Count Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93]">
            Pendientes
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md border ${
              pendingTasks.length > 0
                ? 'bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/25'
                : 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/25'
            }`}
          >
            {pendingTasks.length}
          </span>
        </div>

        {/* Content: Closest task or all clear */}
        {closestTask ? (
          <div className="space-y-0.5 my-1">
            <h3 className="text-xs font-black text-[#F5F5F7] tracking-tight truncate">
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
              Prioridad {closestTask.priority || 'media'}
            </span>
          </div>
        ) : (
          <div className="my-auto py-1">
            <span className="text-xs font-black text-[#34C759] block">Al día ✨</span>
            <span className="text-[10px] font-bold text-[#8E8E93] block">Sin tareas pendientes</span>
          </div>
        )}

        {/* Bottom Accent */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-bold text-[#8E8E93]">
          <span>Ver compromisos</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-[#34C759] font-black">
            →
          </span>
        </div>
      </div>
    </div>
  );
};
