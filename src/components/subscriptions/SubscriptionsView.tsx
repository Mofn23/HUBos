'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useSubsStore, SubTab, SubscriptionItem } from '@/stores/useSubsStore';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionModal } from './SubscriptionModal';
import { TimelineView } from './TimelineView';
import { InsightsView } from './InsightsView';
import { CancellationView } from './CancellationView';
import {
  IconCalendar,
  IconSettings,
} from '../common/Icons';

export const SubscriptionsView: React.FC = () => {
  const { setIsSettingsOpen } = useHubStore();
  const { currentTab, setCurrentTab, subscriptions } = useSubsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('RappiPay');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [activeMainSegment, setActiveMainSegment] = useState<'gastos' | 'suscripciones'>('suscripciones');

  const summary = calculateFinancialSummary(subscriptions);

  const filterTabs: { id: SubTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Todas', icon: '📺' },
    { id: 'timeline', label: 'Timeline', icon: '⏰' },
    { id: 'insights', label: 'Fugas', icon: '💡' },
    { id: 'cancellation', label: 'Cancelar', icon: '🚫' },
  ];

  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const formattedMonthly = `$ ${Number(summary.monthlyTotal).toLocaleString('es-CO')}`;
  const formattedYearly = `$ ${Number(summary.annualTotal).toLocaleString('es-CO')}`;

  return (
    <div className="flex-1 flex flex-col px-4 pt-16 pb-28 overflow-y-auto no-scrollbar animate-fade-in space-y-4">
      {/* 1. Top Bar matching Screenshot 1 */}
      <div className="flex items-center justify-between">
        {/* Account Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="px-4 py-2 rounded-full bg-[#1C1C1E] border border-white/10 text-sm font-black text-[#F5F5F7] flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span>{selectedAccount}</span>
            <span className="text-xs text-[#8E8E93]">⌄</span>
          </button>

          {showAccountDropdown && (
            <div className="absolute top-12 left-0 w-44 bg-[#1C1C1E] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
              {['RappiPay', 'Bancolombia', 'Nu Tarjeta', 'Efectivo'].map((acc) => (
                <button
                  key={acc}
                  onClick={() => {
                    setSelectedAccount(acc);
                    setShowAccountDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedAccount === acc
                      ? 'bg-[#242426] text-[#34C759]'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Right Action Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('timeline')}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-95 transition-all shadow-sm"
            title="Calendario"
          >
            <IconCalendar className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-95 transition-all shadow-sm"
            title="Ajustes"
          >
            <IconSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Switcher (Gastos & Finanzas 💳 vs Suscripciones 📺) */}
      <div className="p-1.5 rounded-full bg-[#1C1C1E] border border-white/5 flex gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveMainSegment('gastos')}
          className={`flex-1 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            activeMainSegment === 'gastos'
              ? 'bg-[#34C759] text-white shadow-md'
              : 'text-[#8E8E93] hover:text-[#F5F5F7]'
          }`}
        >
          <span>Gastos & Finanzas</span>
          <span>💳</span>
        </button>

        <button
          onClick={() => setActiveMainSegment('suscripciones')}
          className={`flex-1 py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            activeMainSegment === 'suscripciones'
              ? 'bg-[#34C759] text-white shadow-md'
              : 'text-[#8E8E93] hover:text-[#F5F5F7]'
          }`}
        >
          <span>Suscripciones</span>
          <span>📺</span>
        </button>
      </div>

      {/* 3. Two Side-by-Side Financial Cost Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Costo Mensual */}
        <div className="p-5 rounded-[26px] bg-[#1C1C1E] border border-white/5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#8E8E93]">Costo Mensual</span>
          <div className="text-2xl font-black text-[#F5F5F7] tracking-tight">
            {formattedMonthly}
          </div>
          <span className="text-xs font-bold text-[#8E8E93] block">/ mes</span>
        </div>

        {/* Costo Anual */}
        <div className="p-5 rounded-[26px] bg-[#1C1C1E] border border-white/5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#8E8E93]">Costo Anual</span>
          <div className="text-2xl font-black text-[#F5F5F7] tracking-tight">
            {formattedYearly}
          </div>
          <span className="text-xs font-bold text-[#8E8E93] block">/ año</span>
        </div>
      </div>

      {/* 4. Horizontal Filter Pills Row (Todas 📺, Timeline ⏰, Fugas 💡, Cancelar 🚫) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filterTabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-[#34C759] text-white shadow-sm'
                  : 'bg-[#1C1C1E] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              <span>{t.label}</span>
              <span>{t.icon}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Big Add Subscription Button */}
      <button
        onClick={handleOpenAdd}
        className="w-full py-4 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm"
      >
        <span className="text-base font-bold">+</span>
        <span>Agregar Suscripción</span>
      </button>

      {/* 6. Active Tab Content */}
      <div className="pt-1">
        {currentTab === 'all' && <SubscriptionList onEdit={handleEdit} />}
        {currentTab === 'timeline' && <TimelineView />}
        {currentTab === 'insights' && <InsightsView />}
        {currentTab === 'cancellation' && <CancellationView />}
      </div>

      {/* Add / Edit Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSub={editingSub}
      />
    </div>
  );
};
