'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SubjectItem, ClassSlot } from '@/stores/useScheduleStore';
import { getIsoDayOfWeek, getCurrentTimeMinutes } from '@/lib/scheduleNotifications';

interface ScheduleGridProps {
  subjects: SubjectItem[];
  onSelectSubject: (subject: SubjectItem, slot?: ClassSlot) => void;
  onSlotClick?: (dayOfWeek: number, hour: number) => void;
}

const DAYS = [
  { id: 1, name: 'Lunes', short: 'LUN' },
  { id: 2, name: 'Martes', short: 'MAR' },
  { id: 3, name: 'Miércoles', short: 'MIÉ' },
  { id: 4, name: 'Jueves', short: 'JUE' },
  { id: 5, name: 'Viernes', short: 'VIE' },
  { id: 6, name: 'Sábado', short: 'SÁB' },
  { id: 7, name: 'Domingo', short: 'DOM' },
];

const START_HOUR = 6; // 6:00 AM
const END_HOUR = 22; // 10:00 PM
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const HOUR_HEIGHT = 74; // px per hour slot
const DAY_COL_WIDTH = 138; // px per day column in week view

function formatHourLabel(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  subjects,
  onSelectSubject,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentDay = getIsoDayOfWeek(now);
  const currentMins = getCurrentTimeMinutes(now);
  const currentHourFloat = currentMins / 60;

  // View Mode: 'day' (Mobile Timeline Flotante) or 'week' (Matriz Panorámica Flotante)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  // Auto-scroll in Week View
  useEffect(() => {
    if (viewMode !== 'week' || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    const targetDayIndex = selectedDay - 1;
    const horizontalScroll = Math.max(0, targetDayIndex * DAY_COL_WIDTH - 20);
    const targetHourOffset = Math.max(0, currentHourFloat - START_HOUR - 1);
    const verticalScroll = Math.max(0, targetHourOffset * HOUR_HEIGHT);

    container.scrollTo({
      left: horizontalScroll,
      top: verticalScroll,
      behavior: 'smooth',
    });
  }, [viewMode, selectedDay, currentHourFloat]);

  // Is current time within display range?
  const isNowInRange = currentHourFloat >= START_HOUR && currentHourFloat <= END_HOUR + 1;
  const currentIndicatorTop = (currentHourFloat - START_HOUR) * HOUR_HEIGHT;

  // Map slots to days for quick rendering
  const slotsByDay: Record<number, { subject: SubjectItem; slot: ClassSlot }[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
  };

  subjects.forEach((subj) => {
    subj.slots.forEach((slot) => {
      if (slotsByDay[slot.dayOfWeek]) {
        slotsByDay[slot.dayOfWeek].push({ subject: subj, slot });
      }
    });
  });

  // Current day slots sorted by start hour
  const selectedDaySlots = [...(slotsByDay[selectedDay] || [])].sort((a, b) => {
    return a.slot.startHour.localeCompare(b.slot.startHour);
  });

  const selectedDayMeta = DAYS.find((d) => d.id === selectedDay) || DAYS[0];

  return (
    <div className="flex-1 flex flex-col rounded-3xl fitness-card overflow-hidden relative shadow-2xl z-10 border border-white/[0.08] bg-[#1C1C1E]">
      {/* 1. Header Bar: Floating Day Pills & View Mode Switcher */}
      <div className="p-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-2xl space-y-2.5">
        {/* Top Control: View Mode Segmented Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
              {viewMode === 'day' ? `Cronograma • ${selectedDayMeta.name}` : 'Horario Semanal'}
            </span>
            {selectedDay === currentDay && (
              <span className="px-2 py-0.5 rounded-full bg-[#A1F524]/15 text-[#A1F524] text-[10px] font-bold border border-[#A1F524]/30">
                Hoy
              </span>
            )}
          </div>

          {/* Mode Switcher Segmented Pill */}
          <div className="bg-[#2C2C2E] p-0.5 rounded-full flex items-center shadow-inner">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 fitness-press ${
                viewMode === 'day'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <span>📋</span>
              <span>Día</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 fitness-press ${
                viewMode === 'week'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <span>🗓️</span>
              <span>Semana</span>
            </button>
          </div>
        </div>

        {/* Floating Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {DAYS.map((day) => {
            const isSelected = day.id === selectedDay;
            const isToday = day.id === currentDay;
            const dayClassCount = (slotsByDay[day.id] || []).length;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center min-w-[50px] relative group fitness-press ${
                  isSelected
                    ? 'bg-white text-black shadow-md scale-105'
                    : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold tracking-wider">{day.short}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A1F524] shadow-[0_0_6px_#A1F524]" />
                  )}
                </div>

                {/* Micro Class Badge */}
                {dayClassCount > 0 ? (
                  <span
                    className={`text-[9px] font-bold mt-0.5 ${
                      isSelected ? 'text-black/80 font-black' : 'text-[#8E8E93]'
                    }`}
                  >
                    {dayClassCount} {dayClassCount === 1 ? 'clase' : 'clases'}
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-[#636366] mt-0.5">Libre</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Content Area: Switch between Day Timeline or Week Grid */}
      {viewMode === 'day' ? (
        /* ================= VISTA DÍA: CRONOGRAMA FLOTANTE ================= */
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {selectedDaySlots.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-[24px] bg-[#2C2C2E] flex items-center justify-center text-3xl shadow-inner border border-white/5">
                ☕
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  Día Libre • Sin Clases
                </h3>
                <p className="text-xs font-bold text-[#8E8E93] max-w-[220px]">
                  No tienes materias programadas para este {selectedDayMeta.name.toLowerCase()}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDaySlots.map(({ subject, slot }) => {
                const [startH, startM] = slot.startHour.split(':').map(Number);
                const [endH, endM] = slot.endHour.split(':').map(Number);
                const startMins = startH * 60 + startM;
                const endMins = endH * 60 + endM;

                const isClassLive =
                  selectedDay === currentDay &&
                  currentMins >= startMins &&
                  currentMins < endMins;

                return (
                  <div
                    key={slot.id}
                    onClick={() => onSelectSubject(subject, slot)}
                    style={{
                      borderColor: isClassLive ? subject.color : 'rgba(255,255,255,0.08)',
                      boxShadow: isClassLive
                        ? `0 12px 36px -8px ${subject.color}40`
                        : undefined,
                    }}
                    className={`fitness-card rounded-[22px] p-4 cursor-pointer fitness-press transition-all flex items-center justify-between relative overflow-hidden group bg-[#242426] border border-white/[0.08] ${
                      isClassLive
                        ? 'ring-1 ring-white/30 bg-[#2C2C2E]'
                        : 'hover:border-white/20'
                    }`}
                  >
                    {/* Left Accent Glow Bar */}
                    <div
                      style={{ backgroundColor: subject.color }}
                      className="absolute left-0 top-0 bottom-0 w-2 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                    />

                    {/* Left Content Area */}
                    <div className="flex items-center gap-3.5 pl-2 min-w-0 flex-1">
                      {/* Emoji Capsule */}
                      <div
                        style={{
                          backgroundColor: `${subject.color}20`,
                          borderColor: `${subject.color}40`,
                        }}
                        className="w-12 h-12 rounded-[18px] border flex items-center justify-center text-2xl shrink-0 backdrop-blur-md shadow-sm group-hover:scale-105 transition-transform"
                      >
                        {subject.emoji || '📚'}
                      </div>

                      {/* Info Texts */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white tracking-tight truncate">
                            {subject.name}
                          </h4>
                          {isClassLive && (
                            <span className="px-2 py-0.5 rounded-full bg-[#A1F524] text-black text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                              En vivo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E93] truncate">
                          <span>📍 {slot.room || subject.shortInfo || 'En aula'}</span>
                          {subject.instructor && (
                            <>
                              <span>•</span>
                              <span className="truncate">👤 {subject.instructor}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Time Pill */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-3">
                      <div className="bg-[#2C2C2E] px-3 py-1.5 rounded-full text-xs font-black text-white tracking-tight border border-white/5">
                        {slot.startHour} - {slot.endHour}
                      </div>
                      <span className="text-[10px] font-extrabold text-[#8E8E93]">
                        {slot.durationMinutes} min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= VISTA SEMANA: MATRIZ PANORÁMICA CON PÍLDORAS FLOTANTES ================= */
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto relative select-none no-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div
            className="relative"
            style={{
              minWidth: `${54 + DAYS.length * DAY_COL_WIDTH}px`,
              minHeight: `${44 + TOTAL_HOURS * HOUR_HEIGHT}px`,
            }}
          >
            {/* Sticky Top Days Row Header */}
            <div className="sticky top-0 z-30 flex bg-[#1C1C1E]/95 backdrop-blur-2xl border-b border-white/[0.08]">
              {/* Top-left corner spacer */}
              <div className="sticky left-0 z-40 w-14 shrink-0 bg-[#1C1C1E] backdrop-blur-2xl border-r border-white/[0.06] flex items-center justify-center">
                <span className="text-[10px] font-black text-[#636366]">HORA</span>
              </div>

              {/* Day Header Pills */}
              <div className="flex">
                {DAYS.map((day) => {
                  const isToday = day.id === currentDay;
                  return (
                    <div
                      key={day.id}
                      style={{ width: `${DAY_COL_WIDTH}px` }}
                      className="shrink-0 py-2 px-2 flex items-center justify-center border-r border-white/[0.04]"
                    >
                      <div
                        className={`w-full py-1 px-2 rounded-full text-center transition-all ${
                          isToday
                            ? 'bg-white text-black font-black shadow-sm'
                            : 'bg-[#2C2C2E] text-[#8E8E93] font-bold'
                        }`}
                      >
                        <span className="text-xs tracking-wider uppercase">{day.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Body: Left Sticky Hours Column + Days Columns */}
            <div className="flex relative">
              {/* Sticky Hours Column */}
              <div className="sticky left-0 z-20 w-14 shrink-0 bg-[#1C1C1E]/95 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col">
                {Array.from({ length: TOTAL_HOURS }).map((_, idx) => {
                  const hour = START_HOUR + idx;
                  const isCurrentHour = Math.floor(currentHourFloat) === hour;
                  return (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="flex flex-col items-center justify-start pt-2 relative border-b border-white/[0.03]"
                    >
                      <div
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight text-center leading-tight ${
                          isCurrentHour
                            ? 'bg-[#A1F524] text-black font-black shadow-[0_0_8px_#A1F524]'
                            : 'text-[#8E8E93]'
                        }`}
                      >
                        {formatHourLabel(hour)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Days Columns & Floating Pills Matrix */}
              <div className="flex relative flex-1">
                {/* Background Grid Horizontal Lines */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {Array.from({ length: TOTAL_HOURS }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-white/[0.03] w-full"
                    />
                  ))}
                </div>

                {/* Real-time Indicator Line across the entire grid */}
                {isNowInRange && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${currentIndicatorTop}px` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FA114F] ring-2 ring-black -ml-1.5 shadow-[0_0_8px_#FA114F]" />
                    <div className="h-[2px] bg-[#FA114F] w-full opacity-90" />
                  </div>
                )}

                {/* Day Columns with Floating Pills */}
                {DAYS.map((day) => {
                  const daySlots = slotsByDay[day.id] || [];
                  const isToday = day.id === currentDay;

                  return (
                    <div
                      key={day.id}
                      style={{
                        width: `${DAY_COL_WIDTH}px`,
                        height: `${TOTAL_HOURS * HOUR_HEIGHT}px`,
                      }}
                      className={`shrink-0 border-r border-white/[0.04] relative ${
                        isToday ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {/* Render Floating Subject Pill Capsules for this day */}
                      {daySlots.map(({ subject, slot }) => {
                        const [startH, startM] = slot.startHour.split(':').map(Number);
                        const startTotalMinutes = startH * 60 + startM;
                        const slotTopMinutes = startTotalMinutes - START_HOUR * 60;
                        const topPx = (slotTopMinutes / 60) * HOUR_HEIGHT;
                        const heightPx = Math.max(
                          48,
                          (slot.durationMinutes / 60) * HOUR_HEIGHT - 6
                        );

                        return (
                          <div
                            key={slot.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubject(subject, slot);
                            }}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                              left: '4px',
                              right: '4px',
                              borderColor: `${subject.color}45`,
                              boxShadow: `0 8px 24px -4px ${subject.color}25`,
                            }}
                            className="absolute z-10 rounded-[20px] fitness-card bg-[#242426] cursor-pointer fitness-press transition-all overflow-hidden flex group hover:border-white/40 border border-white/[0.08]"
                          >
                            {/* Left Content Area (Name, Info, Emoji) */}
                            <div className="flex-1 p-2.5 flex flex-col justify-between overflow-hidden min-w-0">
                              <div>
                                <h4 className="text-xs font-black text-white tracking-tight leading-tight truncate">
                                  {subject.name}
                                </h4>

                                <p className="text-[10px] font-bold text-[#8E8E93] leading-tight truncate mt-0.5">
                                  {slot.room || subject.shortInfo || 'Sin aula'}
                                </p>

                                {slot.durationMinutes > 60 && (
                                  <p className="text-[9px] font-extrabold text-[#636366] mt-0.5">
                                    {slot.startHour} - {slot.endHour}
                                  </p>
                                )}
                              </div>

                              {/* Bottom Emoji Stamp & Duration */}
                              <div className="flex items-center justify-between pt-0.5">
                                <div className="px-2 py-0.5 rounded-full bg-[#2C2C2E] border border-white/5 flex items-center gap-1">
                                  <span className="text-xs">{subject.emoji || '📚'}</span>
                                  <span className="text-[9px] font-bold text-[#8E8E93]">
                                    {slot.durationMinutes}m
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Vertical Glow Color Capsule */}
                            <div
                              style={{ backgroundColor: subject.color }}
                              className="w-3 shrink-0 rounded-r-[19px] opacity-90 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
