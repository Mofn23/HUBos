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
      {/* 1. Fullscreen Dimmed Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in cursor-pointer"
        />
      )}

      {/* 2. Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Popover Mini Submenu with Apple Fitness Capsules */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end space-y-2.5 animate-scale-up origin-bottom-right">
            {/* Action 1: Agregar Materia */}
            <button
              onClick={() => handleSelect(onAddClass)}
              className="bg-[#1C1C1E] border border-white/10 hover:border-white/30 flex items-center gap-3 px-4 py-2.5 rounded-full text-white shadow-2xl active:scale-95 transition-all fitness-press group"
            >
              <span className="text-xs font-bold tracking-tight">Agregar Materia</span>
              <div className="w-8 h-8 rounded-full bg-[#A1F524] text-black flex items-center justify-center text-sm font-bold shadow-[0_0_12px_rgba(161,245,36,0.4)] group-hover:scale-110 transition-transform">
                📚
              </div>
            </button>

            {/* Action 2: Agregar Tarea */}
            <button
              onClick={() => handleSelect(onAddTask)}
              className="bg-[#1C1C1E] border border-white/10 hover:border-white/30 flex items-center gap-3 px-4 py-2.5 rounded-full text-white shadow-2xl active:scale-95 transition-all fitness-press group"
            >
              <span className="text-xs font-bold tracking-tight">Agregar Tarea / Pendiente</span>
              <div className="w-8 h-8 rounded-full bg-[#FFD60A] text-black flex items-center justify-center text-sm font-bold shadow-[0_0_12px_rgba(255,214,10,0.4)] group-hover:scale-110 transition-transform">
                📝
              </div>
            </button>

            {/* Action 3: Escanear con IA */}
            <button
              onClick={() => handleSelect(onAiScan)}
              className="bg-[#1C1C1E] border border-white/10 hover:border-[#00F0FF]/50 flex items-center gap-3 px-4 py-2.5 rounded-full text-white shadow-2xl active:scale-95 transition-all fitness-press group"
            >
              <span className="text-xs font-bold tracking-tight text-[#00F0FF]">
                Escanear con Gemini IA ✨
              </span>
              <div className="w-8 h-8 rounded-full bg-[#00F0FF] text-black flex items-center justify-center text-sm font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] group-hover:scale-110 transition-transform">
                🤖
              </div>
            </button>
          </div>
        )}

        {/* The Main FAB Button (+) in Apple Fitness Lime */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Añadir materia o tarea"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl transition-all active:scale-90 border border-white/15 fitness-press ${
            isOpen
              ? 'bg-[#FA114F] text-white rotate-45 ring-4 ring-[#FA114F]/30'
              : 'bg-[#A1F524] text-black shadow-[0_0_24px_rgba(161,245,36,0.45)] ring-4 ring-[#A1F524]/20 hover:scale-105'
          }`}
        >
          +
        </button>
      </div>
    </>
  );
};
