'use client';

import React, { useRef } from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey, getYesterdayKey, formatDateSpanish } from '@/lib/date';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ isOpen, onClose }) => {
  const { selectedDate, setSelectedDate } = useRecompStore();
  const dateInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  const isToday = selectedDate === todayKey;
  const isYesterday = selectedDate === yesterdayKey;

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    onClose();
  };

  const todayDisplay = format(parseISO(todayKey), 'dd/MM');
  const yesterdayDisplay = format(parseISO(yesterdayKey), 'dd/MM');
  const formattedSelectedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* MonAI Bottom Sheet */}
      <div
        className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[32px] p-6 pb-10 z-10 animate-sheet-up space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h3 className="text-xl font-black text-[#F5F5F7]">Seleccionar Fecha</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        {/* Option 1: HOY */}
        <button
          onClick={() => handleSelectDate(todayKey)}
          className={`w-full p-4 rounded-[22px] border text-left flex items-center justify-between transition-all ${
            isToday
              ? 'bg-[#34C759]/12 border-[#34C759]'
              : 'bg-[#1C1C1E] border-white/5 hover:bg-[#242426]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#2A2A2C] flex items-center justify-center text-xl shrink-0">
              ☀️
            </div>
            <div>
              <div
                className={`text-base font-extrabold ${
                  isToday ? 'text-[#34C759]' : 'text-[#F5F5F7]'
                }`}
              >
                Hoy ({todayDisplay})
              </div>
              <div className="text-xs font-bold text-[#8E8E93] mt-0.5">
                Actualizar app con el registro del día actual
              </div>
            </div>
          </div>
          {isToday && (
            <div className="w-6 h-6 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs shrink-0">
              ✓
            </div>
          )}
        </button>

        {/* Option 2: AYER */}
        <button
          onClick={() => handleSelectDate(yesterdayKey)}
          className={`w-full p-4 rounded-[22px] border text-left flex items-center justify-between transition-all ${
            isYesterday
              ? 'bg-[#34C759]/12 border-[#34C759]'
              : 'bg-[#1C1C1E] border-white/5 hover:bg-[#242426]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#2A2A2C] flex items-center justify-center text-xl shrink-0">
              ◀️
            </div>
            <div>
              <div
                className={`text-base font-extrabold ${
                  isYesterday ? 'text-[#34C759]' : 'text-[#F5F5F7]'
                }`}
              >
                Ayer ({yesterdayDisplay})
              </div>
              <div className="text-xs font-bold text-[#8E8E93] mt-0.5">
                Ver calorías, macros y entrenamiento de ayer
              </div>
            </div>
          </div>
          {isYesterday && (
            <div className="w-6 h-6 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs shrink-0">
              ✓
            </div>
          )}
        </button>

        {/* Option 3: CALENDARIO PERSONALIZADO */}
        <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#8E8E93] uppercase tracking-wider">
            <span>📅</span>
            <span>O ELIGE UNA FECHA ESPECÍFICA</span>
          </div>

          <div
            className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl bg-[#2A2A2C] text-[#F5F5F7] font-extrabold text-center cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => dateInputRef.current?.showPicker?.()}
          >
            <span className="capitalize">{formattedSelectedDate}</span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) handleSelectDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* Return to Today button if custom date */}
        {!isToday && (
          <button
            onClick={() => handleSelectDate(todayKey)}
            className="w-full py-3.5 rounded-full bg-[#2A2A2C] border border-white/10 text-[#F5F5F7] font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>🔄</span>
            <span>Volver a Hoy</span>
          </button>
        )}
      </div>
    </div>
  );
};
