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
import { IconSettings } from '../common/Icons';

export const SubscriptionsView: React.FC = () => {
  const { setCurrentApp, setIsSettingsOpen } = useHubStore();
  const { currentTab, setCurrentTab, subscriptions } = useSubsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

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
      {/* 1. Top Bar: Home Return Button (Left) & Settings (Right) */}
      <div className="flex items-center justify-between">
        {/* Return to HUB Button */}
        <button
          onClick={() => setCurrentApp('hub')}
          className="px-4 py-2.5 rounded-full bg-[#1C1C1E] border border-white/10 text-sm font-black text-[#F5F5F7] flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span>🏠</span>
          <span>Volver al HUB</span>
        </button>

        {/* Top Right Settings Icon */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-95 transition-all shadow-sm"
          title="Ajustes de Suscripciones"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Two Side-by-Side Financial Cost Cards */}
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

      {/* 3. Horizontal Filter Pills Row (Todas 📺, Timeline ⏰, Fugas 💡, Cancelar 🚫) */}
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

      {/* 4. Big Add Subscription Button */}
      <button
        onClick={handleOpenAdd}
        className="w-full py-4 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm"
      >
        <span className="text-base font-bold">+</span>
        <span>Agregar Suscripción</span>
      </button>

      {/* 5. Active Tab Content */}
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
