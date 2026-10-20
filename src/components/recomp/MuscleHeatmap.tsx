'use client';

import React, { useMemo } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData } from 'react-body-highlighter';
import { useRecompStore } from '@/stores/useRecompStore';
import { getMusclesForExercise } from '@/lib/muscleMap';

const HIGHLIGHT_COLORS = [
  '#A1F524', // 1 set
  '#30D158', // 2 sets
  '#FFD60A', // 3 sets
  '#FF9F0A', // 4 sets
  '#FA114F', // 5-6 sets
  '#FA114F', // 6 sets
  '#FF2D55', // 7+ sets
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
    <div className="bg-[#1C1C1E] rounded-[28px] p-5 border border-white/5 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="text-xs font-black text-[#F5F5F7]">Mapa de Fatiga Muscular</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FA114F]/15 text-[#FA114F] border border-[#FA114F]/25 text-[10px] font-black">
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
            svgStyle={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
        </div>

        {/* VISTA TRASERA */}
        <div className="w-[44%]">
          <Model
            type="posterior"
            data={fatigueData}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', height: 'auto' }}
            svgStyle={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-1.5 pt-1 flex-wrap">
        <span className="bg-[#2C2C2E] border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#8E8E93]">
          0 (Descansado)
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#A1F524]/15 text-[#A1F524] border border-[#A1F524]/25 text-[10px] font-black">
          1-2 Series
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/25 text-[10px] font-black">
          3-5 Series
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FA114F]/15 text-[#FA114F] border border-[#FA114F]/25 text-[10px] font-black">
          6+ Series
        </span>
      </div>
    </div>
  );
};
