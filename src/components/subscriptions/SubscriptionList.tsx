'use client';

import React from 'react';
import { useSubsStore, SubscriptionItem } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { IconEdit, IconTrash } from '../common/Icons';

interface SubscriptionListProps {
  onEdit: (sub: SubscriptionItem) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ onEdit }) => {
  const { subscriptions, paySubscription, deleteSubscription } = useSubsStore();
  const { showToast } = useHubStore();

  const handlePay = (sub: SubscriptionItem) => {
    paySubscription(sub.id);
    showToast(`✅ Pago registrado para ${sub.name}!`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSubscription(id);
    showToast(`🗑️ Suscripción ${name} eliminada.`);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="p-8 rounded-[28px] clay-surface text-center text-xs text-[#8E8E93] space-y-2">
        <span className="text-3xl">📺</span>
        <h4 className="text-sm font-extrabold text-[#F5F5F7]">Sin suscripciones activas</h4>
        <p>Presiona el botón "+ Agregar Suscripción" para añadir tus servicios recurrentes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const formattedAmount = `$ ${Number(sub.amount).toLocaleString('es-CO')}`;

        return (
          <div
            key={sub.id}
            className="p-4.5 rounded-[26px] clay-surface flex items-center justify-between transition-all"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl clay-pill flex items-center justify-center text-2xl shrink-0">
                {sub.emoji || '📺'}
              </div>

              <div>
                <h4 className="text-base font-black text-[#F5F5F7] tracking-tight">{sub.name}</h4>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  {sub.category || 'Servicio'} • {sub.frequency === 'yearly' ? 'Anual' : sub.frequency === 'weekly' ? 'Semanal' : 'Mensual'} • Día {sub.billingDay || 1}
                </p>
              </div>
            </div>

            {/* Right: Amount & Action Buttons */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-base font-black text-[#DC2626] tracking-tight">
                -{formattedAmount}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePay(sub)}
                  className="clay-btn-accent px-3.5 py-1 text-white font-black text-xs active:scale-90 transition-transform cursor-pointer"
                >
                  Pagar
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(sub)}
                  className="clay-pill w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white cursor-pointer"
                  title="Editar"
                >
                  <IconEdit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="clay-pill w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#DC2626] cursor-pointer"
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
