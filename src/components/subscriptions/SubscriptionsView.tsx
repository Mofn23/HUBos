'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useSubsStore, SubTab, SubscriptionItem } from '@/stores/useSubsStore';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionModal } from './SubscriptionModal';
import { TimelineView } from './TimelineView';
import { formatCurrency } from '@/lib/utils';

export const SubscriptionsView: React.FC = () => {
  const { setCurrentApp, currency } = useHubStore();
  const { currentTab, setCurrentTab, subscriptions } = useSubsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const summary = calculateFinancialSummary(subscriptions);

  const filterTabs: { id: SubTab; label: string; icon: string }[] = [
    { id: 'all', label: 'Todas', icon: '📺' },
    { id: 'timeline', label: 'Timeline', icon: '⏰' },
  ];

  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const formattedMonthly = formatCurrency(summary.monthlyTotal, currency);
  const formattedYearly = formatCurrency(summary.annualTotal, currency);

  return (
    <div className="flex-1 flex flex-col px-4 pt-16 pb-28 overflow-y-auto no-scrollbar animate-fade-in space-y-4">
      {/* Regreso al HUB, alineado como en RecompAI */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setCurrentApp('hub')}
          className="bg-[#2C2C2E] border border-white/[0.08] h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-black text-[#F5F5F7] active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer group"
          title="Regresar al HUB principal"
          aria-label="Regresar al HUB"
        >
          <span className="text-sm leading-none group-hover:-translate-x-0.5 transition-transform">‹</span>
          <span className="text-[11px] font-black tracking-tight">HUB</span>
        </button>
      </div>

      {/* Resumen compacto de gasto mensual y proyección anual */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] px-5 py-5 rounded-[28px] text-center">
        <span className="text-xs font-bold text-[#8E8E93]">Costo mensual</span>
        <div className="mt-1 text-3xl font-black text-[#F5F5F7] tracking-tight tabular-nums">
          {formattedMonthly}
          <span className="ml-1 text-xs font-bold text-[#8E8E93]">/ mes</span>
        </div>
        <div className="mt-3 text-xs font-semibold text-[#8E8E93]">
          {formattedYearly} al año
        </div>
      </div>

      {/* Vistas disponibles */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 w-full">
        {filterTabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 shrink-0 min-h-[38px] cursor-pointer ${
                isActive
                  ? 'bg-[#FF375F] rounded-full text-white'
                  : 'bg-[#2C2C2E] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7]'
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
        className="bg-[#FF375F] rounded-full w-full py-4 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer"
      >
        <span className="text-base font-bold">+</span>
        <span>Agregar Suscripción</span>
      </button>

      {/* 5. Active Tab Content */}
      <div className="pt-1">
        {currentTab === 'all' && <SubscriptionList onEdit={handleEdit} />}
        {currentTab === 'timeline' && <TimelineView />}
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
