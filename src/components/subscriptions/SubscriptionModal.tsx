'use client';

import React, { useState, useEffect } from 'react';
import { useSubsStore, SubscriptionItem, SubFrequency } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { getAutoEmoji } from '@/lib/financialsEngine';
import { IconX } from '../common/Icons';

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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Apple Fitness Bottom Sheet Modal */}
      <div
        className="relative w-full max-w-lg bg-[#1C1C1E] border-t border-white/10 rounded-t-[32px] p-6 pb-16 z-20 animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="pt-1 pb-2 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {editingSub ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Control de renovación y costo recurrente
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-95 transition-all fitness-press"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Service Name & Auto Emoji */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
              Nombre del Servicio
            </label>
            <div className="flex gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-2xl shrink-0">
                {emoji}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ej: Spotify, Netflix, ChatGPT, iCloud"
                className="flex-1 h-12 px-4 rounded-xl bg-[#2C2C2E] border border-white/10 text-sm font-semibold text-white placeholder-[#8E8E93] outline-none focus:ring-1 focus:ring-[#A1F524]/60"
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
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all cursor-pointer fitness-press ${
                  emoji === em
                    ? 'bg-[#2C2C2E] border-2 border-[#A1F524] scale-105'
                    : 'bg-[#2C2C2E] opacity-75 hover:opacity-100 border border-white/5'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Amount & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Monto ({currency || 'COP'})
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="44900"
                className="w-full h-12 px-4 rounded-xl bg-[#2C2C2E] border border-white/10 text-base font-bold text-white outline-none focus:ring-1 focus:ring-[#A1F524]/60"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as SubFrequency)}
                className="w-full h-12 px-3 rounded-xl bg-[#2C2C2E] border border-white/10 text-xs font-bold capitalize text-white outline-none focus:ring-1 focus:ring-[#A1F524]/60"
              >
                <option value="monthly" className="bg-[#1C1C1E] text-white">Mensual</option>
                <option value="yearly" className="bg-[#1C1C1E] text-white">Anual</option>
                <option value="weekly" className="bg-[#1C1C1E] text-white">Semanal</option>
              </select>
            </div>
          </div>

          {/* Billing Day & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Día de Cobro (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                placeholder="3"
                className="w-full h-12 px-4 rounded-xl bg-[#2C2C2E] border border-white/10 text-sm font-semibold text-white outline-none focus:ring-1 focus:ring-[#A1F524]/60"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-[#2C2C2E] border border-white/10 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#A1F524]/60"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#1C1C1E] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button (Apple Fitness Lime Pill) */}
          <div className="pt-4 pb-4">
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#A1F524] text-black font-bold text-base flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(161,245,36,0.35)] active:scale-[0.98] transition-all fitness-press cursor-pointer"
            >
              <span>✓</span>
              <span>Guardar Suscripción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
