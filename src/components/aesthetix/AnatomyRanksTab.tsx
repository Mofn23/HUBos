'use client';

import React, { useMemo, useState } from 'react';
import Model from 'react-body-highlighter';
import type { IExerciseData, Muscle } from 'react-body-highlighter';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import {
  TIERS_CATALOG,
  TIER_ORDER,
  ANATOMY_CONFIG,
  AnatomicalMuscle,
  calculate1RM,
  getAllRanksCatalog,
} from '@/lib/muscleRanks';
import { useScrollLock } from '@/lib/useScrollLock';

export const AnatomyRanksTab: React.FC = () => {
  const { getMuscleTiers, getOverallRank, userWeightKg, setUserWeightKg } = useAesthetixStore();

  const muscleTiers = getMuscleTiers();
  const overall = getOverallRank();

  const [calcWeight, setCalcWeight] = useState<string>('80');
  const [calcReps, setCalcReps] = useState<string>('8');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isGlobalRanksOpen, setIsGlobalRanksOpen] = useState(false);

  useScrollLock(isCalcOpen || isGlobalRanksOpen);

  // Map tiers to react-body-highlighter datasets
  const { anteriorData, posteriorData, customColors } = useMemo(() => {
    const antData: IExerciseData[] = [];
    const postData: IExerciseData[] = [];
    const colorsList: string[] = [];

    (Object.keys(ANATOMY_CONFIG) as AnatomicalMuscle[]).forEach((muscle) => {
      const tierInfo = muscleTiers[muscle] || TIERS_CATALOG.rubi_2;
      const config = ANATOMY_CONFIG[muscle];

      if (!colorsList.includes(tierInfo.color)) {
        colorsList.push(tierInfo.color);
      }

      if (config.highlighterMusclesFront.length > 0) {
        antData.push({
          name: `${config.name} (${tierInfo.label})`,
          muscles: config.highlighterMusclesFront as Muscle[],
        });
      }

      if (config.highlighterMusclesBack.length > 0) {
        postData.push({
          name: `${config.name} (${tierInfo.label})`,
          muscles: config.highlighterMusclesBack as Muscle[],
        });
      }
    });

    return { anteriorData: antData, posteriorData: postData, customColors: colorsList };
  }, [muscleTiers]);

  const estimated1RMCalc = useMemo(() => {
    const w = parseFloat(calcWeight) || 0;
    const r = parseInt(calcReps, 10) || 0;
    return calculate1RM(w, r);
  }, [calcWeight, calcReps]);

  const allRanksDesc = useMemo(() => getAllRanksCatalog('desc'), []);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Overall Rank Hero Bento Card (Symmetry OLED Style) */}
      <div
        className="glass-surface rounded-[30px] p-5 border-t-white/20 shadow-2xl space-y-4 relative overflow-hidden"
        style={{
          boxShadow: `0 12px 40px -10px ${overall.overallTier.color}40`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shadow-md animate-pulse"
              style={{ backgroundColor: overall.overallTier.color }}
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
              RANGO SYMMETRY
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsGlobalRanksOpen(true)}
            className="px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 hover:bg-white/10"
            style={{
              backgroundColor: `${overall.overallTier.color}20`,
              color: overall.overallTier.color,
              borderColor: `${overall.overallTier.color}40`,
            }}
          >
            <span>Rangos Globales</span>
            <span>→</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <h2
              className="text-3xl font-black tracking-tight uppercase truncate"
              style={{ color: overall.overallTier.color }}
            >
              {overall.overallTier.label}
            </h2>
            <p className="text-xs font-bold text-[#E5E5EA]">
              {overall.overallTier.percentile
                ? `Eres parte del ${overall.overallTier.percentile.toLowerCase()} más fuerte`
                : overall.overallTier.description}
            </p>
            <p className="text-[11px] font-bold text-[#8E8E93]">
              Nivel {overall.overallTier.level} / 25 • {overall.overallTier.description}
            </p>
          </div>

          {/* Rank Badge Graphic */}
          <div
            onClick={() => setIsGlobalRanksOpen(true)}
            className="w-16 h-16 rounded-[22px] bg-white/[0.04] p-1.5 flex items-center justify-center shrink-0 border border-white/15 cursor-pointer active:scale-95 transition-transform"
            style={{
              boxShadow: `0 0 20px ${overall.overallTier.color}40`,
            }}
          >
            <img
              src={overall.overallTier.badgeImage || '/ranks/rubi_2.png'}
              alt={overall.overallTier.label}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Progress bar to next tier */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#8E8E93]">Progreso al siguiente escalón</span>
            <span className="font-mono text-[#F5F5F7] font-black">
              {overall.progressToNext}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-sm"
              style={{
                width: `${Math.max(8, overall.progressToNext)}%`,
                backgroundColor: overall.overallTier.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive 2D Anatomical Human Model */}
      <div className="glass-surface-elevated rounded-[30px] p-5 border-t-white/20 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-base">🧬</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
              Mapa Anatómico de Proporciones
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#8E8E93]">Color = Rango Muscular</span>
        </div>

        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Cada grupo muscular se ilumina con el tono exacto de tu rango en Symmetry.
        </p>

        {/* Models Side by Side */}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="glass-surface rounded-[24px] p-3 flex flex-col items-center border border-white/5 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] mb-2">
              Vista Frontal
            </span>
            <div className="w-full flex items-center justify-center h-[260px] py-1">
              <Model
                type="anterior"
                data={anteriorData}
                highlightedColors={customColors}
                style={{
                  width: '125px',
                  height: '250px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                svgStyle={{
                  fill: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'visible',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                }}
              />
            </div>
          </div>

          <div className="glass-surface rounded-[24px] p-3 flex flex-col items-center border border-white/5 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] mb-2">
              Vista Posterior
            </span>
            <div className="w-full flex items-center justify-center h-[260px] py-1">
              <Model
                type="posterior"
                data={posteriorData}
                highlightedColors={customColors}
                style={{
                  width: '125px',
                  height: '250px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                svgStyle={{
                  fill: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'visible',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Muscle Group Tiers Breakdown Grid with Badges */}
      <div className="space-y-2">
        <div className="px-1 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
            RANKINGS MUSCULARES
          </h3>
          <button
            onClick={() => setIsCalcOpen(!isCalcOpen)}
            className="text-[11px] font-bold text-[#64D2FF] hover:underline"
          >
            {isCalcOpen ? 'Ocultar Calculadora' : 'Calculadora 1RM'}
          </button>
        </div>

        {/* Optional 1RM Quick Calculator Widget */}
        {isCalcOpen && (
          <div className="glass-surface rounded-[24px] p-4 border border-[#64D2FF]/30 space-y-3 animate-fade-in">
            <h4 className="text-xs font-black text-[#64D2FF] flex items-center gap-1.5">
              <span>⚡</span>
              <span>Calculadora de 1 Repetición Máxima (1RM Epley)</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full glass-pill rounded-[14px] px-3 py-2 text-xs font-black text-center text-[#F5F5F7]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Reps</label>
                <input
                  type="number"
                  value={calcReps}
                  onChange={(e) => setCalcReps(e.target.value)}
                  className="w-full glass-pill rounded-[14px] px-3 py-2 text-xs font-black text-center text-[#F5F5F7]"
                />
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-[14px] bg-[#64D2FF]/15 border border-[#64D2FF]/30">
                <span className="text-[9px] font-bold text-[#64D2FF]">1RM Estimado</span>
                <span className="text-base font-black text-[#F5F5F7] font-mono">
                  {estimated1RMCalc} kg
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(ANATOMY_CONFIG) as AnatomicalMuscle[]).map((muscle) => {
            const config = ANATOMY_CONFIG[muscle];
            const tierInfo = muscleTiers[muscle] || TIERS_CATALOG.rubi_2;

            return (
              <div
                key={muscle}
                className="glass-surface rounded-[22px] p-3 flex items-center justify-between border-t-white/10 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl shrink-0">{config.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[#F5F5F7] truncate">{config.name}</h4>
                    <p className="text-[10px] font-bold text-[#8E8E93] truncate">
                      {tierInfo.percentile ? `${tierInfo.percentile} • ` : ''}{tierInfo.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-black border"
                    style={{
                      backgroundColor: `${tierInfo.color}15`,
                      color: tierInfo.color,
                      borderColor: `${tierInfo.color}35`,
                    }}
                  >
                    {tierInfo.label}
                  </span>

                  {/* Muscle Rank Badge Thumbnail */}
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] p-1 flex items-center justify-center border border-white/10 shrink-0">
                    <img
                      src={tierInfo.badgeImage || '/ranks/rubi_2.png'}
                      alt={tierInfo.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Global Ranks Modal (Symmetry 25-Tier Scale) */}
      {isGlobalRanksOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsGlobalRanksOpen(false)}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          <div
            className="relative w-full max-w-md glass-surface-elevated rounded-[32px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[85vh] flex flex-col overscroll-contain"
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-sm font-black text-[#F5F5F7]">Rangos Globales</h3>
                <p className="text-[10px] font-bold text-[#8E8E93]">
                  Escala oficial de fuerza y simetría
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGlobalRanksOpen(false)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* List of 25 Ranks */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {allRanksDesc.map((tier) => {
                const isCurrent = overall.overallTier.tier === tier.tier;
                return (
                  <div
                    key={tier.tier}
                    className={`p-3 rounded-[20px] flex items-center justify-between gap-3 border transition-all ${
                      isCurrent
                        ? 'bg-[#F43F5E]/15 border-[#F43F5E]/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'glass-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] bg-white/[0.04] p-1 flex items-center justify-center shrink-0 border border-white/10">
                        <img
                          src={tier.badgeImage || '/ranks/rubi_2.png'}
                          alt={tier.label}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <p
                          className="text-xs font-black"
                          style={{ color: isCurrent ? tier.color : '#F5F5F7' }}
                        >
                          {tier.label}
                        </p>
                        <p className="text-[10px] font-bold text-[#8E8E93]">
                          {tier.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="text-xs font-mono font-black"
                        style={{ color: isCurrent ? tier.color : '#8E8E93' }}
                      >
                        {tier.percentile || `Nivel ${tier.level}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsGlobalRanksOpen(false)}
              className="w-full py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-98 transition-all shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
