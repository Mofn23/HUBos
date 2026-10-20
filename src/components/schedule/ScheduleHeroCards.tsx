'use client';

import React from 'react';
import { SubjectItem, TaskItem } from '@/stores/useScheduleStore';
import { NextClassStatus } from '@/lib/scheduleNotifications';
import { IconChevronRight } from '../common/Icons';

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
      {/* 1. Left Card: "Siguiente Clase" / "En Curso" (Apple Bento) */}
      <div
        onClick={() => {
          if (nextClassStatus.subject && onSelectSubject) {
            onSelectSubject(nextClassStatus.subject);
          } else {
            onOpenAddClass();
          }
        }}
        className={`fitness-card p-4 rounded-3xl cursor-pointer active:scale-95 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[116px] group transition-all fitness-press ${
          isLive
            ? 'border-[#FA114F]/50 ring-1 ring-[#FA114F]/30 bg-gradient-to-br from-[#FA114F]/10 via-[#1C1C1E] to-[#1C1C1E]'
            : 'border border-white/[0.08] hover:border-white/20'
        }`}
      >
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
            {isLive ? '🔴 En Curso' : 'Siguiente Clase'}
          </span>
          {isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA114F] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FA114F] shadow-[0_0_6px_#FA114F]" />
            </span>
          )}
        </div>

        {/* Content */}
        {isLive && nextClassStatus.subject && nextClassStatus.slot ? (
          <div className="space-y-1.5 my-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{nextClassStatus.subject.emoji}</span>
              <h3 className="text-xs font-bold text-white tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full bg-[#2C2C2E] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#A1F524] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#A1F524]"
                style={{ width: `${nextClassStatus.progressPercent || 20}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-semibold text-[#8E8E93]">
              <span className="text-[#A1F524] font-bold">
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
              <h3 className="text-xs font-bold text-white tracking-tight truncate">
                {nextClassStatus.subject.name}
              </h3>
            </div>
            <p className="text-[10px] text-[#8E8E93] truncate font-medium">
              {nextClassStatus.relativeDayLabel} {nextClassStatus.slot.startHour} •{' '}
              {nextClassStatus.slot.room || nextClassStatus.subject.shortInfo || 'Sin aula'}
            </p>
            {nextClassStatus.minutesRemaining && nextClassStatus.minutesRemaining <= 120 && (
              <span className="text-[10px] font-bold text-[#FFD60A] block">
                En {nextClassStatus.minutesRemaining} min
              </span>
            )}
          </div>
        ) : (
          <div className="my-auto py-1">
            <span className="text-xs font-bold text-white block">Sin clases</span>
            <span className="text-[10px] font-semibold text-[#8E8E93] block">
              + Toca para programar
            </span>
          </div>
        )}

        {/* Bottom Status / Chevron */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-semibold text-[#8E8E93]">
          <span className="truncate">{nextClassStatus.timeLabel || 'Horario'}</span>
          <IconChevronRight className="w-3.5 h-3.5 text-[#00F0FF] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. Right Card: "PENDIENTES" (Apple Bento) */}
      <div
        onClick={onOpenTasks}
        className="fitness-card p-4 rounded-3xl hover:border-white/20 transition-all cursor-pointer active:scale-95 flex flex-col justify-between shadow-sm min-h-[116px] group relative overflow-hidden border border-white/[0.08] fitness-press"
      >
        {/* Top Tag & Count Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
            Pendientes
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              pendingTasks.length > 0
                ? 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                : 'bg-[#A1F524]/15 text-[#A1F524] border border-[#A1F524]/30'
            }`}
          >
            {pendingTasks.length}
          </span>
        </div>

        {/* Content: Closest task or all clear */}
        {closestTask ? (
          <div className="space-y-0.5 my-1">
            <h3 className="text-xs font-bold text-white tracking-tight truncate">
              {closestTask.title}
            </h3>
            <p className="text-[10px] text-[#8E8E93] truncate font-medium">
              {closestTask.dueDate ? `Entrega: ${closestTask.dueDate}` : 'Sin fecha límite'}
            </p>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                closestTask.priority === 'high'
                  ? 'text-[#FA114F]'
                  : closestTask.priority === 'medium'
                  ? 'text-[#FFD60A]'
                  : 'text-[#A1F524]'
              }`}
            >
              Prioridad {closestTask.priority || 'media'}
            </span>
          </div>
        ) : (
          <div className="my-auto py-1">
            <span className="text-xs font-bold text-[#A1F524] block">Al día ✨</span>
            <span className="text-[10px] text-[#8E8E93] block font-medium">Sin tareas pendientes</span>
          </div>
        )}

        {/* Bottom Accent */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-semibold text-[#8E8E93]">
          <span>Ver compromisos</span>
          <IconChevronRight className="w-3.5 h-3.5 text-[#00F0FF] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
