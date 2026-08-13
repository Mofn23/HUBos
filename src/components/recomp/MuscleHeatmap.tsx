'use client';

import React, { useMemo } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData } from 'react-body-highlighter';
import { useRecompStore } from '@/stores/useRecompStore';
import { getMusclesForExercise } from '@/lib/muscleMap';

const HIGHLIGHT_COLORS = [
  '#34C759', // 1 set (Verde suave)
  '#86E39E', // 2 sets (Verde claro)
  '#FECA57', // 3 sets (Amarillo pastel)
  '#FF9F43', // 4 sets (Naranja)
  '#E8505B', // 5-6 sets (Coral / Rojo)
  '#E8505B', // 6 sets
  '#B82E3B', // 7+ sets (Rojo borgoña intenso - Fatiga Alta)
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

      // Solo acumulamos fatiga de los últimos 3 días (72 horas)
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
    <div
      className="card"
      style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '20px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontSize: '1.06rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔥</span>
          <span>Mapa de Fatiga Muscular</span>
        </div>
        <span className="tag-pill tag-pill-coral">Últimas 72h</span>
      </div>

      <p
        style={{
          fontSize: '0.87rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          lineHeight: 1.4,
        }}
      >
        Seguimiento de fatiga acumulada en los últimos 3 días.
      </p>

      {/* Renderizado del Cuerpo Humano (Vista Anterior y Posterior) con react-body-highlighter */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {/* VISTA FRONTAL */}
        <div style={{ width: '45%' }}>
          <Model
            type="anterior"
            data={fatigueData}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', height: 'auto' }}
            svgStyle={{ fill: 'var(--surface-elevated)' }}
          />
        </div>

        {/* VISTA TRASERA */}
        <div style={{ width: '45%' }}>
          <Model
            type="posterior"
            data={fatigueData}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: '100%', height: 'auto' }}
            svgStyle={{ fill: 'var(--surface-elevated)' }}
          />
        </div>
      </div>

      {/* Leyenda de Colores */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span className="tag-pill">0 (Descansado)</span>
        <span className="tag-pill tag-pill-green">1-2 Series</span>
        <span
          className="tag-pill"
          style={{ background: 'rgba(254, 202, 87, 0.16)', color: '#FECA57' }}
        >
          3-5 Series
        </span>
        <span className="tag-pill tag-pill-coral">6+ Series (Fatiga Alta)</span>
      </div>
    </div>
  );
};
