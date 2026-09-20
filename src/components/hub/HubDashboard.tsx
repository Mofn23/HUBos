'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
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
  const { currentStreak: aesthetixStreak, getOverallRank, activeSession: aesthetixActiveSession } = useAesthetixStore();

  const aesthetixRank = getOverallRank();
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
      {/* Ambient Soft Clay Lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#16A34A]/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#3B82F6]/5 blur-[130px]" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-[#9333EA]/5 blur-[120px]" />
      </div>

      {/* 1. Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16A34A] shadow-[0_0_10px_#16A34A]" />
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
          className="clay-pill w-11 h-11 rounded-full flex items-center justify-center text-[#F5F5F7] hover:text-white active:scale-90 transition-all shadow-md group"
          title="Ajustes de HUBos"
        >
          <IconSettings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* 2. Global Status Bento Card */}
      <div className="clay-surface rounded-[32px] p-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A] shadow-[0_0_8px_#16A34A]" />
            </span>
            <span className="text-xs font-black text-[#F5F5F7] tracking-tight">
              Ecosistema Modular Conectado
            </span>
          </div>
          <span className="px-3 py-1 rounded-full clay-pill text-[#16A34A] text-[11px] font-black">
            SideStore IPA
          </span>
        </div>

        {/* 2 Side-by-Side Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setCurrentApp('recomp')}
            className="clay-pill p-4 rounded-[24px] cursor-pointer active:scale-98 transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E8E93]">RecompAI</span>
              <span className="text-base group-hover:scale-110 transition-transform">🥑</span>
            </div>
            <div className="text-lg font-black text-[#F5F5F7] tracking-tight">
              {Math.max(0, nutrition.calorieDifference)}{' '}
              <span className="text-xs font-bold text-[#8E8E93]">kcal rest.</span>
            </div>
            <span className="text-[11px] font-black text-[#DE7356] block truncate">
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
            className="clay-pill p-4 rounded-[24px] cursor-pointer active:scale-98 transition-all space-y-1.5 group"
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
        <span className="text-[10px] font-bold text-[#636366]">4 activas</span>
      </div>

      {/* 4. App Cards List (Claymorphism Bento) */}
      <div className="space-y-4 relative z-10">
        {/* App 1: Recomp AI */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="clay-surface rounded-[32px] p-5 cursor-pointer active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_16px_36px_rgba(222,115,86,0.25)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] clay-pill flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
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

            <div className="clay-btn-emerald px-4 py-2 text-xs font-black flex items-center gap-1 cursor-pointer group-hover:scale-105 transition-transform">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💪 Racha: {streak?.currentStreak || 1}d
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💧 {todayWater} / 10 vasos
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#DE7356]">
              🎯 {targetCalories} kcal
            </span>
          </div>
        </div>

        {/* App 2: Suscripciones */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="clay-surface rounded-[32px] p-5 cursor-pointer active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_16px_36px_rgba(147,51,234,0.22)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] clay-pill flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
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

            <div className="clay-btn-emerald px-4 py-2 text-xs font-black flex items-center gap-1 cursor-pointer group-hover:scale-105 transition-transform">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              💳 {formattedMonthly} / mes
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#DE7356]">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>

        {/* App 3: Horarios & Rutinas */}
        <div
          onClick={() => setCurrentApp('schedule')}
          className="clay-surface rounded-[32px] p-5 cursor-pointer active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_16px_36px_rgba(59,130,246,0.22)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] clay-pill flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
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

            <div className="clay-btn-emerald px-4 py-2 text-xs font-black flex items-center gap-1 cursor-pointer group-hover:scale-105 transition-transform">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              {nextClass.type === 'live'
                ? `🔴 En curso: ${nextClass.subject?.name}`
                : nextClass.type === 'upcoming'
                ? `⏰ Próx: ${nextClass.subject?.name}`
                : '🗓️ Sin clases hoy'}
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#DE7356]">
              📝 {pendingTasksCount} pendiente{pendingTasksCount === 1 ? '' : 's'}
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#8E8E93]">
              {subjects.length} materias
            </span>
          </div>
        </div>

        {/* App 4: Aesthetix (Gym, 1.324 Ejercicios, Modo Gym & Rangos) */}
        <div
          onClick={() => setCurrentApp('aesthetix')}
          className="clay-surface rounded-[32px] p-5 cursor-pointer active:scale-[0.98] transition-all space-y-4 group hover:shadow-[0_16px_36px_rgba(220,38,38,0.22)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-[22px] clay-pill flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                ⚡
              </div>

              <div>
                <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight group-hover:text-white transition-colors">
                  Aesthetix
                </h3>
                <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
                  Hipertrofia, 1.324 Ejercicios, Modo Gym & Rangos
                </p>
              </div>
            </div>

            <div className="clay-btn-emerald px-4 py-2 text-xs font-black flex items-center gap-1 cursor-pointer group-hover:scale-105 transition-transform">
              <span>Abrir</span>
              <span className="font-bold">→</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#D97706]">
              🔥 Racha: {aesthetixStreak}d
            </span>
            <span
              className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black"
              style={{ color: aesthetixRank.overallTier.color }}
            >
              👑 Rango: {aesthetixRank.overallTier.label}
            </span>
            <span className="clay-pill shrink-0 px-3 py-1 rounded-full text-xs font-black text-[#3B82F6]">
              {aesthetixActiveSession ? '🔴 Sesión en curso' : '1.324 ejercicios'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. System Utilities Card (Claymorphism Minimalist) */}
      <div className="clay-surface rounded-[26px] p-4.5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[16px] clay-pill flex items-center justify-center text-lg">
            ⚙️
          </div>
          <div>
            <h4 className="text-xs font-black text-[#F5F5F7]">Ajustes de Ecosistema & Gemini IA</h4>
            <p className="text-[11px] font-bold text-[#8E8E93]">Configuración de API Key y respaldos</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="clay-btn-emerald px-4 py-2 text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Ajustes
        </button>
      </div>
    </div>
  );
};
