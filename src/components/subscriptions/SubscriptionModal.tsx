'use client';

import React, { useState, useEffect } from 'react';
import { BottomModal } from '../common/BottomModal';
import { useSubsStore, SubscriptionItem, SubFrequency } from '@/stores/useSubsStore';
import { useHubStore } from '@/stores/useHubStore';
import { getAutoEmoji } from '@/lib/financialsEngine';
import { IconCheck, IconTrash } from '../common/Icons';

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
  const { addSubscription, updateSubscription, deleteSubscription, categories } = useSubsStore();
  const { currency, showToast } = useHubStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💳');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<SubFrequency>('monthly');
  const [billingDay, setBillingDay] = useState('15');
  const [category, setCategory] = useState('Streaming');
  const [provider, setProvider] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [cancelSteps, setCancelSteps] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderDays, setReminderDays] = useState(3);
  const [status, setStatus] = useState<'active' | 'paused' | 'canceled'>('active');

  useEffect(() => {
    if (editingSub) {
      setName(editingSub.name);
      setEmoji(editingSub.emoji || '💳');
      setAmount(String(editingSub.amount));
      setFrequency(editingSub.frequency || 'monthly');
      setBillingDay(String(editingSub.billingDay || 1));
      setCategory(editingSub.category || 'Streaming');
      setProvider(editingSub.provider || '');
      setCancelUrl(editingSub.cancelUrl || '');
      setCancelSteps(editingSub.cancelSteps || '');
      setNotes(editingSub.notes || '');
      setReminderDays(editingSub.reminderDays || 3);
      setStatus(editingSub.status || 'active');
    } else {
      resetForm();
    }
  }, [editingSub, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSub) {
      const detectedEmoji = getAutoEmoji(val, category);
      setEmoji(detectedEmoji);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Introduce el nombre de la suscripción.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showToast('Introduce un monto válido.');
      return;
    }

    const cleanDay = Math.max(1, Math.min(31, parseInt(billingDay, 10) || 1));

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: name.trim(),
        emoji,
        amount: Number(amount),
        frequency,
        billingDay: cleanDay,
        category,
        provider: provider.trim() || name.trim(),
        cancelUrl: cancelUrl.trim() || undefined,
        cancelSteps: cancelSteps.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderDays,
        status,
      });
      showToast(`Suscripción actualizada: ${name}`);
    } else {
      addSubscription({
        name: name.trim(),
        emoji,
        amount: Number(amount),
        frequency,
        billingDay: cleanDay,
        category,
        provider: provider.trim() || name.trim(),
        cancelUrl: cancelUrl.trim() || undefined,
        cancelSteps: cancelSteps.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderDays,
        status,
        tags: [`#${category.toLowerCase().replace(/\s+/g, '')}`],
      });
      showToast(`Nueva suscripción agregada: ${name}`);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingSub && confirm(`¿Eliminar la suscripción "${editingSub.name}"?`)) {
      deleteSubscription(editingSub.id);
      showToast('Suscripción eliminada.');
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setEmoji('💳');
    setAmount('');
    setFrequency('monthly');
    setBillingDay('15');
    setCategory('Streaming');
    setProvider('');
    setCancelUrl('');
    setCancelSteps('');
    setNotes('');
    setReminderDays(3);
    setStatus('active');
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSub ? 'Editar Suscripción' : 'Nueva Suscripción'}
      subtitle="Control de ciclo de facturación y alertas"
      headerAction={
        editingSub ? (
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-full bg-[#E8505B]/15 text-[#E8505B] flex items-center justify-center hover:bg-[#E8505B]/25 transition-colors"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        ) : null
      }
    >
      <div className="space-y-4 pb-6">
        {/* Name & Emoji */}
        <div className="flex gap-2">
          <div className="w-14">
            <label className="block text-[10px] text-[#8E8E93] mb-1 font-bold">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full bg-[#242426] border border-white/10 rounded-xl py-2.5 text-center text-lg focus:outline-none focus:border-[#0A84FF]"
            />
          </div>

          <div className="flex-1">
            <label className="block text-[10px] text-[#8E8E93] mb-1 font-bold">Servicio / Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: ChatGPT Plus, Spotify..."
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            />
          </div>
        </div>

        {/* Amount & Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-[#8E8E93] mb-1 font-bold">
              Monto ({currency}) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 85000"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-black text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#8E8E93] mb-1 font-bold">Día de Cobro (1-31)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              placeholder="Día del mes"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-black text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            />
          </div>
        </div>

        {/* Frequency pills */}
        <div>
          <label className="block text-[10px] text-[#8E8E93] mb-1.5 font-bold">Frecuencia de Cobro</label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['monthly', 'yearly', 'weekly', 'bimonthly'] as const).map((freq) => {
              const labels: Record<string, string> = {
                monthly: 'Mensual',
                yearly: 'Anual',
                weekly: 'Semanal',
                bimonthly: 'Bimestral',
              };
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                    frequency === freq
                      ? 'bg-[#0A84FF] text-white shadow-md'
                      : 'bg-[#242426] text-[#8E8E93] hover:text-[#F5F5F7]'
                  }`}
                >
                  {labels[freq]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-[10px] text-[#8E8E93] mb-1.5 font-bold">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Cancellation Details */}
        <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93]">
            Asistente de Cancelación Rápida
          </p>

          <div>
            <label className="block text-[10px] text-[#8E8E93] mb-1">Enlace Directo de Cancelación</label>
            <input
              type="url"
              value={cancelUrl}
              onChange={(e) => setCancelUrl(e.target.value)}
              placeholder="https://servicioweb.com/cancelar"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#8E8E93] mb-1">Pasos para Cancelar</label>
            <input
              type="text"
              value={cancelSteps}
              onChange={(e) => setCancelSteps(e.target.value)}
              placeholder="Ej: Cuenta > Suscripción > Cancelar plan"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !amount}
          className="w-full py-3 rounded-2xl bg-[#0A84FF] text-white font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 shadow-lg mt-2"
        >
          <IconCheck className="w-4 h-4 stroke-[3]" />
          <span>{editingSub ? 'Guardar Cambios' : 'Crear Suscripción'}</span>
        </button>
      </div>
    </BottomModal>
  );
};
