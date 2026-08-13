'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { getGreeting, formatDateSpanish, getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { HubLogo } from '../common/HubLogo';
import {
  IconSettings,
  IconSparkles,
  IconDumbbell,
  IconCreditCard,
  IconChevronRight,
  IconFlame,
  IconDroplets,
  IconCalendar,
  IconShield,
  IconZap,
  IconPlus,
} from '../common/Icons';

export const HubDashboard: React.FC = () => {
  const { userName, currency, setCurrentApp, setIsSettingsOpen, setIsQuickAiPromptOpen } = useHubStore();
  const { meals, targetCalories, targetCarbs, targetProtein, waterLogs, supplements, streak } = useRecompStore();
  const { subscriptions } = useSubsStore();

  const todayKey = getTodayKey();
  const greeting = getGreeting();
  const formattedDate = formatDateSpanish(todayKey);

  // Nutrition calculations for today
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayWater = waterLogs[todayKey] || 0;

  // Financial summary
  const financials = calculateFinancialSummary(subscriptions);

  return (
    <div className="flex-1 flex flex-col px-5 pt-16 pb-28 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HubLogo size={44} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#34C759]">
                HUBos • Super-App iOS
              </span>
            </div>
            <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {greeting}, {userName}
            </h1>
            <p className="text-[11px] font-bold text-[#8E8E93] capitalize">{formattedDate}</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 transition-all shadow-md"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>

      {/* AI Quick Command Bar */}
      <div
        onClick={() => setIsQuickAiPromptOpen(true)}
        className="p-3.5 mb-6 rounded-2xl bg-gradient-to-r from-[#1C1C1E] to-[#242426] border border-white/10 hover:border-white/20 cursor-pointer shadow-lg active:scale-[0.98] transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#34C759] to-[#0A84FF] flex items-center justify-center text-white shadow-md">
            <IconSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#34C759] transition-colors">
              Comando Universal IA
            </p>
            <p className="text-[11px] text-[#8E8E93]">
              Registra comidas, suscripciones o consultas libres...
            </p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
          <IconChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Modular Apps Grid Section */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Módulos Integrados (Single IPA)
          </h2>
          <span className="text-[11px] text-[#34C759] font-semibold bg-[#34C759]/10 px-2 py-0.5 rounded-full">
            2 Apps Activas
          </span>
        </div>

        {/* 1. RecompAI Card */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 hover:border-[#34C759]/40 shadow-xl cursor-pointer active:scale-[0.99] transition-all group relative overflow-hidden"
        >
          {/* Subtle green glow accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#34C759]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#34C759]/15 border border-[#34C759]/30 flex items-center justify-center text-[#34C759]">
                <IconDumbbell className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-[#F5F5F7]">RecompAI</h3>
                  <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-[#F5F5F7]">
                    v1.1
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93]">Nutrición, Macros & Entrenamientos</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#34C759] group-hover:text-black flex items-center justify-center text-[#8E8E93] transition-all">
              <IconChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#141416] border border-white/5">
            <div>
              <p className="text-[10px] text-[#8E8E93] font-medium">Calorías Hoy</p>
              <p className="text-sm font-black text-[#F5F5F7] mt-0.5">
                <AnimatedNumber value={nutrition.consumedCalories} />{' '}
                <span className="text-[10px] font-normal text-[#8E8E93]">/ {targetCalories}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E93] font-medium">Proteína</p>
              <p className="text-sm font-black text-[#34C759] mt-0.5">
                <AnimatedNumber value={nutrition.consumedProtein} />
                <span className="text-[10px] font-normal text-[#8E8E93]">/{targetProtein}g</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E93] font-medium">Glucógeno</p>
              <p className="text-sm font-black text-[#FF9500] mt-0.5">
                {nutrition.glycogenPumpPercent}%
              </p>
            </div>
          </div>

          {/* Quick status footer */}
          <div className="flex items-center justify-between mt-3 px-1 text-[11px] text-[#8E8E93]">
            <div className="flex items-center gap-1.5">
              <IconDroplets className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>{todayWater} / 10 vasos</span>
            </div>
            <div className="flex items-center gap-1">
              <IconFlame className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Racha: {streak?.currentStreak || 3} días</span>
            </div>
          </div>
        </div>

        {/* 2. Subscriptions Card */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 hover:border-[#0A84FF]/40 shadow-xl cursor-pointer active:scale-[0.99] transition-all group relative overflow-hidden"
        >
          {/* Subtle blue glow accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
                <IconCreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-[#F5F5F7]">Suscripciones</h3>
                  <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-[#F5F5F7]">
                    MonAI Engine
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93]">Control de Gastos & Renovaciones</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#0A84FF] group-hover:text-white flex items-center justify-center text-[#8E8E93] transition-all">
              <IconChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#141416] border border-white/5">
            <div>
              <p className="text-[10px] text-[#8E8E93] font-medium">Gasto Mensual</p>
              <p className="text-sm font-black text-[#F5F5F7] mt-0.5">
                <AnimatedNumber
                  value={financials.monthlyTotal}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E93] font-medium">Suscripciones Activas</p>
              <p className="text-sm font-black text-[#0A84FF] mt-0.5">
                {financials.activeCount} servicios
              </p>
            </div>
          </div>

          {/* Upcoming payment notification pill */}
          {financials.nextUpcomingSub && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>{financials.nextUpcomingSub.sub.emoji}</span>
                <span className="font-semibold text-[#F5F5F7]">
                  {financials.nextUpcomingSub.sub.name}
                </span>
              </div>
              <span className="text-[#34C759] font-bold text-[11px]">
                En {financials.nextUpcomingSub.daysRemaining} días
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Integrity & SideStore Bypass Note */}
      <div className="p-4 rounded-2xl bg-[#141416] border border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/30 flex items-center justify-center text-[#BF5AF2] shrink-0">
          <IconShield className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-[#F5F5F7]">Aislamiento de Datos al 100%</p>
          <p className="text-[#8E8E93] mt-0.5 text-[11px]">
            Tus datos de RecompAI y Suscripciones están completamente aislados y seguros.
          </p>
        </div>
      </div>
    </div>
  );
};
