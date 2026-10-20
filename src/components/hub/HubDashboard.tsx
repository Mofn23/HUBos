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
import {
  IconSettings,
  IconChevronRight,
  IconZap,
  IconActivity,
  IconCreditCard,
  IconCalendar,
} from '../common/Icons';

export const HubDashboard: React.FC = () => {
  const { userName, setCurrentApp, setIsSettingsOpen } = useHubStore();
  const { meals, targetCalories, targetCarbs, waterLogs, streak } = useRecompStore();
  const { subscriptions } = useSubsStore();
  const { subjects, tasks } = useScheduleStore();
  const {
    currentStreak: aesthetixStreak,
    getOverallRank,
    activeSession: aesthetixActiveSession,
  } = useAesthetixStore();

  const aesthetixRank = getOverallRank();
  const nextClass = findCurrentOrNextClass(subjects);
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const todayKey = getTodayKey();
  const greeting = getGreeting();

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  // Nutrition calculations for today
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayWater = waterLogs[todayKey] || 0;

  // Financial summary
  const financials = calculateFinancialSummary(subscriptions);
  const formattedMonthly = `$ ${Number(financials.monthlyTotal).toLocaleString('es-CO')}`;

  // Rings calculations
  const consumedCal = nutrition.consumedCalories;
  const movePct = Math.min(100, Math.round((consumedCal / Math.max(targetCalories, 1)) * 100));
  const gymPct = Math.min(100, aesthetixActiveSession ? 100 : aesthetixStreak > 0 ? 80 : 25);
  const taskPct = Math.min(100, pendingTasksCount === 0 ? 100 : Math.round((1 / (pendingTasksCount + 1)) * 100));

  return (
    <div className="flex-1 flex flex-col px-4 pt-12 pb-28 overflow-y-auto no-scrollbar animate-fade-in space-y-5 relative min-h-screen bg-black text-white">
      {/* Ambient Apple Fitness Radial Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FA114F]/10 blur-[130px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[#A1F524]/10 blur-[130px]" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-[#00F0FF]/10 blur-[130px]" />
      </div>

      {/* 1. Apple Fitness Top Header */}
      <header className="relative z-10 flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#8E8E93] uppercase">
            {formattedDate}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight mt-0.5">
            {greeting}, {userName}
          </h1>
          <p className="text-xs font-semibold text-[#8E8E93]">
            Resumen General del Ecosistema
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90 transition-all fitness-press shadow-md"
          title="Ajustes de HUBos"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Apple Activity Rings Overview Card (Bento Master) */}
      <div className="fitness-card p-5 relative overflow-hidden shadow-2xl border border-white/[0.08] relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
              Actividad del Día
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#A1F524]/15 border border-[#A1F524]/30 text-[#A1F524] text-[11px] font-bold">
            HUBos Suite
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Concentric Rings Visualizer */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 120 120">
              {/* Outer Ring: Move Red */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#FA114F"
                strokeWidth="9"
                strokeOpacity="0.2"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#FA114F"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (314.159 * movePct) / 100}
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Ring: Exercise Lime */}
              <circle
                cx="60"
                cy="60"
                r="38"
                stroke="#A1F524"
                strokeWidth="9"
                strokeOpacity="0.2"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="38"
                stroke="#A1F524"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="238.76"
                strokeDashoffset={238.76 - (238.76 * gymPct) / 100}
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: Stand Cyan */}
              <circle
                cx="60"
                cy="60"
                r="26"
                stroke="#00F0FF"
                strokeWidth="9"
                strokeOpacity="0.2"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="26"
                stroke="#00F0FF"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (163.36 * taskPct) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Metrics Column */}
          <div className="space-y-2 flex-1 min-w-0">
            <div>
              <div className="text-[11px] font-bold text-[#8E8E93] uppercase">Nutrición (Move)</div>
              <div className="text-base font-black text-[#FA114F] tracking-tight">
                {consumedCal}
                <span className="text-xs font-semibold text-[#8E8E93]">/{targetCalories} CAL</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#8E8E93] uppercase">Aesthetix (Gym)</div>
              <div className="text-base font-black text-[#A1F524] tracking-tight">
                {aesthetixStreak} <span className="text-xs font-semibold text-[#8E8E93]">DÍAS RACHA</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#8E8E93] uppercase">Horarios & Tareas</div>
              <div className="text-base font-black text-[#00F0FF] tracking-tight">
                {pendingTasksCount}{' '}
                <span className="text-xs font-semibold text-[#8E8E93]">PENDIENTES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 2-Column Apple Bento Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {/* Bento 1: Recomp AI */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="fitness-card p-4 rounded-3xl cursor-pointer active:scale-95 transition-all space-y-2 group fitness-press flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E8E93]">Recomp AI</span>
            <div className="w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
              <IconChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-[#A1F524] tracking-tight">
              {Math.max(0, nutrition.calorieDifference)}
            </div>
            <div className="text-[11px] font-bold text-[#8E8E93]">kcal restantes</div>
          </div>

          <div className="text-[10px] font-bold text-white/70 truncate pt-1 border-t border-white/5">
            {nutrition.status === 'deficit' ? 'Déficit' : 'Óptimo'} • {nutrition.glycogenPumpPercent}% Pump
          </div>
        </div>

        {/* Bento 2: Suscripciones */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="fitness-card p-4 rounded-3xl cursor-pointer active:scale-95 transition-all space-y-2 group fitness-press flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E8E93]">Suscripciones</span>
            <div className="w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
              <IconChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="text-xl font-black text-[#BF5AF2] tracking-tight truncate">
              {formattedMonthly}
            </div>
            <div className="text-[11px] font-bold text-[#8E8E93]">Gasto Mensual</div>
          </div>

          <div className="text-[10px] font-bold text-white/70 truncate pt-1 border-t border-white/5">
            {financials.activeCount} servicios activos
          </div>
        </div>

        {/* Bento 3: Aesthetix Gym */}
        <div
          onClick={() => setCurrentApp('aesthetix')}
          className="fitness-card p-4 rounded-3xl cursor-pointer active:scale-95 transition-all space-y-2 group fitness-press flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E8E93]">Aesthetix</span>
            <div className="w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
              <IconChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-[#FA114F] tracking-tight">
              {aesthetixStreak} <span className="text-sm">días</span>
            </div>
            <div className="text-[11px] font-bold text-[#8E8E93]">Racha Activa</div>
          </div>

          <div
            className="text-[10px] font-bold truncate pt-1 border-t border-white/5"
            style={{ color: aesthetixRank.overallTier.color }}
          >
            👑 {aesthetixRank.overallTier.label}
          </div>
        </div>

        {/* Bento 4: Horarios & Tareas */}
        <div
          onClick={() => setCurrentApp('schedule')}
          className="fitness-card p-4 rounded-3xl cursor-pointer active:scale-95 transition-all space-y-2 group fitness-press flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E8E93]">Horarios</span>
            <div className="w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] group-hover:text-white transition-colors">
              <IconChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="text-base font-black text-[#00F0FF] tracking-tight truncate">
              {nextClass.type === 'live'
                ? nextClass.subject?.name
                : nextClass.type === 'upcoming'
                ? nextClass.subject?.name
                : 'Libre Hoy'}
            </div>
            <div className="text-[11px] font-bold text-[#8E8E93]">
              {nextClass.type === 'live' ? 'En Curso' : 'Próxima Clase'}
            </div>
          </div>

          <div className="text-[10px] font-bold text-white/70 truncate pt-1 border-t border-white/5">
            📝 {pendingTasksCount} tarea{pendingTasksCount === 1 ? '' : 's'} pendiente{pendingTasksCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* 4. Modular Apps Section Title */}
      <div className="px-1 flex items-center justify-between relative z-10 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
          Módulos HUBos
        </h2>
        <span className="text-[11px] font-bold text-[#636366]">4 instalados</span>
      </div>

      {/* 5. Apple Fitness Workout-style App Cards */}
      <div className="space-y-3 relative z-10">
        {/* App 1: Aesthetix */}
        <div
          onClick={() => setCurrentApp('aesthetix')}
          className="fitness-card p-4.5 rounded-3xl cursor-pointer active:scale-[0.98] transition-all space-y-3 group border border-white/[0.08] hover:border-[#FA114F]/40 bg-gradient-to-r from-white/[0.02] to-transparent fitness-press"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FA114F]/15 border border-[#FA114F]/30 flex items-center justify-center text-xl text-[#FA114F]">
                <IconZap className="w-6 h-6 text-[#FA114F]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Aesthetix
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Hipertrofia, 1.324 Ejercicios & Modo Gym
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#A1F524] text-black flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-transform">
              <IconChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-[#FA114F]">
              🔥 Racha: {aesthetixStreak}d
            </span>
            <span
              className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold"
              style={{ color: aesthetixRank.overallTier.color }}
            >
              👑 {aesthetixRank.overallTier.label}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-white/80">
              {aesthetixActiveSession ? '🔴 Sesión Activa' : '1.324 ejercicios'}
            </span>
          </div>
        </div>

        {/* App 2: Recomp AI */}
        <div
          onClick={() => setCurrentApp('recomp')}
          className="fitness-card p-4.5 rounded-3xl cursor-pointer active:scale-[0.98] transition-all space-y-3 group border border-white/[0.08] hover:border-[#A1F524]/40 bg-gradient-to-r from-white/[0.02] to-transparent fitness-press"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#A1F524]/15 border border-[#A1F524]/30 flex items-center justify-center text-xl text-[#A1F524]">
                <IconActivity className="w-6 h-6 text-[#A1F524]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Recomp AI
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Nutrición, Bomba de Glucógeno & Dieta
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#A1F524] text-black flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-transform">
              <IconChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-[#A1F524]">
              🥑 {targetCalories} kcal
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-white/80">
              💧 {todayWater} / 12 vasos
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-[#00F0FF]">
              ⚡ {nutrition.glycogenPumpPercent}% Pump
            </span>
          </div>
        </div>

        {/* App 3: Suscripciones */}
        <div
          onClick={() => setCurrentApp('subs')}
          className="fitness-card p-4.5 rounded-3xl cursor-pointer active:scale-[0.98] transition-all space-y-3 group border border-white/[0.08] hover:border-[#BF5AF2]/40 bg-gradient-to-r from-white/[0.02] to-transparent fitness-press"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/30 flex items-center justify-center text-xl text-[#BF5AF2]">
                <IconCreditCard className="w-6 h-6 text-[#BF5AF2]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Suscripciones
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Control de Gastos Fijos & Fugas de Dinero
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#A1F524] text-black flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-transform">
              <IconChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-[#BF5AF2]">
              💳 {formattedMonthly} / mes
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-white/80">
              {financials.activeCount} servicios activos
            </span>
          </div>
        </div>

        {/* App 4: Horarios & Rutinas */}
        <div
          onClick={() => setCurrentApp('schedule')}
          className="fitness-card p-4.5 rounded-3xl cursor-pointer active:scale-[0.98] transition-all space-y-3 group border border-white/[0.08] hover:border-[#00F0FF]/40 bg-gradient-to-r from-white/[0.02] to-transparent fitness-press"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-xl text-[#00F0FF]">
                <IconCalendar className="w-6 h-6 text-[#00F0FF]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Horarios & Rutinas
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Universidad, Calendario Semanal & Tareas
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#A1F524] text-black flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-transform">
              <IconChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/5">
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-[#00F0FF]">
              {nextClass.type === 'live'
                ? `🔴 En curso: ${nextClass.subject?.name}`
                : nextClass.type === 'upcoming'
                ? `⏰ Próx: ${nextClass.subject?.name}`
                : '🗓️ Sin clases hoy'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#2C2C2E] text-xs font-bold text-white/80">
              📝 {pendingTasksCount} tarea{pendingTasksCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Settings & Quick Access Pill */}
      <div className="fitness-card p-4 rounded-3xl flex items-center justify-between relative z-10 border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-lg">
            ⚙️
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Ajustes & Gemini IA</h4>
            <p className="text-[11px] text-[#8E8E93]">API Key, respaldos y SideStore IPA</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-bold text-white active:scale-95 transition-all fitness-press"
        >
          Abrir
        </button>
      </div>
    </div>
  );
};
