'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { formatCurrency } from '@/lib/utils';
import { IconSparkles, IconZap } from '../common/Icons';

export const InsightsView: React.FC = () => {
  const { subscriptions } = useSubsStore();
  const { currency } = useHubStore();

  const summary = calculateFinancialSummary(subscriptions);
  const costPerDay = Math.round(summary.monthlyTotal / 30);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Daily Cost Metric */}
      <div className="fitness-card p-5 rounded-3xl flex items-center justify-between border border-white/[0.08]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1F524]">
            Gasto Diario Promedio
          </span>
          <h3 className="text-2xl font-black text-white mt-0.5 tracking-tight">
            {formatCurrency(costPerDay, currency)}{' '}
            <span className="text-xs font-semibold text-[#8E8E93]">/ día</span>
          </h3>
          <p className="text-xs text-[#8E8E93] mt-0.5">En suscripciones y servicios fijos</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#A1F524]/15 border border-[#A1F524]/30 flex items-center justify-center text-[#A1F524]">
          <IconZap className="w-6 h-6 text-[#A1F524]" />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="fitness-card p-5 rounded-3xl space-y-4 border border-white/[0.08]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Distribución por Categoría
        </h3>

        <div className="space-y-3.5">
          {summary.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white">{cat.category} ({cat.count})</span>
                <span className="text-[#A1F524] font-bold">
                  {formatCurrency(cat.monthlyAmount, currency)}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">({Math.round(cat.percentage)}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#A1F524] transition-all duration-700"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Optimization Tips */}
      <div className="fitness-card p-5 rounded-3xl space-y-3.5 border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-4 h-4 text-[#A1F524]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Recomendaciones de Ahorro IA
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-[#8E8E93]">
          <div className="bg-[#242426] p-3.5 rounded-2xl border border-white/5 space-y-1">
            <p className="font-bold text-white">💡 Optimización de Streaming</p>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              Tienes múltiples servicios de entretenimiento activos. Alternar entre Netflix y YouTube Premium mes a mes podría ahorrarte hasta $240.000 COP al año.
            </p>
          </div>

          <div className="bg-[#242426] p-3.5 rounded-2xl border border-white/5 space-y-1">
            <p className="font-bold text-white">⚡ Planes Anuales con Descuento</p>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              Servicios como Spotify o iCloud ofrecen hasta un 20% de descuento al facturarse en planes familiares o anuales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
