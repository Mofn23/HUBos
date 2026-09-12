'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { getGreeting, getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { calculateFinancialSummary } from '@/lib/financialsEngine';
import { findCurrentOrNextClass } from '@/lib/scheduleNotifications';
import { IconSettings } from '../common/Icons';

export const HubDashboard: React.FC = () => {
  const { userName, setCurrentApp, setIsSettingsOpen } = useHubStore();
  const { meals, targetCalories, targetCarbs, waterLogs, streak } = useRecompStore();
  const { subscriptions } = useSubsStore();
  const { subjects, tasks } = useScheduleStore();

  const nextClass = findCurrentOrNextClass(subjects);
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const todayKey = getTodayKey();
  const greeting = getGreeting();

  // Nutrition calculations for today
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayWater = waterLogs[todayKey] || 0;

  // Financial summary
  const financials = calculateFinancialSummary(subscriptions);
  const formattedMonthly = `$ ${Number(financials.monthlyTotal).toLocaleString('es-CO')}`;

  return (
    <div className="flex-1 flex flex-col px-4 pt-16 pb-16 overflow-y-auto no-scrollbar animate-fade-in space-y-6 relative">
      {/* Ambient Radial Glowing Orbs for Frosted Glass Refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#34C759]/10 blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#BF5AF2]/10 blur-[110px]" />
        <div className="absolute -bottom-16 left-1/4 w-80 h-80 rounded-full bg-[#0A84FF]/10 blur-[100px]" />
      </div>

      {/* 1. Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_10px_#34C759]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
              HUBos Suite
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#F5F5F7] tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
            Ecosistema Modular Unificado
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="glass-pill w-11 h-11 rounded-full flex items-center justify-center text-[#F5F5F7] hover:text-white hover:border-white/30 active:scale-90 transition-all shadow-md group"
          title="Ajustes de HUBos"
        >
          <IconSettings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* 2. Global Status Bento Card */}
      <div className="glass-surface rounded-[30px] p-5 space-y-4 relative z-10 border-t-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759] shadow-[0_0_8px_#34C759]" />
            </span>
            <span className="text-xs font-black text-[#F5F5F7] tracking-tight">
              Ecosistema Modular Conectado
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#34C759] text-[11px] font-black backdrop-blur-md">
            SideStore IPA
          </span>
        </div>

        {/* 2 Side-by-Side Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setCurrentApp('recomp')}
            className="glass-pill p-4 rounded-[22px] cursor-pointer hover:border-white/25 active:scale-98 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8E93]">RecompAI</span>
              <span className="text-base group-hover:scale-110 transition-transform">🥑</span>
            </div>
            <div className="text-lg font-black text-[#F5F5F7] tracking-tight">
              {Math.max(0, nutrition.calorieDifference)}{' '}
              <span className="text-xs font-bold text-[#8E8E93]">kcal rest.</span>
            </div>
            <span className="text-[11px] font-black text-[#34C759] block truncate">
              {nutrition.status === 'deficit'
                ? 'Déficit'
                : nutrition.status === 'surplus'
                ? 'Superávit'
                : 'Óptimo'}{' '}
              • {nutrition.glycogenPumpPercent}% Pump
            </span>
          </div>

          <div
            onClick={() => setCurrentApp('subs')}
            className="glass-pill p-4 rounded-[22px] cursor-pointer hover:border-white/25 active:scale-98 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8E93]">Suscripciones</span>
              <span className="text-base group-hover:scale-110 transition-transform">📺</span>
            </div>
            <div className="text-lg font-black text-[#F5F5F7] tracking-tight truncate">
              {formattedMonthly}
            </div>
            <span className="text-[11px] font-extrabold text-[#8E8E93] block truncate">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="px-1 flex items-center justify-between relative z-10">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          APLICACIONES MODULARES
        </h2>
        <span className="text-[10px] font-bold text-[#636366]">3 activas</span>
      </div>

      {/* 4. App Cards List (Bento Frosted Glass) */}
      <div className="space-y-4 relative z-10">
        {/* App 1: Recomp AI */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="glass-surface rounded-[30px] p-5 cursor-pointer hover:border-white/25 active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_12px_40px_rgba(52,199,89,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] bg-white/[0.06] border border-white/15 backdrop-blur-xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                🥑
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight group-hover:text-white transition-colors">
                  Recomp AI
                </h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Nutrición, Bomba de Glucógeno & Gym
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md group-hover:scale-105 transition-transform flex items-center gap-1">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💪 Racha: {streak?.currentStreak || 1}d
            </span>
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💧 {todayWater} / 10 vasos
            </span>
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#34C759]">
              🎯 {targetCalories} kcal
            </span>
          </div>
        </div>

        {/* App 2: Suscripciones */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="glass-surface rounded-[30px] p-5 cursor-pointer hover:border-white/25 active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_12px_40px_rgba(191,90,242,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] bg-white/[0.06] border border-white/15 backdrop-blur-xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                📺
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight group-hover:text-white transition-colors">
                  Suscripciones
                </h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Control de Gastos Fijos, Timeline & Fugas
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md group-hover:scale-105 transition-transform flex items-center gap-1">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💳 {formattedMonthly} / mes
            </span>
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#34C759]">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>

        {/* App 3: Horarios & Rutinas */}
        <div
          onClick={() => setCurrentApp('schedule')}
          className="glass-surface rounded-[30px] p-5 cursor-pointer hover:border-white/25 active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_12px_40px_rgba(10,132,255,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] bg-white/[0.06] border border-white/15 backdrop-blur-xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                📅
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight group-hover:text-white transition-colors">
                  Horarios & Rutinas
                </h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Universidad, Conducción, Calendario & Tareas
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md group-hover:scale-105 transition-transform flex items-center gap-1">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              {nextClass.type === 'live'
                ? `🔴 En curso: ${nextClass.subject?.name}`
                : nextClass.type === 'upcoming'
                ? `⏰ Próx: ${nextClass.subject?.name}`
                : '🗓️ Sin clases hoy'}
            </span>
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#34C759]">
              📝 {pendingTasksCount} pendiente{pendingTasksCount === 1 ? '' : 's'}
            </span>
            <span className="glass-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#8E8E93]">
              {subjects.length} materias
            </span>
          </div>
        </div>
      </div>

      {/* 5. System Utilities Card (Glassmorphism Minimalist) */}
      <div className="glass-surface rounded-[26px] p-4.5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[16px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-lg">
            ⚙️
          </div>
          <div>
            <h4 className="text-xs font-black text-[#F5F5F7]">Ajustes de Ecosistema & Gemini IA</h4>
            <p className="text-[11px] font-bold text-[#8E8E93]">Configuración de API Key y respaldos</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="glass-pill px-4 py-2 rounded-full text-xs font-black text-[#34C759] hover:text-white hover:border-white/30 active:scale-95 transition-all"
        >
          Ajustes
        </button>
      </div>
    </div>
  );
};
