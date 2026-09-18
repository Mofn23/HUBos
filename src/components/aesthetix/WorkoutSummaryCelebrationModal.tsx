'use client';

import React, { useMemo } from 'react';
import { WorkoutHistoryItem } from '@/types/workout';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useScrollLock } from '@/lib/useScrollLock';

interface WorkoutSummaryCelebrationModalProps {
  summary: WorkoutHistoryItem;
  onClose: () => void;
}

export const WorkoutSummaryCelebrationModal: React.FC<WorkoutSummaryCelebrationModalProps> = ({
  summary,
  onClose,
}) => {
  useScrollLock(true);

  const { getOverallRank, currentStreak, getPreviousSessionForDay } = useAesthetixStore();
  const rank = getOverallRank();

  // Find previous workout session for the same day/routine from history
  const previousSession = useMemo(() => {
    return getPreviousSessionForDay(summary.routineName, summary.dayName);
  }, [getPreviousSessionForDay, summary.routineName, summary.dayName]);

  // Biomechanical & Progressive Overload Analysis with Memory
  const analysis = useMemo(() => {
    const highlights: string[] = [];
    let volumeDiffPercent = 0;

    if (previousSession && previousSession.totalVolumeKg > 0) {
      const diffKg = summary.totalVolumeKg - previousSession.totalVolumeKg;
      volumeDiffPercent = Math.round((diffKg / previousSession.totalVolumeKg) * 100);

      // Compare exercises
      summary.exercises.forEach((currEx) => {
        const prevEx = previousSession.exercises.find((p) => p.exerciseId === currEx.exerciseId);
        if (prevEx) {
          const currMax = Math.max(...currEx.sets.filter((s) => s.completed).map((s) => s.weightKg), 0);
          const prevMax = Math.max(...prevEx.sets.filter((s) => s.completed).map((s) => s.weightKg), 0);
          if (currMax > prevMax && prevMax > 0) {
            const gain = currMax - prevMax;
            const pct = Math.round((gain / prevMax) * 100);
            highlights.push(`+${gain}kg en ${currEx.exerciseName} (+${pct}% sobrecarga)`);
          }
        }
      });
    }

    let coachAdvice = '';
    if (summary.prCount > 0) {
      coachAdvice = `¡Sesión legendaria, Samuel! Has destrozado ${summary.prCount} récord${
        summary.prCount > 1 ? 's' : ''
      } personal${summary.prCount > 1 ? 'es' : ''}. Tu estimulación de fibras de contracción rápida consolida tu nivel en la liga ${rank.overallTier.label}.`;
    } else if (volumeDiffPercent > 0) {
      coachAdvice = `¡Sobrecarga progresiva óptima! Incrementaste el tonelaje total un +${volumeDiffPercent}% respecto a tu sesión anterior de este protocolo. Excelente adaptación del sistema nervioso central.`;
    } else {
      coachAdvice = `¡Excelente consistencia biomecánica! Completaste ${summary.totalSets} series efectivas manteniendo la tensión mecánica en rango de hipertrofia óptimo para tu físico.`;
    }

    return { highlights, volumeDiffPercent, coachAdvice };
  }, [summary, previousSession, rank]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in overscroll-contain select-none">
      {/* Dimmed backdrop with intense glass refraction */}
      <div className="fixed inset-0 bg-black/92 backdrop-blur-2xl" />

      {/* Confetti / celebration ambient particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#34C759]/20 blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[#FFD60A]/15 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-[#64D2FF]/20 blur-[110px]" />
      </div>

      {/* Celebration Card */}
      <div className="relative w-full max-w-sm sm:max-w-md glass-surface-elevated rounded-[36px] p-6 z-10 border border-white/20 shadow-[0_0_60px_rgba(52,199,89,0.35)] animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Top Trophy & Streak Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#34C759]/20 border border-[#34C759]/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(52,199,89,0.4)] animate-bounce">
              🏆
            </div>
            {/* Fire Streak Badge */}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#FF9500] text-black text-[11px] font-black flex items-center gap-1 shadow-md">
              <span>🔥</span>
              <span>{currentStreak}d</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#34C759] block">
              ¡Entrenamiento Completado!
            </span>
            <h2 className="text-xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {summary.routineName}
            </h2>
            <p className="text-xs font-bold text-[#8E8E93]">{summary.dayName}</p>
          </div>
        </div>

        {/* Big 3 Stats Bento Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass-pill p-3 rounded-[20px] text-center border-t-white/15">
            <span className="text-[10px] font-bold text-[#8E8E93] block">Duración</span>
            <span className="text-base font-black text-[#F5F5F7] font-mono">
              {summary.durationMinutes}m
            </span>
          </div>

          <div className="glass-pill p-3 rounded-[20px] text-center border-t-white/15">
            <span className="text-[10px] font-bold text-[#8E8E93] block">Volumen</span>
            <span className="text-base font-black text-[#34C759] font-mono">
              {Number(summary.totalVolumeKg).toLocaleString('es-CO')}
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">kg</span>
          </div>

          <div className="glass-pill p-3 rounded-[20px] text-center border-t-white/15">
            <span className="text-[10px] font-bold text-[#8E8E93] block">Series</span>
            <span className="text-base font-black text-[#64D2FF] font-mono">
              {summary.totalSets}
            </span>
          </div>
        </div>

        {/* New PRs Unlocked Banner */}
        {summary.prCount > 0 && (
          <div className="p-3.5 rounded-[22px] bg-[#FFD60A]/15 border border-[#FFD60A]/35 space-y-1.5 shadow-[0_0_25px_rgba(255,214,10,0.2)]">
            <div className="flex items-center gap-2 text-xs font-black text-[#FFD60A]">
              <span className="text-base">🔥</span>
              <span>¡{summary.prCount} Récord{summary.prCount > 1 ? 's' : ''} Personal{summary.prCount > 1 ? 'es' : ''} Desbloqueado{summary.prCount > 1 ? 's' : ''}!</span>
            </div>
            <p className="text-[11px] font-bold text-[#E5E5EA] leading-relaxed">
              Tus nuevas marcas han quedado guardadas permanentemente en tu perfil y computan en tu rango Symmetry.
            </p>
          </div>
        )}

        {/* AI Coach Analysis with Memory */}
        <div className="glass-surface p-4 rounded-[24px] border border-white/15 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
                Diagnóstico del Coach IA
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-black text-[#64D2FF]">
              Memoria Activa
            </span>
          </div>

          <p className="text-xs text-[#E5E5EA] font-medium leading-relaxed">
            {analysis.coachAdvice}
          </p>

          {/* Highlights comparison with previous day */}
          {analysis.highlights.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#34C759]">
                Ganancias vs Sesión Anterior:
              </span>
              <ul className="space-y-1 text-xs font-bold text-[#F5F5F7]">
                {analysis.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-[#34C759] text-[11px]">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Symmetry Rank Status */}
        <div className="glass-surface p-3.5 rounded-[22px] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-full p-1 flex items-center justify-center shrink-0 border border-white/15 shadow-sm"
              style={{ backgroundColor: `${rank.overallTier.color}20` }}
            >
              <img
                src={rank.overallTier.badgeImage || '/ranks/rubi_2.png'}
                alt={rank.overallTier.label}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#8E8E93] block">Rango Symmetry</span>
              <h5
                className="text-sm font-black truncate uppercase tracking-tight"
                style={{ color: rank.overallTier.color }}
              >
                {rank.overallTier.label}
              </h5>
            </div>
          </div>

          <span className="text-[11px] font-mono font-black text-[#34C759] shrink-0">
            {rank.progressToNext}% prox.
          </span>
        </div>

        {/* Finish button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-full bg-[#34C759] hover:bg-[#34C759]/90 active:scale-98 text-black font-black text-sm tracking-tight shadow-[0_4px_25px_rgba(52,199,89,0.35)] transition-all"
        >
          Guardar & Volver al HUB
        </button>
      </div>
    </div>
  );
};
