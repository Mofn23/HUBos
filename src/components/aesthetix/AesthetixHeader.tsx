'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { IconSettings } from '@/components/common/Icons';

interface AesthetixHeaderProps {
  onOpenAiBuilder: () => void;
  onOpenLiveWorkout: () => void;
}

export const AesthetixHeader: React.FC<AesthetixHeaderProps> = ({
  onOpenAiBuilder,
  onOpenLiveWorkout,
}) => {
  const { setCurrentApp } = useHubStore();
  const { currentStreak, activeSession, workoutDaysTarget } = useAesthetixStore();

  return (
    <header className="flex items-center justify-between relative z-20 w-full mb-3">
      {/* Left: Return to HUB button */}
      <button
        onClick={() => setCurrentApp('hub')}
        className="glass-pill h-8 px-3 rounded-full flex items-center gap-1 text-xs font-black text-[#F5F5F7] hover:text-white hover:border-white/30 active:scale-95 transition-all shadow-sm"
      >
        <span className="text-sm font-bold leading-none">‹</span>
        <span>HUB</span>
      </button>

      {/* Center: Live Session Pulse or Streak Pill */}
      {activeSession ? (
        <button
          onClick={onOpenLiveWorkout}
          className="h-8 px-3.5 rounded-full bg-[#FF375F]/20 border border-[#FF375F]/40 backdrop-blur-xl text-[#FF375F] text-xs font-black flex items-center gap-2 animate-pulse shadow-[0_0_16px_rgba(255,55,95,0.4)] active:scale-95 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF375F]" />
          <span>En vivo: {activeSession.dayName || 'Entreno'}</span>
        </button>
      ) : (
        <div className="glass-pill h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-black text-[#FF9500] border-t-white/20">
          <span>🔥</span>
          <span>{currentStreak}d racha</span>
          <span className="text-[10px] text-[#8E8E93] font-bold">({workoutDaysTarget}d/sem)</span>
        </div>
      )}

      {/* Right: AI Builder Button */}
      <button
        onClick={onOpenAiBuilder}
        className="glass-pill h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-black text-[#64D2FF] hover:text-white hover:border-cyan-400/40 active:scale-95 transition-all shadow-sm"
        title="Crear rutina con IA"
      >
        <span>✨</span>
        <span>IA Builder</span>
      </button>
    </header>
  );
};
