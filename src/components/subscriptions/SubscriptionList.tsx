'use client';

import React, { useState } from 'react';
import { useSubsStore, SubscriptionItem } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { IconCheck, IconEdit, IconTrash, IconExternalLink } from '../common/Icons';

interface SubscriptionListProps {
  onEdit: (sub: SubscriptionItem) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ onEdit }) => {
  const { subscriptions, paySubscription, categories } = useSubsStore();
  const { currency, showToast } = useHubStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const filteredSubs = subscriptions.filter((s) => {
    if (selectedCategory === 'Todas') return true;
    return s.category === selectedCategory;
  });

  const today = new Date();
  const currentDay = today.getDate();

  const handlePay = (sub: SubscriptionItem) => {
    paySubscription(sub.id);
    showToast(`✅ Pago registrado para ${sub.name}!`);
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
        {['Todas', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-white text-black shadow'
                  : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Subscription Cards */}
      <div className="space-y-3">
        {filteredSubs.length === 0 ? (
          <div className="p-8 rounded-[28px] bg-[#1C1C1E] border border-dashed border-white/10 text-center text-xs text-[#8E8E93]">
            No hay suscripciones en esta categoría.
          </div>
        ) : (
          filteredSubs.map((sub) => {
            let daysUntil = sub.billingDay - currentDay;
            if (daysUntil < 0) daysUntil += 30;

            const isDueSoon = daysUntil <= 3;

            return (
              <div
                key={sub.id}
                className="p-4 rounded-[26px] bg-[#1C1C1E] border border-white/10 shadow-lg space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#242426] border border-white/5 flex items-center justify-center text-2xl shadow-inner">
                      {sub.emoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-[#F5F5F7]">{sub.name}</h4>
                        <span className="text-[9px] font-bold uppercase bg-[#242426] text-[#8E8E93] px-1.5 py-0.5 rounded">
                          {sub.frequency === 'monthly'
                            ? 'Mensual'
                            : sub.frequency === 'yearly'
                            ? 'Anual'
                            : 'Semanal'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-0.5">
                        Día {sub.billingDay} de cada mes • {sub.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-[#F5F5F7]">
                      {formatCurrency(sub.amount, currency)}
                    </p>
                    <span
                      className={`text-[10px] font-bold ${
                        isDueSoon ? 'text-[#FF9500]' : 'text-[#34C759]'
                      }`}
                    >
                      {daysUntil === 0
                        ? '¡Vence hoy!'
                        : `Vence en ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'}`}
                    </span>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {sub.cancelUrl && (
                      <a
                        href={sub.cancelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-[#8E8E93] flex items-center gap-1 transition-colors"
                      >
                        <IconExternalLink className="w-3 h-3" />
                        <span>Cancelar</span>
                      </a>
                    )}
                    <button
                      onClick={() => onEdit(sub)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-[#8E8E93] flex items-center gap-1 transition-colors"
                    >
                      <IconEdit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handlePay(sub)}
                    className="px-3.5 py-1.5 rounded-full bg-[#34C759]/15 hover:bg-[#34C759] text-[#34C759] hover:text-black font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <IconCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Registrar Pago</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
