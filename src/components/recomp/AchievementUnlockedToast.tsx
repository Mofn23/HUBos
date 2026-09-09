'use client';

import React, { useEffect } from 'react';
import { useRecompStore } from '@/stores/useRecompStore';

export const AchievementUnlockedToast: React.FC = () => {
  const { recentlyUnlockedAchievement, clearRecentlyUnlockedAchievement } = useRecompStore();

  useEffect(() => {
    if (recentlyUnlockedAchievement) {
      const timer = setTimeout(() => {
        clearRecentlyUnlockedAchievement();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [recentlyUnlockedAchievement, clearRecentlyUnlockedAchievement]);

  if (!recentlyUnlockedAchievement) return null;

  return (
    <div className="fixed inset-x-0 top-12 z-[999999] flex justify-center px-4 pointer-events-none animate-slide-down">
      <div className="pointer-events-auto relative w-full max-w-sm rounded-[28px] bg-[#1C1C1E]/95 border-2 border-[#FFD60A]/40 shadow-[0_12px_40px_rgba(255,214,10,0.25)] backdrop-blur-2xl p-4 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FFD60A]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          {/* Icon Badge */}
          <div className="w-13 h-13 rounded-2xl bg-[#2A2A2C] border border-[#FFD60A]/30 flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce">
            {recentlyUnlockedAchievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD60A]">
                🏆 ¡LOGRO DESBLOQUEADO!
              </span>
            </div>
            <h3 className="text-sm font-black text-[#F5F5F7] truncate mt-0.5">
              {recentlyUnlockedAchievement.title}
            </h3>
            <p className="text-[11px] font-semibold text-[#8E8E93] line-clamp-2 mt-0.5 leading-snug">
              {recentlyUnlockedAchievement.description}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={clearRecentlyUnlockedAchievement}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-black shrink-0 transition-colors"
            aria-label="Cerrar notificación de logro"
          >
            ✕
          </button>
        </div>

        {/* Progress time indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <div className="h-full bg-[#FFD60A] animate-shrink-width" style={{ animationDuration: '6500ms' }} />
        </div>
      </div>
    </div>
  );
};
