'use client';

import React, { useMemo, useState } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { getDailyAesthetixActivity, getLocalDateKey } from '@/lib/aesthetixActivity';

interface AppleActivityRingsCardProps {
  history: WorkoutHistoryItem[];
  onOpenLiveWorkout?: () => void;
}

export const AppleActivityRingsCard: React.FC<AppleActivityRingsCardProps> = ({
  history,
  onOpenLiveWorkout,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const todayStr = useMemo(() => getLocalDateKey(new Date()), []);
  const stats = useMemo(() => {
    const daily = getDailyAesthetixActivity(history, todayStr);
    return {
      move: daily.movementCalories,
      moveGoal: 600,
      exercise: daily.exerciseMinutes,
      exerciseGoal: 30,
      sets: daily.completedSets,
      setsGoal: 12,
    };
  }, [history, todayStr]);

  const movePct = Math.min(stats.move / stats.moveGoal, 1.4);
  const exercisePct = Math.min(stats.exercise / stats.exerciseGoal, 1.5);
  const setsPct = Math.min(stats.sets / stats.setsGoal, 1.5);

  const allClosed = movePct >= 1 && exercisePct >= 1 && setsPct >= 1;

  // Concentric ring radii and stroke widths
  // viewBox = 0 0 260 260. Center = 130, 130
  const center = 130;
  const strokeWidth = 22;

  // Ring 1 (Move / Red): Radius = 96
  const rMove = 96;
  const cMove = 2 * Math.PI * rMove; // ~603.18
  const offsetMove = cMove - (cMove * Math.min(movePct, 1));

  // Ring 2 (Exercise / Green): Radius = 71
  const rExercise = 71;
  const cExercise = 2 * Math.PI * rExercise; // ~446.1
  const offsetExercise = cExercise - (cExercise * Math.min(exercisePct, 1));

  // Ring 3 (Stand / Cyan): Radius = 46
  const rStand = 46;
  const cStand = 2 * Math.PI * rStand; // ~289.02

  // Terminal cap angle calculation for 3D overlay shadow
  const getCapCoords = (radius: number, pct: number) => {
    const angle = (pct * 360 - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const capMove = getCapCoords(rMove, Math.min(movePct, 1));
  const capExercise = getCapCoords(rExercise, Math.min(exercisePct, 1));
  const capStand = getCapCoords(rStand, Math.min(setsPct, 1));

  return (
    <div className="fitness-card p-5 relative overflow-hidden shadow-2xl border border-white/[0.08]">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FA114F]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#A1F524]/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <h2 className="text-xl font-black text-white tracking-tight">Actividad de hoy</h2>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all ${
            allClosed
              ? 'bg-[#A1F524]/15 border-[#A1F524]/40 text-[#A1F524] shadow-[0_0_12px_rgba(161,245,36,0.3)]'
              : 'bg-white/[0.06] border-white/10 text-[#8E8E93]'
          }`}
        >
          <span>{allClosed ? '✓' : '○'}</span>
          <span>{allClosed ? '3 metas alcanzadas' : `${[movePct >= 1, exercisePct >= 1, setsPct >= 1].filter(Boolean).length}/3 metas`}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowExplanation((shown) => !shown)}
        aria-expanded={showExplanation}
        className="relative z-10 -mt-1 mb-1 text-[11px] font-bold text-[#64D2FF] hover:text-white transition-colors"
      >
        {showExplanation ? 'Ocultar explicación' : '¿Qué mide cada anillo?'}
      </button>
      {showExplanation && (
        <div className="relative z-10 mb-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] p-3 text-[11px] leading-relaxed text-[#C7C7CC]">
          <p>Los anillos solo avanzan con entrenamientos guardados:</p>
          <p className="mt-1"><strong className="text-[#FA114F]">Movimiento:</strong> calorías estimadas con el tiempo y volumen de la sesión; Aesthetix no usa un sensor de movimiento.</p>
          <p><strong className="text-[#A1F524]">Ejercicio:</strong> minutos registrados.</p>
          <p><strong className="text-[#00F0FF]">Series:</strong> series completadas, no horas de pie.</p>
          <p className="mt-1 text-[#8E8E93]">Metas de referencia: 600 kcal estimadas, 30 min y 12 series.</p>
        </div>
      )}

      {/* Center Apple Fitness Rings */}
      <div className="flex items-center justify-center my-3 relative z-10">
        <svg
          className="w-56 h-56 transform -rotate-90 filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
          viewBox="0 0 260 260"
        >
          <defs>
            {/* Move Gradient: Red to Coral */}
            <linearGradient id="appleMoveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FA114F" />
              <stop offset="100%" stopColor="#FF2D55" />
            </linearGradient>

            {/* Exercise Gradient: Neon Green to Apple Lime */}
            <linearGradient id="appleExerciseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A1F524" />
              <stop offset="100%" stopColor="#30D158" />
            </linearGradient>

            {/* Stand Gradient: Electric Cyan to Vivid Sky */}
            <linearGradient id="appleStandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#0A84FF" />
            </linearGradient>

            {/* Shadow filter for 3D cap */}
            <filter id="capShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="-2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* 1. Track Backgrounds */}
          <circle
            cx={center}
            cy={center}
            r={rMove}
            fill="none"
            stroke="rgba(250, 17, 79, 0.16)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={rExercise}
            fill="none"
            stroke="rgba(161, 245, 36, 0.16)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={rStand}
            fill="none"
            stroke="rgba(0, 240, 255, 0.16)"
            strokeWidth={strokeWidth}
          />

          {/* 2. Active Arcs */}
          {/* Move Arc */}
          <circle
            cx={center}
            cy={center}
            r={rMove}
            fill="none"
            stroke="url(#appleMoveGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={cMove}
            strokeDashoffset={offsetMove}
            className="transition-all duration-1000 ease-out"
          />

          {/* Exercise Arc */}
          <circle
            cx={center}
            cy={center}
            r={rExercise}
            fill="none"
            stroke="url(#appleExerciseGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={cExercise}
            strokeDashoffset={offsetExercise}
            className="transition-all duration-1000 ease-out"
          />

          {/* Stand Arc */}
          <circle
            cx={center}
            cy={center}
            r={rStand}
            fill="none"
            stroke="url(#appleStandGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={cStand}
            strokeDashoffset={cStand - cStand * Math.min(setsPct, 1)}
            className="transition-all duration-1000 ease-out"
          />

          {/* 3. Tactile 3D Caps at the tip with shadow */}
          {movePct > 0.05 && (
            <circle
              cx={capMove.x}
              cy={capMove.y}
              r={strokeWidth / 2 - 0.5}
              fill="#FF2D55"
              filter="url(#capShadow)"
            />
          )}

          {exercisePct > 0.05 && (
            <circle
              cx={capExercise.x}
              cy={capExercise.y}
              r={strokeWidth / 2 - 0.5}
              fill="#A1F524"
              filter="url(#capShadow)"
            />
          )}

          {setsPct > 0.05 && (
            <circle
              cx={capStand.x}
              cy={capStand.y}
              r={strokeWidth / 2 - 0.5}
              fill="#00F0FF"
              filter="url(#capShadow)"
            />
          )}
        </svg>
      </div>

      {/* Metrics Legend under Rings */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.08] relative z-10 text-center">
        {/* Move */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#FA114F] shadow-[0_0_8px_#FA114F]" />
            <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wide">Movimiento</span>
          </div>
          <div className="text-sm font-black text-white">
            <span className="text-[#FA114F]">{stats.move}</span>
            <span className="text-[#8E8E93] text-xs font-bold">/{stats.moveGoal}</span>
          </div>
            <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest">KCAL EST.</span>
        </div>

        {/* Exercise */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#A1F524] shadow-[0_0_8px_#A1F524]" />
            <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wide">Ejercicio</span>
          </div>
          <div className="text-sm font-black text-white">
            <span className="text-[#A1F524]">{stats.exercise}</span>
            <span className="text-[#8E8E93] text-xs font-bold">/{stats.exerciseGoal}</span>
          </div>
          <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest">MIN</span>
        </div>

        {/* Stand / Sets */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <span className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wide">Series</span>
          </div>
          <div className="text-sm font-black text-white">
            <span className="text-[#00F0FF]">{stats.sets}</span>
            <span className="text-[#8E8E93] text-xs font-bold">/{stats.setsGoal}</span>
          </div>
            <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest">COMPLETADAS</span>
        </div>
      </div>
    </div>
  );
};
