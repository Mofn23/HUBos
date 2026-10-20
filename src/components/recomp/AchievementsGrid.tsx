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
        <div className="bg-[#1C1C1E] border border-white/[0.08] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>🥇</span>
          <span className="text-xs font-black text-white">Premios & Metas</span>
        </div>
        <span className="text-[11px] font-black text-[#8E8E93]">
          {unlockedCount} / {ALL_ACHIEVEMENT_DEFINITIONS.length} obtenidos
        </span>
      </div>

      {/* Apple Fitness Awards Card */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {ALL_ACHIEVEMENT_DEFINITIONS.map((def) => {
            const unlocked = unlockedMap.has(def.id);
            return (
              <div
                key={def.id}
                className="flex flex-col items-center cursor-pointer group fitness-press transition-transform"
                onClick={() => setSelected({ ...def, unlocked })}
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                    unlocked
                      ? 'bg-gradient-to-br from-[#FFD60A]/30 to-[#A1F524]/20 border border-[#FFD60A]/50 shadow-[0_0_15px_rgba(255,214,10,0.35)] scale-100 group-hover:scale-110'
                      : 'bg-[#2C2C2E] border border-white/5 text-white/30 hover:border-white/20'
                  }`}
                >
                  {unlocked ? def.icon : '🔒'}
                </div>
                <span
                  className={`text-[10px] font-black mt-1.5 text-center truncate max-w-[65px] transition-colors ${
                    unlocked ? 'text-white' : 'text-[#8E8E93]'
                  }`}
                >
                  {unlocked ? def.title : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-6 max-w-xs w-full text-center space-y-3.5 z-10 animate-scale-up shadow-2xl">
            <div
              className={`w-18 h-18 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg ${
                selected.unlocked
                  ? 'bg-[#FFD60A]/20 border-2 border-[#FFD60A] shadow-[0_0_25px_rgba(255,214,10,0.45)]'
                  : 'bg-[#2C2C2E] border border-white/10'
              }`}
            >
              {selected.unlocked ? selected.icon : '🔒'}
            </div>
            <h3 className="text-base font-black text-white tracking-tight">{selected.title}</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                selected.unlocked
                  ? 'bg-[#A1F524]/20 text-[#A1F524] border border-[#A1F524]/30'
                  : 'bg-[#2C2C2E] text-[#8E8E93] border border-white/10'
              }`}
            >
              {selected.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
            </span>
            <p className="text-xs font-bold text-[#8E8E93] leading-relaxed px-1">
              {selected.description}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="bg-[#2C2C2E] border border-white/5 w-full py-3 rounded-full text-white text-xs font-black fitness-press hover:bg-white/10 transition-all mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
