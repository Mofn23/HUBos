'use client';

import React, { useState } from 'react';
import { AchievementItem } from '@/stores/useRecompStore';
import { ALL_ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '@/lib/achievements';

interface AchievementsGridProps {
  achievements: AchievementItem[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  const [selected, setSelected] = useState<(AchievementDefinition & { unlocked: boolean }) | null>(null);

  // Unlocked IDs based on valid unlockedAt in the achievements store
  const unlockedMap = new Map<string, string>();
  achievements.forEach((a) => {
    if (a.unlockedAt) {
      unlockedMap.set(a.id, a.unlockedAt);
    }
  });

  const unlockedCount = ALL_ACHIEVEMENT_DEFINITIONS.filter((def) => unlockedMap.has(def.id)).length;

  return (
    <div className="mb-4 space-y-2.5">
      {/* Header Pill */}
      <div className="flex items-center justify-between px-1">
        <div className="bg-[#2C2C2E] border border-white/[0.08] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>🥇</span>
          <span className="text-xs font-black text-[#F5F5F7]">Logros & Metas</span>
        </div>
        <span className="text-[11px] font-black text-[#8E8E93]">
          {unlockedCount} / {ALL_ACHIEVEMENT_DEFINITIONS.length} desbloqueados
        </span>
      </div>

      {/* Glassmorphism Achievements Card */}
      <div className="overflow-hidden bg-[#1C1C1E] border border-white/[0.08] rounded-[28px] p-4 border-t-white/20">
        <div className="grid grid-cols-4 gap-x-2 gap-y-3">
          {ALL_ACHIEVEMENT_DEFINITIONS.map((def, index) => {
            const unlocked = unlockedMap.has(def.id);
            const isCenteredFinalItem =
              ALL_ACHIEVEMENT_DEFINITIONS.length % 4 === 1 &&
              index === ALL_ACHIEVEMENT_DEFINITIONS.length - 1;
            return (
              <div
                key={def.id}
                className={`flex min-w-0 w-full flex-col items-center cursor-pointer group active:scale-95 motion-reduce:active:scale-100 transition-transform duration-150 motion-reduce:transition-none ${isCenteredFinalItem ? 'col-span-4' : ''}`}
                onClick={() => setSelected({ ...def, unlocked })}
              >
                <div
                  className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-2xl transition-[color,background-color,transform] duration-200 motion-reduce:transition-none ${
                    unlocked
                      ? 'bg-gradient-to-br from-[#A1F524]/25 to-[#A1F524]/10 border border-[#A1F524]/40  scale-100 group-hover:scale-110'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/30 hover:border-white/20'
                  }`}
                >
                  {unlocked ? def.icon : '🔒'}
                </div>
                <span
                  className={`mt-1.5 w-full max-w-[4.25rem] truncate px-1 text-center text-[10px] font-black transition-colors ${
                    unlocked ? 'text-[#F5F5F7]' : 'text-[#636366]'
                  }`}
                >
                  {unlocked ? def.title : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal (Glassmorphism Elevated) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in motion-reduce:animate-none">
          <div
            className="fixed inset-0 bg-black/80 "
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-[#1C1C1E] border border-white/[0.08] rounded-[32px] p-6 max-w-xs w-full text-center space-y-3.5 z-10 animate-scale-up motion-reduce:animate-none border-t-white/30 shadow-sm">
            <div
              className={`w-18 h-18 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-sm ${
                selected.unlocked
                  ? 'bg-[#A1F524]/20 border-2 border-[#A1F524] '
                  : 'bg-white/[0.06] border border-white/10'
              }`}
            >
              {selected.unlocked ? selected.icon : '🔒'}
            </div>
            <h3 className="text-base font-black text-[#F5F5F7] tracking-tight">{selected.title}</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                selected.unlocked
                  ? 'bg-[#A1F524]/20 text-[#A1F524] border border-[#A1F524]/30'
                  : 'bg-white/10 text-[#8E8E93] border border-white/10'
              }`}
            >
              {selected.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
            </span>
            <p className="text-xs font-bold text-[#8E8E93] leading-relaxed px-1">
              {selected.description}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="bg-[#2C2C2E] border border-white/[0.08] w-full py-2.5 rounded-full text-[#F5F5F7] text-xs font-black hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
