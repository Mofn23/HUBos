'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { useScrollLock } from '@/lib/useScrollLock';

interface WorkoutSummaryCelebrationModalProps {
  summary: WorkoutHistoryItem;
  onClose: () => void;
}

const CONFETTI = Array.from({ length: 14 }, (_, index) => ({
  left: (index * 7.3) % 100,
  delay: (index % 5) * 80,
  dx: (index % 2 === 0 ? 1 : -1) * (12 + ((index * 13) % 54)),
  color: ['#A1F524', '#FFD60A', '#64D2FF', '#FA114F'][index % 4],
}));

/** Cuenta de 0 al objetivo respetando prefers-reduced-motion. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    // Respaldo: aunque el navegador pause rAF, el número final siempre aparece.
    const settle = setTimeout(() => setValue(target), duration + 120);

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}

export const WorkoutSummaryCelebrationModal: React.FC<WorkoutSummaryCelebrationModalProps> = ({
  summary,
  onClose,
}) => {
  useScrollLock(true);

  const { getOverallRank, currentStreak, history, sessionStartRank } = useAesthetixStore();
  const { userName } = useHubStore();
  const rank = getOverallRank();
  const animatedVolume = useCountUp(summary.totalVolumeKg, 1100);

  const rankedUp = Boolean(sessionStartRank && rank.overallTier.level > sessionStartRank.level);
  const celebrate = rankedUp || summary.prCount > 0;

  // La sesión recién guardada ya está en history: se excluye para comparar de verdad.
  const previousSession = useMemo(
    () =>
      history.find(
        (item) =>
          item.id !== summary.id &&
          item.routineName === summary.routineName &&
          item.dayName === summary.dayName
      ) || null,
    [history, summary]
  );

  const analysis = useMemo(() => {
    const highlights: string[] = [];
    let volumeDiffPercent = 0;

    if (previousSession && previousSession.totalVolumeKg > 0) {
      const diffKg = summary.totalVolumeKg - previousSession.totalVolumeKg;
      volumeDiffPercent = Math.round((diffKg / previousSession.totalVolumeKg) * 100);

      summary.exercises.forEach((currEx) => {
        const prevEx = previousSession.exercises.find((p) => p.exerciseId === currEx.exerciseId);
        if (prevEx) {
          const currMax = Math.max(
            ...currEx.sets.filter((s) => s.completed).map((s) => s.weightKg),
            0
          );
          const prevMax = Math.max(
            ...prevEx.sets.filter((s) => s.completed).map((s) => s.weightKg),
            0
          );
          if (currMax > prevMax && prevMax > 0) {
            const gain = currMax - prevMax;
            const pct = Math.round((gain / prevMax) * 100);
            highlights.push(`+${gain} kg en ${currEx.exerciseName} (+${pct}% de sobrecarga)`);
          }
        }
      });
    }

    let coachAdvice = '';
    if (summary.prCount > 0) {
      coachAdvice = `¡Sesión legendaria, ${userName}! Superaste ${summary.prCount} récord${
        summary.prCount > 1 ? 's' : ''
      } personal${summary.prCount > 1 ? 'es' : ''}. La estimulación de fibras de contracción rápida consolida tu nivel en ${rank.overallTier.label}.`;
    } else if (volumeDiffPercent > 0) {
      coachAdvice = `Sobrecarga progresiva limpia: +${volumeDiffPercent}% de tonelaje respecto a tu última sesión de este protocolo. Excelente adaptación del sistema nervioso central.`;
    } else {
      coachAdvice = `Consistencia biomecánica: ${summary.totalSets} series efectivas manteniendo la tensión mecánica en rango de hipertrofia. El siguiente paso es subir carga o una repetición en el básico principal.`;
    }

    return { highlights, volumeDiffPercent, coachAdvice };
  }, [summary, previousSession, rank, userName]);

  const exerciseBreakdown = useMemo(() => {
    const rows = summary.exercises
      .map((exercise) => {
        const doneSets = exercise.sets.filter((set) => set.completed);
        if (doneSets.length === 0) return null;
        const volume = doneSets.reduce((total, set) => total + set.weightKg * set.reps, 0);
        const topWeight = Math.max(...doneSets.map((set) => set.weightKg), 0);
        return {
          id: exercise.exerciseId,
          name: exercise.exerciseName,
          sets: doneSets.length,
          topWeight,
          volume,
        };
      })
      .filter((row): row is { id: string; name: string; sets: number; topWeight: number; volume: number } => Boolean(row));

    const maxVolume = Math.max(...rows.map((row) => row.volume), 1);
    return { rows, maxVolume };
  }, [summary]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in overscroll-contain select-none">
      <div className="fixed inset-0 bg-black/85" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar fitness-surface-elevated rounded-[28px] border border-white/10 p-5 space-y-4 animate-scale-up">
        {celebrate && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 overflow-hidden" aria-hidden="true">
            {CONFETTI.map((piece, index) => (
              <span
                key={index}
                className="summary-confetti-piece"
                style={
                  {
                    left: `${piece.left}%`,
                    backgroundColor: piece.color,
                    animationDelay: `${piece.delay}ms`,
                    '--dx': `${piece.dx}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* Héroe: rango nuevo o cierre de sesión */}
        <div className="relative flex flex-col items-center gap-2 text-center">
          {rankedUp && sessionStartRank ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFD60A]">
                Subiste de rango
              </span>
              <div className="relative mt-1">
                <div
                  className="absolute inset-0 rounded-full blur-2xl animate-rank-glow"
                  style={{ backgroundColor: `${rank.overallTier.color}66` }}
                />
                <img
                  src={rank.overallTier.badgeImage || '/ranks/rubi_2.png'}
                  alt={rank.overallTier.label}
                  className="relative h-24 w-24 object-contain animate-rank-pop"
                />
              </div>
              <h2
                className="text-2xl font-black tracking-tight"
                style={{ color: rank.overallTier.color }}
              >
                {rank.overallTier.label}
              </h2>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Antes: {sessionStartRank.label}
              </p>
            </>
          ) : (
            <>
              <div className="relative mt-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#A1F524]/40 bg-[#A1F524]/15 text-4xl shadow-[0_0_35px_rgba(161,245,36,0.25)]">
                  🏆
                </div>
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-[#FF9500] px-2.5 py-0.5 text-[11px] font-black text-black shadow-md">
                  <span aria-hidden="true">🔥</span>
                  <span>{currentStreak}d</span>
                </div>
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#A1F524]">
                Entrenamiento completado
              </span>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Mantienes {rank.overallTier.label}
              </p>
            </>
          )}

          <h2 className="text-xl font-black tracking-tight text-[#F5F5F7]">
            {summary.routineName}
          </h2>
          <p className="-mt-1 text-xs font-bold text-[#8E8E93]">
            {summary.dayName} · {summary.date}
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[18px] border border-white/[0.05] bg-[#242426] p-3 text-center">
            <span className="block text-[9px] font-bold text-[#8E8E93]">Duración</span>
            <span className="mt-1 block font-mono text-base font-black text-[#F5F5F7]">
              {summary.durationMinutes}
              <span className="text-[10px] text-[#8E8E93]">m</span>
            </span>
          </div>
          <div className="rounded-[18px] border border-white/[0.05] bg-[#242426] p-3 text-center">
            <span className="block text-[9px] font-bold text-[#8E8E93]">Volumen</span>
            <span className="mt-1 block font-mono text-base font-black text-[#A1F524] tabular-nums">
              {animatedVolume.toLocaleString('es-CO')}
            </span>
            <span className="block text-[9px] font-bold text-[#8E8E93]">kg</span>
          </div>
          <div className="rounded-[18px] border border-white/[0.05] bg-[#242426] p-3 text-center">
            <span className="block text-[9px] font-bold text-[#8E8E93]">Series</span>
            <span className="mt-1 block font-mono text-base font-black text-[#64D2FF]">
              {summary.totalSets}
            </span>
          </div>
        </div>

        {/* Comparación con la sesión anterior */}
        {previousSession && previousSession.totalVolumeKg > 0 && (
          <div className="space-y-2 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-[#8E8E93]">
                Volumen vs. sesión anterior
              </span>
              <span
                className={`text-[11px] font-black ${
                  analysis.volumeDiffPercent >= 0 ? 'text-[#A1F524]' : 'text-[#FF9F0A]'
                }`}
              >
                {analysis.volumeDiffPercent >= 0 ? '+' : ''}
                {analysis.volumeDiffPercent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#A1F524] transition-[width] duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    (summary.totalVolumeKg /
                      Math.max(previousSession.totalVolumeKg, summary.totalVolumeKg, 1)) *
                      100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-[#636366]">
              Anterior: {previousSession.totalVolumeKg.toLocaleString('es-CO')} kg
            </p>
          </div>
        )}

        {/* Récords */}
        {summary.prCount > 0 && (
          <div className="rounded-[20px] border border-[#FFD60A]/35 bg-[#FFD60A]/12 p-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#FFD60A]">
              <span aria-hidden="true">🔥</span>
              <span>
                ¡{summary.prCount} récord{summary.prCount > 1 ? 's' : ''} personal
                {summary.prCount > 1 ? 'es' : ''}!
              </span>
            </div>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-[#E5E5EA]">
              Tus marcas quedaron guardadas y cuentan para tu rango Symmetry.
            </p>
          </div>
        )}

        {/* Desglose de ejercicios */}
        {exerciseBreakdown.rows.length > 0 && (
          <div className="space-y-2.5 rounded-[22px] border border-white/[0.08] bg-[#1C1C1E] p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8E8E93]">
                Lo que hiciste
              </h4>
              <span className="text-[10px] font-bold text-[#636366]">
                {exerciseBreakdown.rows.length} ejercicios
              </span>
            </div>

            {exerciseBreakdown.rows.map((row) => (
              <div key={row.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-bold capitalize text-[#F5F5F7]">
                    {row.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-[#8E8E93]">
                    {row.sets}× · {row.topWeight} kg
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-[#64D2FF]"
                    style={{
                      width: `${Math.max(6, (row.volume / exerciseBreakdown.maxVolume) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diagnóstico */}
        <div className="space-y-2.5 rounded-[22px] border border-white/10 bg-[#1C1C1E] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🤖</span>
              <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8E8E93]">
                Diagnóstico del coach
              </h4>
            </div>
            {previousSession && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px] font-black text-[#64D2FF]">
                Con memoria
              </span>
            )}
          </div>

          <p className="text-xs font-medium leading-relaxed text-[#E5E5EA]">
            {analysis.coachAdvice}
          </p>

          {analysis.highlights.length > 0 && (
            <div className="space-y-1 border-t border-white/[0.08] pt-2">
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#A1F524]">
                Ganancias vs. sesión anterior
              </span>
              {analysis.highlights.map((highlight, index) => (
                <p key={index} className="flex items-start gap-1.5 text-[11px] font-bold text-[#F5F5F7]">
                  <span className="text-[#A1F524]">✓</span>
                  <span>{highlight}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Rango actual */}
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[#1C1C1E] p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 p-1"
              style={{ backgroundColor: `${rank.overallTier.color}20` }}
            >
              <img
                src={rank.overallTier.badgeImage || '/ranks/rubi_2.png'}
                alt={rank.overallTier.label}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] font-bold text-[#8E8E93]">Rango Symmetry</span>
              <h5
                className="truncate text-sm font-black uppercase tracking-tight"
                style={{ color: rank.overallTier.color }}
              >
                {rank.overallTier.label}
              </h5>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="block font-mono text-[11px] font-black text-[#A1F524]">
              {rank.progressToNext}%
            </span>
            <span className="block text-[9px] font-bold text-[#8E8E93]">al siguiente</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-[#A1F524] py-4 text-sm font-black tracking-tight text-black shadow-[0_4px_25px_rgba(161,245,36,0.35)] transition-transform active:scale-[0.98] motion-reduce:active:scale-100"
        >
          Listo, volver
        </button>
      </div>
    </div>
  );
};
