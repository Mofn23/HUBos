'use client';

import React, { useRef, useEffect } from 'react';
import { SubjectItem, ClassSlot } from '@/stores/useScheduleStore';
import { getIsoDayOfWeek, getCurrentTimeMinutes } from '@/lib/scheduleNotifications';

interface ScheduleGridProps {
  subjects: SubjectItem[];
  onSelectSubject: (subject: SubjectItem, slot?: ClassSlot) => void;
  onSlotClick?: (dayOfWeek: number, hour: number) => void;
}

const DAYS = [
  { id: 1, name: 'LUNES', short: 'LUN' },
  { id: 2, name: 'MARTES', short: 'MAR' },
  { id: 3, name: 'MIÉRCOLES', short: 'MIÉ' },
  { id: 4, name: 'JUEVES', short: 'JUE' },
  { id: 5, name: 'VIERNES', short: 'VIE' },
  { id: 6, name: 'SÁBADO', short: 'SÁB' },
  { id: 7, name: 'DOMINGO', short: 'DOM' },
];

const START_HOUR = 6; // 6:00 AM
const END_HOUR = 22; // 10:00 PM
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const HOUR_HEIGHT = 76; // px per hour slot
const DAY_COL_WIDTH = 136; // px per day column

function formatHourLabel(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  subjects,
  onSelectSubject,
  onSlotClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentDay = getIsoDayOfWeek(now);
  const currentMins = getCurrentTimeMinutes(now);
  const currentHourFloat = currentMins / 60;

  // Auto-scroll to today and current hour on initial load
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    // Horizontal scroll to today (offset so today is well in view)
    const targetDayIndex = currentDay - 1; // 0..6
    const horizontalScroll = Math.max(0, targetDayIndex * DAY_COL_WIDTH - 20);

    // Vertical scroll to current hour minus 1 for good visibility
    const targetHourOffset = Math.max(0, currentHourFloat - START_HOUR - 1);
    const verticalScroll = Math.max(0, targetHourOffset * HOUR_HEIGHT);

    container.scrollTo({
      left: horizontalScroll,
      top: verticalScroll,
      behavior: 'smooth',
    });
  }, [currentDay, currentHourFloat]);

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

  return (
    <div className="flex-1 flex flex-col rounded-[28px] bg-[#18181A] border border-white/5 overflow-hidden shadow-inner relative">
      {/* Scrollable Container (Both X & Y simultaneously) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative select-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className="relative"
          style={{
            minWidth: `${56 + DAYS.length * DAY_COL_WIDTH}px`,
            minHeight: `${48 + TOTAL_HOURS * HOUR_HEIGHT}px`,
          }}
        >
          {/* 1. Sticky Top Days Row Header */}
          <div className="sticky top-0 z-30 flex bg-[#18181A]/95 backdrop-blur-md border-b border-white/10">
            {/* Top-left corner spacer */}
            <div className="sticky left-0 z-40 w-14 shrink-0 bg-[#18181A] border-r border-white/5 flex items-center justify-center">
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
                    className="shrink-0 py-2.5 px-2 flex items-center justify-center border-r border-white/5"
                  >
                    <div
                      className={`w-full py-1.5 px-2 rounded-[14px] text-center transition-all ${
                        isToday
                          ? 'bg-[#34C759] text-black shadow-glowGreen font-black'
                          : 'bg-[#242426] text-[#F5F5F7] font-extrabold border border-white/5'
                      }`}
                    >
                      <div className="text-xs tracking-wider flex items-center justify-center gap-1">
                        <span>{day.name}</span>
                        {day.id === 4 && <span className="text-[10px] text-[#8E8E93]">→</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Grid Body: Left Sticky Hours Column + Days Columns */}
          <div className="flex relative">
            {/* Sticky Hours Column */}
            <div className="sticky left-0 z-20 w-14 shrink-0 bg-[#18181A]/95 backdrop-blur-md border-r border-white/5 flex flex-col">
              {Array.from({ length: TOTAL_HOURS }).map((_, idx) => {
                const hour = START_HOUR + idx;
                const isCurrentHour = Math.floor(currentHourFloat) === hour;
                return (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="flex flex-col items-center justify-start pt-2 relative border-b border-white/[0.04]"
                  >
                    <div
                      className={`px-1.5 py-0.5 rounded-[8px] text-[10px] font-black tracking-tight text-center leading-tight ${
                        isCurrentHour
                          ? 'bg-[#34C759] text-black font-black'
                          : 'text-[#8E8E93]'
                      }`}
                    >
                      {formatHourLabel(hour)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Days Columns & Slots Matrix */}
            <div className="flex relative flex-1">
              {/* Background Grid Horizontal Lines */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                {Array.from({ length: TOTAL_HOURS }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-white/[0.04] w-full"
                  />
                ))}
              </div>

              {/* Real-time Indicator Line across the entire grid */}
              {isNowInRange && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                  style={{ top: `${currentIndicatorTop}px` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF453A] ring-2 ring-[#131313] -ml-1.5 shadow-glowRed" />
                  <div className="h-[2px] bg-[#FF453A] w-full opacity-80" />
                </div>
              )}

              {/* Day Columns with Cards */}
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
                    className={`shrink-0 border-r border-white/5 relative ${
                      isToday ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    {/* Render Subject Cards for this day */}
                    {daySlots.map(({ subject, slot }) => {
                      // Calculate slot position
                      const [startH, startM] = slot.startHour.split(':').map(Number);
                      const startTotalMinutes = startH * 60 + startM;
                      const slotTopMinutes = startTotalMinutes - START_HOUR * 60;
                      const topPx = (slotTopMinutes / 60) * HOUR_HEIGHT;
                      const heightPx = Math.max(48, (slot.durationMinutes / 60) * HOUR_HEIGHT - 6);

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
                          }}
                          className="absolute z-10 rounded-[18px] bg-[#222225] hover:bg-[#28282C] border border-white/10 shadow-md cursor-pointer active:scale-95 transition-all overflow-hidden flex group"
                        >
                          {/* Left Content Area (Nombre, Info, Emoji) */}
                          <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden min-w-0">
                            <div>
                              {/* Subject Name */}
                              <h4 className="text-xs font-black text-[#F5F5F7] tracking-tight leading-tight truncate">
                                {subject.name}
                              </h4>

                              {/* Short Info (Salón / Pista / Aula) */}
                              <p className="text-[10px] font-bold text-[#8E8E93] leading-tight truncate mt-0.5">
                                {slot.room || subject.shortInfo || 'Sin aula'}
                              </p>

                              {/* Time subtitle if multi-hour */}
                              {slot.durationMinutes > 60 && (
                                <p className="text-[9px] font-extrabold text-[#636366] mt-0.5">
                                  {slot.startHour} - {slot.endHour}
                                </p>
                              )}
                            </div>

                            {/* Bottom Emoji Stamp (as drawn in sketch with border badge) */}
                            <div className="flex items-center justify-between pt-0.5">
                              <div className="px-1.5 py-0.5 rounded-[8px] bg-white/5 border border-white/10 flex items-center gap-1">
                                <span className="text-xs">{subject.emoji || '📚'}</span>
                                <span className="text-[9px] font-bold text-[#8E8E93]">
                                  {slot.durationMinutes}m
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Vertical Color Stripe (Directly matches the iPad sketch!) */}
                          <div
                            style={{ backgroundColor: subject.color }}
                            className="w-3.5 shrink-0 rounded-r-[17px] shadow-sm flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
};
