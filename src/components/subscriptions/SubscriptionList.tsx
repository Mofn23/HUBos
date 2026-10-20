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
      <div className="p-8 rounded-3xl fitness-card text-center text-xs text-[#8E8E93] space-y-2 border border-white/[0.08]">
        <span className="text-3xl">📺</span>
        <h4 className="text-sm font-bold text-white">Sin suscripciones activas</h4>
        <p>Presiona el botón "+ Añadir" para registrar tus servicios recurrentes.</p>
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
            className="fitness-card p-4 rounded-3xl flex items-center justify-between transition-all border border-white/[0.08] hover:border-white/20"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-2xl shrink-0">
                {sub.emoji || '📺'}
              </div>

              <div>
                <h4 className="text-base font-bold text-white tracking-tight">{sub.name}</h4>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  {sub.category || 'Servicio'} • {sub.frequency === 'yearly' ? 'Anual' : sub.frequency === 'weekly' ? 'Semanal' : 'Mensual'} • Día {sub.billingDay || 1}
                </p>
              </div>
            </div>

            {/* Right: Amount & Action Buttons */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-base font-bold text-[#FA114F] tracking-tight">
                -{formattedAmount}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePay(sub)}
                  className="bg-[#A1F524] text-black font-bold text-xs px-3 py-1.5 rounded-full active:scale-95 transition-transform fitness-press cursor-pointer"
                >
                  Pagar
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(sub)}
                  className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90 transition-transform fitness-press cursor-pointer"
                  title="Editar"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-[#FA114F] active:scale-90 transition-transform fitness-press cursor-pointer"
                  title="Eliminar"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
