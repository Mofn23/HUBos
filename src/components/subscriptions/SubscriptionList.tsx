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
      <div className="p-8 rounded-[28px] bg-[#1C1C1E] border border-dashed border-white/10 text-center text-xs text-[#8E8E93] space-y-2">
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
            className="p-4 rounded-[26px] bg-[#1C1C1E] border border-white/5 shadow-md flex items-center justify-between transition-all"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#242426] border border-white/5 flex items-center justify-center text-2xl shrink-0 shadow-inner">
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
              <span className="text-base font-black text-[#E8505B] tracking-tight">
                -{formattedAmount}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePay(sub)}
                  className="px-3.5 py-1 rounded-full bg-[#34C759] text-white font-black text-xs shadow active:scale-90 transition-transform"
                >
                  Pagar
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(sub)}
                  className="text-[#8E8E93] hover:text-white p-1"
                  title="Editar"
                >
                  <IconEdit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="text-[#8E8E93] hover:text-[#E8505B] p-1"
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
