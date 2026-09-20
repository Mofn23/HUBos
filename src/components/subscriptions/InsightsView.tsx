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
      <div className="clay-surface p-5 rounded-[26px] flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#DE7356]">
            Gasto Diario Promedio
          </span>
          <h3 className="text-2xl font-black text-[#F5F5F7] mt-0.5 tracking-tight">
            {formatCurrency(costPerDay, currency)}{' '}
            <span className="text-xs font-bold text-[#8E8E93]">/ día</span>
          </h3>
          <p className="text-xs font-bold text-[#8E8E93] mt-0.5">En suscripciones y servicios fijos</p>
        </div>

        <div className="w-12 h-12 rounded-2xl clay-pill flex items-center justify-center text-[#DE7356]">
          <IconZap className="w-6 h-6" />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="clay-surface p-5 rounded-[26px] space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Distribución por Categoría
        </h3>

        <div className="space-y-3.5">
          {summary.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#F5F5F7]">{cat.category} ({cat.count})</span>
                <span className="text-[#DE7356] font-black">
                  {formatCurrency(cat.monthlyAmount, currency)}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">({Math.round(cat.percentage)}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full clay-pill overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#DE7356] transition-all duration-700 shadow-[0_0_8px_rgba(222,115,86,0.5)]"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Optimization Tips */}
      <div className="clay-surface p-5 rounded-[26px] space-y-3.5">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-4 h-4 text-[#DE7356]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
            Recomendaciones de Ahorro IA
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-[#8E8E93]">
          <div className="clay-pill p-3.5 rounded-2xl space-y-1">
            <p className="font-extrabold text-[#F5F5F7]">💡 Optimización de Streaming</p>
            <p className="text-[11px] font-bold text-[#8E8E93] leading-relaxed">
              Tienes múltiples servicios de entretenimiento activos. Alternar entre Netflix y YouTube Premium mes a mes podría ahorrarte hasta $240.000 COP al año.
            </p>
          </div>

          <div className="clay-pill p-3.5 rounded-2xl space-y-1">
            <p className="font-extrabold text-[#F5F5F7]">⚡ Planes Anuales con Descuento</p>
            <p className="text-[11px] font-bold text-[#8E8E93] leading-relaxed">
              Servicios como Spotify o iCloud ofrecen hasta un 20% de descuento al facturarse en planes familiares o anuales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
