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
import { IconSettings, IconPlus } from '../common/Icons';

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

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  return (
    <div className="flex-1 flex flex-col px-4 pt-12 pb-32 overflow-y-auto no-scrollbar animate-fade-in space-y-4 bg-black text-white min-h-screen relative">
      {/* Ambient Apple Fitness Radial Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#BF5AF2]/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-[120px]" />
      </div>

      {/* 1. Apple Fitness Top Bar */}
      <header className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentApp('hub')}
            className="h-8 px-3 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center gap-1 text-xs font-bold text-white hover:border-white/30 fitness-press shadow-sm"
          >
            <span className="text-sm font-bold leading-none">‹</span>
            <span>HUB</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="h-8 px-3 rounded-full bg-[#A1F524] text-black text-xs font-bold flex items-center gap-1 shadow-[0_2px_12px_rgba(161,245,36,0.3)] fitness-press"
            >
              <IconPlus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Añadir</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90 transition-all fitness-press"
              title="Ajustes"
            >
              <IconSettings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Apple Fitness Title */}
        <div className="pt-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            Suscripciones
          </h1>
          <div className="text-[11px] font-bold tracking-widest text-[#8E8E93] uppercase mt-1">
            {formattedDate} • {summary.activeCount} SERVICIOS ACTIVOS
          </div>
        </div>
      </header>

      {/* 2. Two Apple Bento Financial Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* Costo Mensual */}
        <div className="fitness-card p-4.5 rounded-3xl space-y-1 border border-white/[0.08]">
          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Costo Mensual</span>
          <div className="text-2xl font-black text-[#BF5AF2] tracking-tight">
            {formattedMonthly}
          </div>
          <span className="text-[11px] font-semibold text-[#8E8E93] block">por mes</span>
        </div>

        {/* Costo Anual */}
        <div className="fitness-card p-4.5 rounded-3xl space-y-1 border border-white/[0.08]">
          <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Proyección Anual</span>
          <div className="text-2xl font-black text-[#FFD60A] tracking-tight">
            {formattedYearly}
          </div>
          <span className="text-[11px] font-semibold text-[#8E8E93] block">por año</span>
        </div>
      </div>

      {/* 3. Apple Segmented Control Pills (Reference IMG_2041) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 w-full relative z-10">
        {filterTabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 cursor-pointer fitness-press ${
                isActive
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#1C1C1E] text-white/80 hover:text-white border border-white/5'
              }`}
            >
              <span>{t.label}</span>
              <span>{t.icon}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Tab Content */}
      <div className="pt-1 relative z-10">
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
