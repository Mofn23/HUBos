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

      {/* Apple Fitness Bottom Sheet */}
      <div
        className="relative bg-[#1C1C1E] border-t border-white/15 w-full max-w-md rounded-t-[36px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl"
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
            className="w-8 h-8 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors fitness-press"
            aria-label="Cerrar modal"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>

        {/* Option 1: HOY */}
        <button
          onClick={() => handleSelectDate(todayKey)}
          className={`w-full p-4 rounded-[22px] text-left flex items-center justify-between transition-all fitness-press ${
            isToday
              ? 'bg-[#242426] border border-[#A1F524]/40 shadow-sm'
              : 'bg-[#242426] border border-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isToday ? 'bg-[#A1F524]/20 text-[#A1F524]' : 'bg-[#2C2C2E] text-white/80'
              }`}
            >
              ☀️
            </div>
            <div>
              <div
                className={`text-sm font-black ${
                  isToday ? 'text-[#A1F524]' : 'text-[#F5F5F7]'
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
            <div className="w-6 h-6 rounded-full bg-[#A1F524] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-[0_0_10px_#A1F524]">
              ✓
            </div>
          )}
        </button>

        {/* Option 2: AYER */}
        <button
          onClick={() => handleSelectDate(yesterdayKey)}
          className={`w-full p-4 rounded-[22px] text-left flex items-center justify-between transition-all fitness-press ${
            isYesterday
              ? 'bg-[#242426] border border-[#A1F524]/40 shadow-sm'
              : 'bg-[#242426] border border-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isYesterday ? 'bg-[#A1F524]/20 text-[#A1F524]' : 'bg-[#2C2C2E] text-white/80'
              }`}
            >
              ◀️
            </div>
            <div>
              <div
                className={`text-sm font-black ${
                  isYesterday ? 'text-[#A1F524]' : 'text-[#F5F5F7]'
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
            <div className="w-6 h-6 rounded-full bg-[#A1F524] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-[0_0_10px_#A1F524]">
              ✓
            </div>
          )}
        </button>

        {/* Option 3: CALENDARIO PERSONALIZADO */}
        <div className="bg-[#242426] border border-white/5 p-4 rounded-[22px] space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
            <span>📅</span>
            <span>O ELIGE UNA FECHA ESPECÍFICA</span>
          </div>

          <div
            className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl bg-[#2C2C2E] border border-white/10 hover:border-white/25 text-[#F5F5F7] font-black text-center cursor-pointer fitness-press transition-transform"
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
            className="w-full py-3.5 rounded-full bg-[#A1F524] text-black font-black text-sm flex items-center justify-center gap-2 fitness-press transition-all shadow-md shadow-[#A1F524]/20"
          >
            <span>🔄</span>
            <span>Volver a Hoy</span>
          </button>
        )}
      </div>
    </div>
  );
};
