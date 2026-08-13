'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { IconCheck } from '../common/Icons';

export const TimelineView: React.FC = () => {
  const { subscriptions, paySubscription } = useSubsStore();
  const { currency, showToast } = useHubStore();

  const sortedSubs = [...subscriptions].sort((a, b) => a.billingDay - b.billingDay);
  const today = new Date();
  const currentDay = today.getDate();

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Calendario Mensual de Cobros
        </h3>
        <span className="text-[11px] text-[#34C759] font-bold">Día actual: {currentDay}</span>
      </div>

      <div className="space-y-2.5">
        {sortedSubs.map((sub) => {
          const isPassed = sub.billingDay < currentDay;
          const isToday = sub.billingDay === currentDay;

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-[22px] border flex items-center justify-between transition-all ${
                isToday
                  ? 'bg-[#34C759]/10 border-[#34C759]/40 shadow-lg'
                  : isPassed
                  ? 'bg-[#141416] border-white/5 opacity-60'
                  : 'bg-[#1C1C1E] border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold ${
                    isToday
                      ? 'bg-[#34C759] text-black shadow-md'
                      : isPassed
                      ? 'bg-white/5 text-[#8E8E93]'
                      : 'bg-[#242426] text-[#F5F5F7]'
                  }`}
                >
                  <span className="text-[8px] uppercase font-black">Día</span>
                  <span className="text-sm font-black">{sub.billingDay}</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{sub.emoji}</span>
                    <h4 className="text-sm font-black text-[#F5F5F7]">{sub.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#8E8E93] font-bold mt-0.5">
                    {sub.category} •{' '}
                    {isToday ? '¡Cobro hoy!' : isPassed ? 'Cobrado este mes' : 'Próximo cobro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-[#F5F5F7]">
                  {formatCurrency(sub.amount, currency)}
                </p>
                <button
                  onClick={() => {
                    paySubscription(sub.id);
                    showToast(`✅ Pago registrado: ${sub.name}`);
                  }}
                  className="w-8 h-8 rounded-full bg-[#242426] hover:bg-[#34C759] hover:text-black flex items-center justify-center text-[#8E8E93] active:scale-90 transition-all"
                  title="Marcar como pagado"
                >
                  <IconCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
