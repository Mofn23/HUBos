'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { getGreeting, getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { IconSettings, IconSparkles } from '../common/Icons';

export const HubDashboard: React.FC = () => {
  const { userName, setCurrentApp, setIsSettingsOpen } = useHubStore();
  const { meals, targetCalories, targetCarbs, targetProtein, waterLogs, streak } = useRecompStore();
  const { subscriptions } = useSubsStore();

  const todayKey = getTodayKey();
  const greeting = getGreeting();

  // Nutrition calculations for today
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayWater = waterLogs[todayKey] || 0;

  // Financial summary
  const financials = calculateFinancialSummary(subscriptions);

  const formattedMonthly = `$ ${Number(financials.monthlyTotal).toLocaleString('es-CO')}`;

  return (
    <div className="flex-1 flex flex-col px-4 pt-16 pb-16 overflow-y-auto no-scrollbar animate-fade-in space-y-5">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#F5F5F7] tracking-tight">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
            HUBos • Ecosistema Modular Unificado
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-95 transition-all shadow-sm"
          title="Ajustes de HUBos"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Global Status Card (MonAI Dark Theme) */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-xs font-black text-[#F5F5F7]">Ecosistema Modular Activo</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#34C759]/15 text-[#34C759] text-[11px] font-black">
            SideStore IPA
          </span>
        </div>

        {/* 2 Side-by-Side Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setCurrentApp('recomp')}
            className="p-4 rounded-[22px] bg-[#242426] border border-white/5 cursor-pointer active:scale-98 transition-transform space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8E93]">RecompAI</span>
              <span className="text-base">🥑</span>
            </div>
            <div className="text-lg font-black text-[#F5F5F7] tracking-tight">
              {Math.max(0, nutrition.calorieDifference)} <span className="text-xs text-[#8E8E93]">kcal rest.</span>
            </div>
            <span className="text-[11px] font-extrabold text-[#34C759] block">
              {nutrition.status === 'deficit' ? 'En Déficit' : nutrition.status === 'surplus' ? 'En Superávit' : 'Óptimo'} • {nutrition.glycogenPumpPercent}% Pump
            </span>
          </div>

          <div
            onClick={() => setCurrentApp('subs')}
            className="p-4 rounded-[22px] bg-[#242426] border border-white/5 cursor-pointer active:scale-98 transition-transform space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8E93]">Suscripciones</span>
              <span className="text-base">📺</span>
            </div>
            <div className="text-lg font-black text-[#F5F5F7] tracking-tight">
              {formattedMonthly}
            </div>
            <span className="text-[11px] font-extrabold text-[#8E8E93] block">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="px-1">
        <h2 className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
          APLICACIONES MODULARES
        </h2>
      </div>

      {/* 4. App Cards List */}
      <div className="space-y-3.5">
        {/* App 1: Recomp AI */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/5 shadow-md cursor-pointer active:scale-[0.98] transition-all space-y-3.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#242426] border border-white/5 flex items-center justify-center text-3xl shadow-inner">
                🥑
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">Recomp AI</h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Nutrición, Bomba de Glucógeno & Gym
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-[#34C759] text-black font-black text-xs shadow group-hover:scale-105 transition-transform"
            >
              Abrir →
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E93] pt-1 border-t border-white/5">
            <span className="px-2.5 py-1 rounded-full bg-[#242426] text-[#F5F5F7]">
              💪 Racha: {streak?.currentStreak || 1}d
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#242426] text-[#F5F5F7]">
              💧 {todayWater} / 10 vasos
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#242426] text-[#34C759]">
              🎯 Meta: {targetCalories} kcal
            </span>
          </div>
        </div>

        {/* App 2: Suscripciones */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/5 shadow-md cursor-pointer active:scale-[0.98] transition-all space-y-3.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#242426] border border-white/5 flex items-center justify-center text-3xl shadow-inner">
                📺
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">Suscripciones</h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Control de Gastos Fijos, Timeline & Fugas
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-[#34C759] text-black font-black text-xs shadow group-hover:scale-105 transition-transform"
            >
              Abrir →
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#8E8E93] pt-1 border-t border-white/5">
            <span className="px-2.5 py-1 rounded-full bg-[#242426] text-[#F5F5F7]">
              💳 {formattedMonthly} / mes
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#242426] text-[#34C759]">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>
      </div>

      {/* 5. System Utilities Card */}
      <div className="p-4 rounded-[24px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#242426] flex items-center justify-center text-lg">
            ⚙️
          </div>
          <div>
            <h4 className="text-xs font-black text-[#F5F5F7]">Ajustes de Ecosistema & Gemini IA</h4>
            <p className="text-[11px] font-bold text-[#8E8E93]">Configuración de API Key y respaldos</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-[#242426] border border-white/10 text-xs font-black text-[#34C759] active:scale-90 transition-transform"
        >
          Ajustes
        </button>
      </div>
    </div>
  );
};
