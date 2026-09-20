'use client';

import React, { useState, useEffect } from 'react';
import { useSubsStore, SubscriptionItem, SubFrequency } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { getAutoEmoji } from '@/lib/financialsEngine';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSub?: SubscriptionItem | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  editingSub,
}) => {
  const { addSubscription, updateSubscription, categories } = useSubsStore();
  const { currency, showToast } = useHubStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📺');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<SubFrequency>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [category, setCategory] = useState('Streaming');

  const commonEmojis = ['📺', '🎵', '💻', '🤖', '🏋️', '☁️', '🎮', '📱', '📦', '🍔', '🛡️', '💳'];

  useEffect(() => {
    if (editingSub) {
      setName(editingSub.name);
      setEmoji(editingSub.emoji || '📺');
      setAmount(String(editingSub.amount));
      setFrequency(editingSub.frequency || 'monthly');
      setBillingDay(String(editingSub.billingDay || 1));
      setCategory(editingSub.category || 'Streaming');
    } else {
      resetForm();
    }
  }, [editingSub, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSub) {
      const detected = getAutoEmoji(val, category);
      setEmoji(detected);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresa el nombre del servicio.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Ingresa un valor válido.');
      return;
    }

    const cleanDay = Math.max(1, Math.min(31, parseInt(billingDay, 10) || 1));

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: name.trim(),
        emoji,
        amount: numAmount,
        frequency,
        billingDay: cleanDay,
        category,
        provider: name.trim(),
      });
      showToast(`✅ Suscripción actualizada: ${name}`);
    } else {
      addSubscription({
        name: name.trim(),
        emoji,
        amount: numAmount,
        frequency,
        billingDay: cleanDay,
        category,
        provider: name.trim(),
        status: 'active',
        reminderDays: 3,
        tags: [category.toLowerCase()],
      });
      showToast(`✅ Suscripción guardada: ${name}`);
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setEmoji('📺');
    setAmount('');
    setFrequency('monthly');
    setBillingDay('1');
    setCategory('Streaming');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Claymorphism Bottom Sheet Modal */}
      <div
        className="relative clay-surface-elevated rounded-t-[36px] p-6 pb-20 z-20 animate-sheet-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#F5F5F7]">
              {editingSub ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h3>
            <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
              Control de renovación y costo recurrente
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full clay-pill flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Service Name & Auto Emoji */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Nombre del Servicio
            </label>
            <div className="flex gap-2.5">
              <div className="w-12 h-12 rounded-2xl clay-pill flex items-center justify-center text-2xl shrink-0">
                {emoji}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ej: Spotify, Netflix, ChatGPT, iCloud"
                className="clay-pill flex-1 h-12 px-4 text-sm font-black text-[#F5F5F7] placeholder-[#636366] outline-none focus:ring-1 focus:ring-[#DE7356]/50"
                required
              />
            </div>
          </div>

          {/* Emoji Selection Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {commonEmojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all cursor-pointer ${
                  emoji === em
                    ? 'clay-pill-active border-2 border-[#DE7356] scale-105'
                    : 'clay-pill opacity-75 hover:opacity-100'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Amount & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
                Monto ({currency || 'COP'})
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="44900"
                className="clay-pill h-12 px-4 text-base font-black text-[#F5F5F7] outline-none focus:ring-1 focus:ring-[#DE7356]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as SubFrequency)}
                className="clay-pill h-12 px-3 text-xs font-black capitalize text-[#F5F5F7] outline-none focus:ring-1 focus:ring-[#DE7356]/50"
              >
                <option value="monthly" className="bg-[#191922] text-[#F5F5F7]">Mensual</option>
                <option value="yearly" className="bg-[#191922] text-[#F5F5F7]">Anual</option>
                <option value="weekly" className="bg-[#191922] text-[#F5F5F7]">Semanal</option>
              </select>
            </div>
          </div>

          {/* Billing Day & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
                Día de Cobro (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                placeholder="3"
                className="clay-pill h-12 px-4 text-sm font-black text-[#F5F5F7] outline-none focus:ring-1 focus:ring-[#DE7356]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="clay-pill h-12 px-3 text-xs font-black text-[#F5F5F7] outline-none focus:ring-1 focus:ring-[#DE7356]/50"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#191922] text-[#F5F5F7]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-4 flex justify-center">
            <button
              type="submit"
              className="clay-btn-accent px-8 py-3.5 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-base font-black">✓</span>
              <span>Guardar Suscripción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
