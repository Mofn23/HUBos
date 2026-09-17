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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in cursor-pointer"
        />
      )}

      {/* 2. Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Popover Mini Submenu with Glassmorphism Capsules */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end space-y-2.5 animate-scale-up origin-bottom-right">
            {/* Action 1: Agregar Materia */}
            <button
              onClick={() => handleSelect(onAddClass)}
              className="glass-surface hover:border-white/30 flex items-center gap-3 px-4 py-2.5 rounded-full text-[#F5F5F7] shadow-2xl active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight">Agregar Materia</span>
              <div className="w-8 h-8 rounded-full bg-[#34C759] text-black flex items-center justify-center text-sm font-black shadow-[0_0_12px_#34C759] group-hover:scale-110 transition-transform">
                📚
              </div>
            </button>

            {/* Action 2: Agregar Tarea */}
            <button
              onClick={() => handleSelect(onAddTask)}
              className="glass-surface hover:border-white/30 flex items-center gap-3 px-4 py-2.5 rounded-full text-[#F5F5F7] shadow-2xl active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight">Agregar Tarea / Pendiente</span>
              <div className="w-8 h-8 rounded-full bg-[#FF9500] text-black flex items-center justify-center text-sm font-black shadow-[0_0_12px_#FF9500] group-hover:scale-110 transition-transform">
                📝
              </div>
            </button>

            {/* Action 3: Escanear con IA */}
            <button
              onClick={() => handleSelect(onAiScan)}
              className="glass-surface hover:border-[#BF5AF2]/50 flex items-center gap-3 px-4 py-2.5 rounded-full text-[#F5F5F7] shadow-2xl active:scale-95 transition-all group"
            >
              <span className="text-xs font-black tracking-tight text-[#BF5AF2]">
                Escanear con Gemini IA ✨
              </span>
              <div className="w-8 h-8 rounded-full bg-[#BF5AF2] text-white flex items-center justify-center text-sm font-black shadow-[0_0_12px_#BF5AF2] group-hover:scale-110 transition-transform">
                🤖
              </div>
            </button>
          </div>
        )}

        {/* The Main FAB Button (+) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Añadir materia o tarea"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-2xl transition-all active:scale-90 border border-white/20 ${
            isOpen
              ? 'bg-[#FF453A] text-white rotate-45 ring-4 ring-[#FF453A]/30'
              : 'bg-[#34C759] text-black shadow-[0_0_20px_#34C759] ring-4 ring-[#34C759]/20 hover:scale-105'
          }`}
        >
          +
        </button>
      </div>
    </>
  );
};
