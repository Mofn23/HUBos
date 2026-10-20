'use client';

import React, { useEffect, useState } from 'react';
import { useHubStore, AppModule } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { SubscriptionItem, useSubsStore } from '@/stores/useSubsStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { WorkoutRoutine } from '@/types/workout';
import { formatCurrency } from '@/lib/utils';
import { getGreeting, getTodayKey } from '@/lib/date';
import { IconSettings } from '../common/Icons';

const apps: { id: AppModule; name: string; icon: string }[] = [
  { id: 'recomp', name: 'RecompAI', icon: '🥑' },
  { id: 'subs', name: 'Suscripciones', icon: '📺' },
  { id: 'aesthetix', name: 'Aesthetix', icon: '⚡' },
];

const localDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function getNextBillingDate(subscription: SubscriptionItem, todayKey: string): Date {
  const today = localDate(todayKey);
  const intervalMonths = {
    monthly: 1,
    bimonthly: 2,
    quarterly: 3,
    yearly: 12,
  } as const;

  if (subscription.frequency === 'weekly') {
    const anchor = subscription.lastPaidDate
      ? localDate(subscription.lastPaidDate)
      : new Date(subscription.createdAt);
    anchor.setHours(0, 0, 0, 0);
    while (anchor < today) anchor.setDate(anchor.getDate() + 7);
    return anchor;
  }

  const interval = intervalMonths[subscription.frequency];
  const anchorKey = subscription.lastPaidDate || dateKey(new Date(subscription.createdAt));
  const anchor = localDate(anchorKey);
  const candidate = new Date(today.getFullYear(), today.getMonth(), 1);
  const anchorMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthsSinceAnchor =
    (candidate.getFullYear() - anchorMonth.getFullYear()) * 12 +
    candidate.getMonth() - anchorMonth.getMonth();
  let monthsAhead = ((interval - (monthsSinceAnchor % interval)) % interval);
  let due = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1);
  const day = Math.min(subscription.billingDay, new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate());
  due.setDate(day);

  if (due < today || (subscription.lastPaidDate && dateKey(due) <= subscription.lastPaidDate)) {
    monthsAhead += interval || 1;
    due = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1);
    due.setDate(Math.min(subscription.billingDay, new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate()));
  }
  return due;
}

function getTodayRoutine(routines: WorkoutRoutine[], activeRoutineId: string | null, date: Date) {
  const routine = routines.find((item) => item.id === activeRoutineId) || routines[0];
  if (!routine || routine.days.length === 0) return null;

  const weekday = date.getDay(); // Sunday is 0.
  const spanishDay = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][weekday];
  const matchingDay = routine.days.find((day) =>
    day.dayName.trim().toLocaleLowerCase('es').startsWith(spanishDay)
  );

  if (matchingDay) return { routine, day: matchingDay };

  // For routines without weekday names, place the days in order from Monday onward.
  const mondayFirstIndex = (weekday + 6) % 7;
  if (mondayFirstIndex < Math.min(routine.days.length, routine.targetDaysPerWeek)) {
    return { routine, day: routine.days[mondayFirstIndex % routine.days.length] };
  }
  return { routine, day: null };
}

export const HubDashboard: React.FC = () => {
  const { setCurrentApp, setIsSettingsOpen, currency } = useHubStore();
  const waterLogs = useRecompStore((state) => state.waterLogs);
  const supplements = useRecompStore((state) => state.supplements);
  const subscriptions = useSubsStore((state) => state.subscriptions);
  const routines = useAesthetixStore((state) => state.routines);
  const activeRoutineId = useAesthetixStore((state) => state.activeRoutineId);

  const [greeting, setGreeting] = useState('');
  const [todayKey, setTodayKey] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateDateAndGreeting = () => {
      setGreeting(getGreeting());
      setTodayKey(getTodayKey());
      setIsReady(true);
    };
    updateDateAndGreeting();
    document.addEventListener('visibilitychange', updateDateAndGreeting);
    return () => document.removeEventListener('visibilitychange', updateDateAndGreeting);
  }, []);

  const creatine = supplements.find((supplement) => /creatin/i.test(supplement.name));
  const creatineTaken = !!todayKey && !!creatine?.takenDates.includes(todayKey);
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'active');
  const nearestSubscription = isReady && activeSubscriptions.length > 0
    ? activeSubscriptions
        .map((subscription) => ({ subscription, dueDate: getNextBillingDate(subscription, todayKey) }))
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]
    : null;
  const todayRoutine = isReady ? getTodayRoutine(routines, activeRoutineId, localDate(todayKey)) : null;

  return (
    <div className="relative flex-1 overflow-y-auto px-5 pt-16 pb-10 no-scrollbar animate-fade-in">
      <header className="mb-8 flex items-start justify-between">
        <h1 className="min-h-[38px] text-3xl font-black tracking-tight text-white" aria-live="off">
          {greeting || '\u00a0'}
        </h1>
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-white/25 transition-colors hover:text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45]"
          title="Ajustes"
          aria-label="Ajustes"
        >
          <IconSettings className="h-3.5 w-3.5" />
        </button>
      </header>

      <section aria-labelledby="hub-apps-title">
        <h2 id="hub-apps-title" className="mb-4 px-1 text-sm font-semibold text-[#8E8E93]">
          Aplicaciones
        </h2>

        <div className="flex flex-col gap-3">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => setCurrentApp(app.id)}
              aria-label={`Abrir ${app.name}`}
              className="group flex min-h-36 w-full items-center gap-4 rounded-[24px] border border-white/[0.06] bg-[#1C1C1E] px-4 py-4 text-left transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/[0.12] hover:bg-[#242426] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45]"
            >
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/[0.06] text-3xl leading-none transition-transform duration-300 group-hover:scale-105">
                {app.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-white">{app.name}</span>
                {app.id === 'recomp' && (
                  <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[#A1A1A8]">
                    <span>💧 {isReady ? `${waterLogs[todayKey] || 0} vasos` : '— vasos'}</span>
                    <span>Creatina · {!isReady ? '—' : creatine ? (creatineTaken ? 'Tomada' : 'Pendiente') : 'No configurada'}</span>
                  </span>
                )}
                {app.id === 'subs' && (
                  <span className="mt-2 block min-w-0 text-xs font-medium text-[#A1A1A8]">
                    {!isReady
                      ? 'Cargando próximo cobro…'
                      : nearestSubscription
                        ? <><span className="text-[#F5F5F7]">{nearestSubscription.subscription.emoji} {nearestSubscription.subscription.name}</span><span className="mt-1 block">{formatCurrency(nearestSubscription.subscription.amount, currency)} · {new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(nearestSubscription.dueDate)}</span></>
                        : 'Sin cobros próximos'}
                  </span>
                )}
                {app.id === 'aesthetix' && (
                  <span className="mt-2 block min-w-0 text-xs font-medium text-[#A1A1A8]">
                    {!isReady
                      ? 'Cargando rutina de hoy…'
                      : todayRoutine?.day
                        ? <><span className="block truncate text-[#F5F5F7]">{todayRoutine.day.dayName}</span><span className="mt-1 block truncate">{todayRoutine.day.focus} · {todayRoutine.day.exercises.length} ejercicios</span></>
                        : <><span className="block text-[#F5F5F7]">Descanso</span><span className="mt-1 block">Hoy no hay rutina programada</span></>}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
