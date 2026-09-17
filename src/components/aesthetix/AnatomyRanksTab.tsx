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
} from '@/lib/muscleRanks';

export const AnatomyRanksTab: React.FC = () => {
  const { getMuscleTiers, getOverallRank, userWeightKg, setUserWeightKg } = useAesthetixStore();

  const muscleTiers = getMuscleTiers();
  const overall = getOverallRank();

  const [calcWeight, setCalcWeight] = useState<string>('80');
  const [calcReps, setCalcReps] = useState<string>('8');
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Map tiers to react-body-highlighter datasets
  const { anteriorData, posteriorData, customColors } = useMemo(() => {
    const antData: IExerciseData[] = [];
    const postData: IExerciseData[] = [];
    const colorsList: string[] = [];

    (Object.keys(ANATOMY_CONFIG) as AnatomicalMuscle[]).forEach((muscle) => {
      const tierInfo = muscleTiers[muscle] || TIERS_CATALOG.hierro;
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Overall Rank Hero Bento Card */}
      <div
        className="glass-surface rounded-[30px] p-5 border-t-white/20 shadow-xl space-y-3 relative overflow-hidden"
        style={{
          boxShadow: `0 10px 40px -10px ${overall.overallTier.color}33`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shadow-md animate-pulse"
              style={{ backgroundColor: overall.overallTier.color }}
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
              Rango Físico Global
            </span>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md"
            style={{
              backgroundColor: `${overall.overallTier.color}20`,
              color: overall.overallTier.color,
              borderColor: `${overall.overallTier.color}40`,
            }}
          >
            Nivel {overall.overallTier.level} / 10
          </span>
        </div>

        <div>
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ color: overall.overallTier.color }}
          >
            Rango {overall.overallTier.label}
          </h2>
          <p className="text-xs font-bold text-[#8E8E93] mt-1 leading-relaxed">
            {overall.overallTier.description}
          </p>
        </div>

        {/* Progress bar to next tier */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#8E8E93]">Progreso al siguiente rango</span>
            <span className="font-mono text-[#F5F5F7] font-black">
              {overall.progressToNext}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-sm"
              style={{
                width: `${Math.max(5, overall.progressToNext)}%`,
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
          Cada grupo muscular se ilumina según tu nivel de fuerza y récord estimado en el gimnasio.
        </p>

        {/* Models Side by Side */}
        <div className="flex justify-around items-center py-2">
          <div className="w-[45%] flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] mb-1">
              Frontal
            </span>
            <Model
              type="anterior"
              data={anteriorData}
              highlightedColors={customColors}
              style={{ width: '100%', height: 'auto', maxHeight: '240px' }}
              svgStyle={{ fill: 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <div className="w-[45%] flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] mb-1">
              Posterior
            </span>
            <Model
              type="posterior"
              data={posteriorData}
              highlightedColors={customColors}
              style={{ width: '100%', height: 'auto', maxHeight: '240px' }}
              svgStyle={{ fill: 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Muscle Group Tiers Breakdown Grid */}
      <div className="space-y-2">
        <div className="px-1 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
            DESGLOSE POR GRUPO MUSCULAR
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
            const tierInfo = muscleTiers[muscle] || TIERS_CATALOG.hierro;

            return (
              <div
                key={muscle}
                className="glass-surface rounded-[22px] p-3.5 flex items-center justify-between border-t-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <h4 className="text-xs font-black text-[#F5F5F7]">{config.name}</h4>
                    <p className="text-[10px] font-bold text-[#8E8E93]">
                      Nivel {tierInfo.level} • {tierInfo.description}
                    </p>
                  </div>
                </div>

                <span
                  className="px-3 py-1 rounded-full text-xs font-black border"
                  style={{
                    backgroundColor: `${tierInfo.color}15`,
                    color: tierInfo.color,
                    borderColor: `${tierInfo.color}35`,
                  }}
                >
                  {tierInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tier Ladder Catalog */}
      <div className="glass-surface rounded-[28px] p-4 border-t-white/10 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Jerarquía de Rangos (Hierro a Simétrico)
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {TIER_ORDER.map((tierKey) => {
            const tier = TIERS_CATALOG[tierKey];
            const isCurrent = overall.overallTier.tier === tier.tier;

            return (
              <div
                key={tierKey}
                className={`p-2.5 rounded-[18px] flex items-center gap-2 border transition-all ${
                  isCurrent
                    ? 'glass-pill-active border-white/40'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tier.color }}
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-black text-[#F5F5F7] block truncate">
                    {tier.label}
                  </span>
                  <span className="text-[9px] font-bold text-[#8E8E93]">Nivel {tier.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
