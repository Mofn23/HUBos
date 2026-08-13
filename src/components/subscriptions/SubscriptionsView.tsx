'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useSubsStore, SubTab, SubscriptionItem } from '@/stores/useSubsStore';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { HeroFinancials } from './HeroFinancials';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionModal } from './SubscriptionModal';
import { TimelineView } from './TimelineView';
import { InsightsView } from './InsightsView';
import { CancellationView } from './CancellationView';
import {
  IconHome,
  IconPlus,
  IconCreditCard,
  IconCalendar,
  IconPieChart,
  IconShield,
} from '../common/Icons';

export const SubscriptionsView: React.FC = () => {
  const { setCurrentApp } = useHubStore();
  const { currentTab, setCurrentTab, subscriptions, monthlyBudget } = useSubsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const summary = calculateFinancialSummary(subscriptions);

  const tabs: { id: SubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'Todas', icon: IconCreditCard },
    { id: 'timeline', label: 'Calendario', icon: IconCalendar },
    { id: 'insights', label: 'Analíticas & Ahorro', icon: IconPieChart },
    { id: 'cancellation', label: 'Cancelación', icon: IconShield },
  ];

  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-12 pb-24 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentApp('hub')}
            className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 transition-all"
            title="Volver al HUB"
          >
            <IconHome className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight">Suscripciones</h1>
              <span className="text-[10px] font-bold bg-[#0A84FF]/15 text-[#0A84FF] px-2 py-0.5 rounded-full">
                {summary.activeCount} activas
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93]">Gestor y Control de Pagos</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-full bg-[#0A84FF] text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
        >
          <IconPlus className="w-4 h-4 stroke-[3]" />
          <span>Nueva</span>
        </button>
      </div>

      {/* Sub-navigation Scrollable Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-3 mb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-white text-black shadow'
                  : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Contents */}
      {currentTab === 'all' && (
        <div className="space-y-4 pb-12">
          <HeroFinancials
            monthlyTotal={summary.monthlyTotal}
            annualTotal={summary.annualTotal}
            monthlyBudget={monthlyBudget}
            activeCount={summary.activeCount}
            potentialSavings={summary.potentialMonthlySavings}
          />
          <SubscriptionList onEdit={handleEdit} />
        </div>
      )}

      {currentTab === 'timeline' && <TimelineView />}
      {currentTab === 'insights' && <InsightsView />}
      {currentTab === 'cancellation' && <CancellationView />}

      {/* Add / Edit Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSub={editingSub}
      />
    </div>
  );
};
