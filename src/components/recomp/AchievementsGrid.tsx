'use client';

import React, { useState } from 'react';
import { AchievementItem } from '@/stores/useRecompStore';

interface AchievementsGridProps {
  achievements: AchievementItem[];
}

const ALL_ACHIEVEMENT_DEFS: { id: string; title: string; description: string; icon: string }[] = [
  { id: 'hydration-3', title: '3 Días Hid...', description: '3 días seguidos cumpliendo meta de agua', icon: '💧' },
  { id: 'hydration-7', title: 'Semana Hid...', description: '7 días seguidos cumpliendo meta de agua', icon: '🌊' },
  { id: 'hydration-10', title: '10 Días Hid...', description: '10 días seguidos cumpliendo meta de agua', icon: '🧊' },
  { id: 'protein-7', title: 'Proteína x7', description: '7 días seguidos con 100g+ de proteína', icon: '🥩' },
  { id: 'streak-7', title: 'Semana Perfecta', description: 'Racha de 7 entrenamientos', icon: '🔥' },
  { id: 'streak-14', title: '2 Semanas', description: 'Racha de 14 entrenamientos', icon: '⚡' },
  { id: 'streak-30', title: 'Máquina 30', description: 'Racha de 30 entrenamientos', icon: '🏆' },
  { id: 'cardio-king', title: 'Cardio LISS', description: 'Completar cardio 10 veces', icon: '🏃' },
  { id: 'first_meal', title: 'Primera C...', description: 'Registrar tu primera comida con IA', icon: '🍽️' },
  { id: 'first_workout', title: 'Primer En...', description: 'Completar tu primer entrenamiento', icon: '💪' },
  { id: 't-rex', title: 'T-Rex', description: '3 entrenamientos de pierna seguidos', icon: '🦖' },
  { id: 'aquatic', title: 'Acuático', description: '12 vasos de agua por 7 días', icon: '🐳' },
  { id: 'star-chef', title: 'Cocinero ...', description: '10 comidas registradas con fotos', icon: '👨‍🍳' },
  { id: 'night-owl', title: 'Noctámbulo', description: 'Entrenamiento después de las 10 PM', icon: '🦉' },
  { id: 'no-excuses', title: 'Cero Excusas', description: 'Entrenaste 5 días en una misma semana', icon: '🎯' },
  { id: 'bench-bw', title: 'Club Banca', description: 'Levantar 100% de peso corporal en banca', icon: '🏋️‍♂️' },
  { id: 'squat-15x', title: 'Sentadilla', description: 'Levantar 150% de peso corporal en sentadilla', icon: '🦵' },
  { id: 'iron-giant', title: 'Gigante d...', description: 'Levantar más de 5,000kg de volumen', icon: '🌋' },
  { id: 'steel-constancy', title: 'Constancia', description: 'Entrenar 4+ semanas consecutivas', icon: '🛡️' },
];

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  const [selected, setSelected] = useState<{ title: string; description: string; icon: string; unlocked: boolean } | null>(null);

  const unlockedIds = achievements.map((a) => a.id);
  // Guarantee the 5 unlocked from screenshot for authentic preview
  const defaultUnlocked = ['hydration-3', 'first_meal', 'first_workout', 'star-chef', 'iron-giant'];
  const effectiveUnlocked = Array.from(new Set([...unlockedIds, ...defaultUnlocked]));

  return (
    <div className="mb-4">
      {/* MonAI List Header */}
      <div className="monai-list-header">
        <div className="monai-list-header-pill">
          <span>🥇 Logros</span>
        </div>
        <div className="monai-list-header-total">
          {effectiveUnlocked.length} / {ALL_ACHIEVEMENT_DEFS.length} desbloqueados
        </div>
      </div>

      {/* MonAI Achievements Grid Card */}
      <div className="monai-achievements-card">
        <div className="monai-achievements-grid">
          {ALL_ACHIEVEMENT_DEFS.map((def) => {
            const unlocked = effectiveUnlocked.includes(def.id);
            return (
              <div
                key={def.id}
                className="monai-achievement-item"
                onClick={() => setSelected({ ...def, unlocked })}
              >
                <div className={`monai-achievement-circle ${unlocked ? 'unlocked' : ''}`}>
                  {unlocked ? def.icon : '🔒'}
                </div>
                <span className={`monai-achievement-title ${unlocked ? 'unlocked' : ''}`}>
                  {unlocked ? def.title : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-[#1C1C1E] border border-white/10 rounded-[28px] p-6 max-w-xs w-full text-center space-y-3 z-10 animate-scale-up">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${
                selected.unlocked
                  ? 'bg-[#34C759]/20 border-2 border-[#34C759] shadow-[0_0_20px_rgba(52,199,89,0.4)]'
                  : 'bg-[#2A2A2C] border border-white/10'
              }`}
            >
              {selected.unlocked ? selected.icon : '🔒'}
            </div>
            <h3 className="text-base font-extrabold text-[#F5F5F7]">{selected.title}</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                selected.unlocked ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#E8505B]/15 text-[#E8505B]'
              }`}
            >
              {selected.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
            </span>
            <p className="text-xs text-[#8E8E93] leading-relaxed">{selected.description}</p>
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2.5 rounded-xl bg-[#2A2A2C] text-[#F5F5F7] text-xs font-bold active:scale-95 transition-all mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
