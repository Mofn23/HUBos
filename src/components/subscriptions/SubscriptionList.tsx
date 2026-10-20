'use client';

import React from 'react';
import { useSubsStore, SubscriptionItem } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { IconEdit, IconTrash } from '../common/Icons';
import { formatCurrency } from '@/lib/utils';
import { formatShortDateSpanish, getTodayKey } from '@/lib/date';

interface SubscriptionListProps {
  onEdit: (sub: SubscriptionItem) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ onEdit }) => {
  const { subscriptions, paySubscription, deleteSubscription } = useSubsStore();
  const { showToast, currency } = useHubStore();

  const handlePay = (sub: SubscriptionItem) => {
    if (sub.lastPaidDate === getTodayKey()) {
      showToast(`${sub.name} ya está marcado como pagado hoy.`);
      return;
    }
    paySubscription(sub.id);
    showToast(`✅ Pago registrado y próximo cobro actualizado para ${sub.name}.`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSubscription(id);
    showToast(`🗑️ Suscripción ${name} eliminada.`);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="p-8 rounded-[28px] bg-[#1C1C1E] border border-white/5 text-center text-xs text-[#8E8E93] space-y-2">
        <span className="text-3xl">📺</span>
        <h4 className="text-sm font-extrabold text-[#F5F5F7]">Sin suscripciones activas</h4>
        <p>Presiona el botón "+ Agregar Suscripción" para añadir tus servicios recurrentes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const formattedAmount = formatCurrency(sub.amount, currency);
        const frequency = sub.frequency === 'weekly' ? 'Semanal' : sub.frequency === 'bimonthly' ? 'Cada 2 meses' : sub.frequency === 'quarterly' ? 'Trimestral' : sub.frequency === 'yearly' ? 'Anual' : 'Mensual';
        const paidToday = sub.lastPaidDate === getTodayKey();

        return (
          <div
            key={sub.id}
            className="p-3.5 rounded-[26px] bg-[#1C1C1E] border border-white/[0.08] transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="min-w-0 flex-1 text-[15px] leading-tight font-black text-[#F5F5F7] tracking-tight break-words">
                {sub.name}
              </h4>
              <span className="shrink-0 text-sm font-black text-[#F5F5F7] tracking-tight tabular-nums">
                {formattedAmount}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#2C2C2E] border border-white/[0.08] flex items-center justify-center text-lg shrink-0">
                  {sub.emoji || '📺'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#8E8E93]">
                    Día {sub.billingDay || 1} <span className="text-white/20">·</span> {frequency}
                  </p>
                  {paidToday && (
                    <p className="text-[10px] font-bold text-[#A3E635] mt-0.5">
                      Pagado hoy{sub.nextBillingDate ? ` · Próximo ${formatShortDateSpanish(sub.nextBillingDate)}` : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePay(sub)}
                  disabled={paidToday}
                  className="bg-[#FF375F] disabled:bg-[#2C2C2E] disabled:text-[#8E8E93] rounded-full px-3 py-1.5 text-white font-black text-[10px] active:scale-90 transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer disabled:cursor-default"
                >
                  {paidToday ? 'Pagado' : 'Registrar'}
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(sub)}
                  className="bg-[#2C2C2E] border border-white/[0.08] w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
                  title="Editar"
                >
                  <IconEdit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="bg-[#2C2C2E] border border-white/[0.08] w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#DC2626] cursor-pointer"
                  title="Eliminar"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
