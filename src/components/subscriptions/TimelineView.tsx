'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { IconCheck } from '../common/Icons';
import { getTodayKey } from '@/lib/date';
import { formatShortDateSpanish } from '@/lib/date';

export const TimelineView: React.FC = () => {
  const { subscriptions, paySubscription } = useSubsStore();
  const { currency, showToast } = useHubStore();

  const sortedSubs = [...subscriptions].sort((a, b) => a.billingDay - b.billingDay);
  const today = new Date(`${getTodayKey()}T12:00:00`);
  const currentDay = today.getDate();

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Calendario Mensual de Cobros
        </h3>
        <span className="text-[11px] text-[#FF375F] font-bold">Día actual: {currentDay}</span>
      </div>

      <div className="space-y-2.5">
        {sortedSubs.map((sub) => {
          const isPaidToday = sub.lastPaidDate === getTodayKey();
          const isToday = sub.nextBillingDate === getTodayKey() || (!sub.nextBillingDate && sub.billingDay === currentDay);
          const isPassed = !isPaidToday && !isToday && !sub.nextBillingDate && sub.billingDay < currentDay;
          const cadence = sub.frequency === 'weekly' ? 'Semanal' : sub.frequency === 'bimonthly' ? 'Cada 2 meses' : sub.frequency === 'quarterly' ? 'Trimestral' : sub.frequency === 'yearly' ? 'Anual' : 'Mensual';

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-[22px] flex items-center justify-between transition-all ${
                isToday
                  ? 'bg-[#1C1C1E] border border-[#FF375F]/50'
                  : isPassed
                  ? 'bg-[#1C1C1E] border border-white/5 opacity-60'
                  : 'bg-[#1C1C1E] border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold ${
                    isToday
                      ? 'bg-[#FF375F] rounded-full text-white shadow-md'
                      : isPassed
                      ? 'bg-[#2C2C2E] border border-white/5 text-[#8E8E93]'
                      : 'bg-[#2C2C2E] border border-white/5 text-[#F5F5F7]'
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
                    {cadence} <span className="text-white/20">·</span>{' '}
                    {isPaidToday ? 'Pagado hoy' : isToday ? '¡Cobro hoy!' : isPassed ? 'Cobro pendiente' : sub.nextBillingDate ? `Próximo ${formatShortDateSpanish(sub.nextBillingDate)}` : 'Próximo cobro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-[#F5F5F7]">
                  {formatCurrency(sub.amount, currency)}
                </p>
                <button
                  disabled={isPaidToday}
                  onClick={() => {
                    if (sub.lastPaidDate === getTodayKey()) {
                      showToast(`${sub.name} ya está marcado como pagado hoy.`);
                      return;
                    }
                    paySubscription(sub.id);
                    showToast(`✅ Pago registrado y próximo cobro actualizado para ${sub.name}.`);
                  }}
                  className="bg-[#2C2C2E] border border-white/5 w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#FF375F] active:scale-90 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer disabled:opacity-50 disabled:cursor-default"
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
