'use client';

import React, { useMemo } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData } from 'react-body-highlighter';
import { useRecompStore } from '@/stores/useRecompStore';
import { getMusclesForExercise } from '@/lib/muscleMap';

const HIGHLIGHT_COLORS = [
  '#34C759', // 1 set
  '#86E39E', // 2 sets
  '#FECA57', // 3 sets
  '#FF9F43', // 4 sets
  '#FF453A', // 5-6 sets
  '#FF453A', // 6 sets
  '#B82E3B', // 7+ sets
];

export const MuscleHeatmap: React.FC = () => {
  const { trainingLogs } = useRecompStore();

  const fatigueData = useMemo(() => {
    const data: IExerciseData[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    trainingLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Fatigue accumulated over the last 3 days (72 hours)
      if (diffDays <= 3) {
        log.exercises.forEach((ex) => {
          const muscles = getMusclesForExercise(ex.name);
          const setCount = ex.sets?.length || 1;

          if (muscles.length > 0) {
            for (let i = 0; i < setCount; i++) {
              data.push({
                name: `Set de ${ex.name}`,
                muscles: muscles,
              });
            }
          }
        });
      }
    });

    return data;
  }, [trainingLogs]);

  return (
    <div className="glass-surface rounded-[28px] p-5 border-t-white/20 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="text-xs font-black text-[#F5F5F7]">Mapa de Fatiga Muscular</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/25 text-[10px] font-black">
          Últimas 72h
        </span>
      </div>

      <p className="text-xs font-bold text-[#8E8E93] leading-relaxed">
        Seguimiento visual de la fatiga acumulada en los últimos 3 días.
      </p>

      {/* Anterior & Posterior Model */}
      <div className="flex justify-around items-center py-2">
        {/* VISTA FRONTAL */}
        <div className="w-[44%]">
          <Model
            type="anterior"
            data={fatigueData}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', height: 'auto' }}
            svgStyle={{ fill: 'rgba(255, 255, 255, 0.08)' }}
          />
        </div>

        {/* VISTA TRASERA */}
        <div className="w-[44%]">
          <Model
            type="posterior"
            data={fatigueData}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', height: 'auto' }}
            svgStyle={{ fill: 'rgba(255, 255, 255, 0.08)' }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-1.5 pt-1 flex-wrap">
        <span className="glass-pill px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#8E8E93]">
          0 (Descansado)
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/25 text-[10px] font-black">
          1-2 Series
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FECA57]/15 text-[#FECA57] border border-[#FECA57]/25 text-[10px] font-black">
          3-5 Series
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/25 text-[10px] font-black">
          6+ Series
        </span>
      </div>
    </div>
  );
};
