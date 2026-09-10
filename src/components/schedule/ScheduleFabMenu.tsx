'use client';

import React, { useState } from 'react';

interface ScheduleFabMenuProps {
  onAddClass: () => void;
  onAddTask: () => void;
  onAiScan: () => void;
}

export const ScheduleFabMenu: React.FC<ScheduleFabMenuProps> = ({
  onAddClass,
  onAddTask,
  onAiScan,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* 1. Fullscreen Dimmed Backdrop (Directly matches: "Se pone opaca toda la aplicación") */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in cursor-pointer"
        />
      )}

      {/* 2. Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Popover Mini Submenu (Directly matches sketch & request) */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end space-y-2 animate-scale-up origin-bottom-right">
            {/* Action 1: Agregar Materia */}
            <button
              onClick={() => handleSelect(onAddClass)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1C1E] border border-white/15 text-[#F5F5F7] shadow-2xl hover:bg-[#2A2A2C] active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight">Agregar Materia</span>
              <div className="w-8 h-8 rounded-full bg-[#34C759] text-black flex items-center justify-center text-base font-black shadow-glowGreen group-hover:scale-110 transition-transform">
                📚
              </div>
            </button>

            {/* Action 2: Agregar Tarea */}
            <button
              onClick={() => handleSelect(onAddTask)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1C1E] border border-white/15 text-[#F5F5F7] shadow-2xl hover:bg-[#2A2A2C] active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight">Agregar Tarea / Pendiente</span>
              <div className="w-8 h-8 rounded-full bg-[#FF9500] text-black flex items-center justify-center text-base font-black shadow-card group-hover:scale-110 transition-transform">
                📝
              </div>
            </button>

            {/* Action 3: Escanear con IA */}
            <button
              onClick={() => handleSelect(onAiScan)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#1C1C1E] to-[#252030] border border-[#BF5AF2]/40 text-[#F5F5F7] shadow-2xl hover:border-[#BF5AF2] active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight text-[#BF5AF2]">
                Escanear con Gemini IA ✨
              </span>
              <div className="w-8 h-8 rounded-full bg-[#BF5AF2] text-white flex items-center justify-center text-base font-black shadow-card group-hover:scale-110 transition-transform">
                🤖
              </div>
            </button>
          </div>
        )}

        {/* The Main FAB Button (+) as sketched on iPad bottom-right */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Añadir materia o tarea"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-2xl transition-all active:scale-90 ${
            isOpen
              ? 'bg-[#E8505B] text-white rotate-45 ring-4 ring-[#E8505B]/20'
              : 'bg-[#34C759] text-black shadow-glowGreen ring-4 ring-[#34C759]/20 hover:scale-105'
          }`}
        >
          +
        </button>
      </div>
    </>
  );
};
