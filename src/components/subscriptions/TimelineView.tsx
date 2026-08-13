'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { IconCalendar, IconCheck } from '../common/Icons';

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
        <span className="text-[11px] text-[#0A84FF] font-bold">Día actual: {currentDay}</span>
      </div>

      <div className="space-y-2.5">
        {sortedSubs.map((sub) => {
          const isPassed = sub.billingDay < currentDay;
          const isToday = sub.billingDay === currentDay;

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                isToday
                  ? 'bg-[#0A84FF]/10 border-[#0A84FF]/40 shadow-lg'
                  : isPassed
                  ? 'bg-[#141416] border-white/5 opacity-70'
                  : 'bg-[#1C1C1E] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold ${
                    isToday
                      ? 'bg-[#0A84FF] text-white'
                      : isPassed
                      ? 'bg-white/5 text-[#8E8E93]'
                      : 'bg-[#242426] text-[#F5F5F7]'
                  }`}
                >
                  <span className="text-[9px] uppercase">Día</span>
                  <span className="text-sm font-black">{sub.billingDay}</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{sub.emoji}</span>
                    <h4 className="text-xs font-bold text-[#F5F5F7]">{sub.name}</h4>
                  </div>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">
                    {sub.category} •{' '}
                    {isToday ? '¡Cobro hoy!' : isPassed ? 'Cobrado este mes' : 'Próximo cobro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-[#F5F5F7]">
                  {formatCurrency(sub.amount, currency)}
                </p>
                <button
                  onClick={() => {
                    paySubscription(sub.id);
                    showToast(`Pago registrado: ${sub.name}`);
                  }}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#34C759] hover:text-black flex items-center justify-center text-[#8E8E93] transition-colors"
                  title="Marcar como pagado"
                >
                  <IconCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
