'use client';

import React, { useMemo } from 'react';
import { BodyMeasurementEntry } from '@/stores/useRecompStore';

interface WeightTrendProps {
  measurements: BodyMeasurementEntry[];
}

export const WeightTrend: React.FC<WeightTrendProps> = ({ measurements }) => {
  const graphData = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      // Default initial baseline point for clean visual
      const sample = [{ date: '2026-08-08', weightKg: 80.0 }];
      return {
        rawPoints: [{ x: 50, y: 50, value: 80 }],
        avgPoints: [{ x: 50, y: 50, value: 80 }],
        rawPath: 'M 50 50',
        avgPath: 'M 50 50',
        currentWeight: 80.0,
        currentAvg: 80.0,
        trend: 0,
        svgWidth: 300,
        svgHeight: 100,
      };
    }

    const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
    const last30 = sorted.slice(-30);
    const weights = last30.map((m) => m.weightKg);

    const movingAvg: number[] = [];
    for (let i = 0; i < weights.length; i++) {
      const start = Math.max(0, i - 6);
      const slice = weights.slice(start, i + 1);
      const avg = slice.reduce((s, w) => s + w, 0) / slice.length;
      movingAvg.push(parseFloat(avg.toFixed(1)));
    }

    const allValues = [...weights, ...movingAvg];
    const minVal = Math.min(...allValues) - 0.5;
    const maxVal = Math.max(...allValues) + 0.5;
    const range = maxVal - minVal || 1;

    const svgWidth = 300;
    const svgHeight = 100;
    const padding = 12;
    const graphWidth = svgWidth - padding * 2;
    const graphHeight = svgHeight - padding * 2;

    const rawPoints = weights.map((w, i) => ({
      x: padding + (i / Math.max(weights.length - 1, 1)) * graphWidth,
      y: padding + graphHeight - ((w - minVal) / range) * graphHeight,
      value: w,
    }));

    const avgPoints = movingAvg.map((w, i) => ({
      x: padding + (i / Math.max(movingAvg.length - 1, 1)) * graphWidth,
      y: padding + graphHeight - ((w - minVal) / range) * graphHeight,
      value: w,
    }));

    const rawPath = rawPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const avgPath = avgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const currentWeight = weights[weights.length - 1];
    const currentAvg = movingAvg[movingAvg.length - 1];
    const trend =
      movingAvg.length >= 2
        ? movingAvg[movingAvg.length - 1] - movingAvg[movingAvg.length - 2]
        : 0;

    return {
      rawPoints,
      avgPoints,
      rawPath,
      avgPath,
      svgWidth,
      svgHeight,
      currentWeight,
      currentAvg,
      trend,
    };
  }, [measurements]);

  return (
    <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📈</span>
          <span className="text-xs font-black text-[#F5F5F7]">Tendencia de Peso (7 Días)</span>
        </div>
        <div className="flex items-center gap-2">
          <strong className="text-xs font-black text-[#F5F5F7]">
            {graphData.currentWeight} kg
          </strong>
          <span
            className={`tag-pill text-[10px] font-black ${
              graphData.trend <= 0 ? 'tag-pill-green' : 'tag-pill-coral'
            }`}
          >
            {graphData.trend > 0 ? '↑' : graphData.trend < 0 ? '↓' : '•'}
            {Math.abs(graphData.trend).toFixed(1)} kg
          </span>
        </div>
      </div>

      {/* SVG Moving Average Graph */}
      <div className="w-full h-24 relative overflow-hidden rounded-xl bg-[#242426]/50 p-2">
        <svg
          viewBox={`0 0 ${graphData.svgWidth} ${graphData.svgHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Subtle Grid Lines */}
          <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Raw Daily Weight Path */}
          <path
            d={graphData.rawPath}
            fill="none"
            stroke="#8E8E93"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.5"
          />

          {/* 7-Day Moving Average Line */}
          <path
            d={graphData.avgPath}
            fill="none"
            stroke="#34C759"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Active Highlight Dot */}
          {graphData.avgPoints.length > 0 && (
            <>
              <circle
                cx={graphData.avgPoints[graphData.avgPoints.length - 1]?.x}
                cy={graphData.avgPoints[graphData.avgPoints.length - 1]?.y}
                r="5"
                fill="#34C759"
              />
              <circle
                cx={graphData.avgPoints[graphData.avgPoints.length - 1]?.x}
                cy={graphData.avgPoints[graphData.avgPoints.length - 1]?.y}
                r="2"
                fill="#FFFFFF"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-[#8E8E93] pt-1">
        <span>--- Peso diario</span>
        <span>— Media móvil ({graphData.currentAvg} kg)</span>
      </div>
    </div>
  );
};
