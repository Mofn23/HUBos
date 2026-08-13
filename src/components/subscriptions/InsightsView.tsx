'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { formatCurrency } from '@/lib/utils';
import { IconSparkles, IconPieChart, IconZap } from '../common/Icons';

export const InsightsView: React.FC = () => {
  const { subscriptions } = useSubsStore();
  const { currency } = useHubStore();

  const summary = calculateFinancialSummary(subscriptions);
  const costPerDay = Math.round(summary.monthlyTotal / 30);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Daily Cost Metric */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0A84FF]">
            Gasto Diario Promedio
          </span>
          <h3 className="text-xl font-black text-[#F5F5F7] mt-0.5">
            {formatCurrency(costPerDay, currency)}{' '}
            <span className="text-xs font-normal text-[#8E8E93]">/ día</span>
          </h3>
          <p className="text-[11px] text-[#8E8E93]">En suscripciones y servicios fijos</p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
          <IconZap className="w-6 h-6" />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-3.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Distribución por Categoría
        </h3>

        <div className="space-y-3">
          {summary.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#F5F5F7]">{cat.category} ({cat.count})</span>
                <span className="text-[#0A84FF]">
                  {formatCurrency(cat.monthlyAmount, currency)}{' '}
                  <span className="text-[10px] text-[#8E8E93]">({Math.round(cat.percentage)}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#242426] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0A84FF] transition-all duration-700"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Optimization Tips */}
      <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#1C1C1E] to-[#242426] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-4 h-4 text-[#34C759]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
            Recomendaciones de Ahorro IA
          </h3>
        </div>

        <div className="space-y-2 text-xs text-[#8E8E93]">
          <div className="p-3 rounded-xl bg-[#141416] border border-white/5 space-y-1">
            <p className="font-bold text-[#F5F5F7]">💡 Optimización de Streaming</p>
            <p className="text-[11px]">
              Tienes múltiples servicios de entretenimiento activos. Alternar entre Netflix y YouTube Premium mes a mes podría ahorrarte hasta $240.000 COP al año.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#141416] border border-white/5 space-y-1">
            <p className="font-bold text-[#F5F5F7]">⚡ Planes Anuales con Descuento</p>
            <p className="text-[11px]">
              Servicios como Spotify o iCloud ofrecen hasta un 20% de descuento al facturarse en planes familiares o anuales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
