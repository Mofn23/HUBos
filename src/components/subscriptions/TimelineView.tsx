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
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Calendario Mensual de Cobros
        </h3>
        <span className="text-[11px] text-[#A1F524] font-bold">Día actual: {currentDay}</span>
      </div>

      <div className="space-y-2.5">
        {sortedSubs.map((sub) => {
          const isPassed = sub.billingDay < currentDay;
          const isToday = sub.billingDay === currentDay;

          return (
            <div
              key={sub.id}
              className={`fitness-card p-4 rounded-3xl flex items-center justify-between transition-all ${
                isToday
                  ? 'border border-[#A1F524]/50 shadow-[0_0_24px_rgba(161,245,36,0.25)] bg-gradient-to-r from-[#A1F524]/10 to-transparent'
                  : isPassed
                  ? 'opacity-60 border border-white/5'
                  : 'border border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold ${
                    isToday
                      ? 'bg-[#A1F524] text-black shadow-md'
                      : isPassed
                      ? 'bg-[#2C2C2E] text-[#8E8E93]'
                      : 'bg-[#2C2C2E] text-white'
                  }`}
                >
                  <span className="text-[8px] uppercase font-bold">Día</span>
                  <span className="text-sm font-black">{sub.billingDay}</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{sub.emoji}</span>
                    <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
                    {sub.category} •{' '}
                    {isToday ? '¡Cobro hoy!' : isPassed ? 'Cobrado este mes' : 'Próximo cobro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  {formatCurrency(sub.amount, currency)}
                </p>
                <button
                  onClick={() => {
                    paySubscription(sub.id);
                    showToast(`✅ Pago registrado: ${sub.name}`);
                  }}
                  className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-[#A1F524] active:scale-90 transition-all cursor-pointer fitness-press"
                  title="Marcar como pagado"
                >
                  <IconCheck className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
