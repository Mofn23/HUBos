'use client';

import React, { useRef } from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey, getYesterdayKey } from '@/lib/date';
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
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop con desenfoque de cristal profundo */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Glassmorphism Bottom Sheet */}
      <div
        className="relative glass-surface-elevated border-t border-white/20 w-full max-w-md rounded-t-[36px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl backdrop-blur-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Drag Indicator */}
        <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">Seleccionar Fecha</h3>
          </div>
          <button
            onClick={onClose}
            className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-white/30 transition-colors active:scale-90"
            aria-label="Cerrar modal"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>

        {/* Option 1: HOY */}
        <button
          onClick={() => handleSelectDate(todayKey)}
          className={`w-full p-4 rounded-[22px] text-left flex items-center justify-between transition-all ${
            isToday
              ? 'glass-pill-active border-[#34C759]/40 bg-[#34C759]/15 shadow-[0_0_20px_rgba(52,199,89,0.25)]'
              : 'glass-pill hover:border-white/25 active:scale-[0.99]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isToday ? 'bg-[#34C759]/20 text-[#34C759]' : 'glass-pill text-white/80'
              }`}
            >
              ☀️
            </div>
            <div>
              <div
                className={`text-sm font-black ${
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
            <div className="w-6 h-6 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-[0_0_10px_#34C759]">
              ✓
            </div>
          )}
        </button>

        {/* Option 2: AYER */}
        <button
          onClick={() => handleSelectDate(yesterdayKey)}
          className={`w-full p-4 rounded-[22px] text-left flex items-center justify-between transition-all ${
            isYesterday
              ? 'glass-pill-active border-[#34C759]/40 bg-[#34C759]/15 shadow-[0_0_20px_rgba(52,199,89,0.25)]'
              : 'glass-pill hover:border-white/25 active:scale-[0.99]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isYesterday ? 'bg-[#34C759]/20 text-[#34C759]' : 'glass-pill text-white/80'
              }`}
            >
              ◀️
            </div>
            <div>
              <div
                className={`text-sm font-black ${
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
            <div className="w-6 h-6 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-[0_0_10px_#34C759]">
              ✓
            </div>
          )}
        </button>

        {/* Option 3: CALENDARIO PERSONALIZADO */}
        <div className="glass-surface p-4 rounded-[22px] border-t-white/20 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
            <span>📅</span>
            <span>O ELIGE UNA FECHA ESPECÍFICA</span>
          </div>

          <div
            className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl glass-pill text-[#F5F5F7] font-black text-center cursor-pointer active:scale-[0.99] transition-transform hover:border-white/30"
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
            className="glass-pill w-full py-3.5 rounded-full text-[#F5F5F7] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-white/30 shadow-md"
          >
            <span>🔄</span>
            <span>Volver a Hoy</span>
          </button>
        )}
      </div>
    </div>
  );
};
