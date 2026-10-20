import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { SubscriptionItem } from '@/stores/useSubsStore';

function formatAmount(amount: number): string {
  try {
    return new Intl.NumberFormat('es-CO').format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    return false;
  }
}

export async function sendLocalNotification(
  arg1: string | number,
  arg2: string,
  arg3?: string | number
) {
  let title = '';
  let body = '';
  let id = Date.now() % 100000;

  if (typeof arg1 === 'number') {
    id = arg1;
    title = arg2;
    body = typeof arg3 === 'string' ? arg3 : '';
  } else {
    title = arg1;
    body = arg2;
    if (typeof arg3 === 'number') id = arg3;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
          },
        ],
      });
    } catch (e) {
      console.warn('Native notification error:', e);
    }
  } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

/** IDs de los recordatorios diarios de RecompAI (rango 1xx). */
export const DAILY_REMINDER_IDS = [101, 102, 103, 104, 105, 106];

/**
 * Horario único de los recordatorios diarios. La UI de ajustes lo usa para
 * mostrar exactamente cuándo notifica la app.
 */
export const DAILY_REMINDERS = [
  {
    id: 106,
    hour: 9,
    minute: 0,
    title: 'Progreso físico',
    body: 'Registra tu peso, tus medidas o una foto de progreso para ver tu evolución real en RecompAI.',
  },
  {
    id: 101,
    hour: 10,
    minute: 0,
    title: 'Desayuno',
    body: 'Registra tu desayuno o escanea el plato con IA para ajustar tus macros del día.',
  },
  {
    id: 102,
    hour: 14,
    minute: 0,
    title: 'Almuerzo y entrenamiento',
    body: 'Revisa tus carbohidratos y la rutina que toca hoy.',
  },
  {
    id: 103,
    hour: 18,
    minute: 0,
    title: 'Creatina',
    body: 'Tu dosis de 3-5 g para mantener la saturación muscular.',
  },
  {
    id: 104,
    hour: 20,
    minute: 30,
    title: 'Cena y cierre de macros',
    body: 'Completa la proteína que te falta antes de cerrar el día.',
  },
  {
    id: 105,
    hour: 21,
    minute: 30,
    title: 'Racha de nutrición',
    body: 'Aún no registras comidas hoy. Mantén tu racha con un registro rápido.',
  },
] as const;

/** Cancela los recordatorios diarios que ya estén programados en iOS. */
export async function cancelDailyReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter((n) => DAILY_REMINDER_IDS.includes(n.id));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }
  } catch (error) {
    console.warn('[Notifications] Error cancelando recordatorios diarios:', error);
  }
}

/**
 * Programa (o cancela) los recordatorios diarios de RecompAI.
 * Se reprograman desde cero en cada arranque para aplicar cambios de texto u horario.
 */
export async function initNativeNotifications(enabled = true) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!enabled) {
      await cancelDailyReminders();
      return;
    }

    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    await cancelDailyReminders();

    await LocalNotifications.schedule({
      notifications: DAILY_REMINDERS.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        body: reminder.body,
        schedule: {
          on: { hour: reminder.hour, minute: reminder.minute },
          allowWhileIdle: true,
        },
        sound: 'default',
      })),
    });
  } catch (error) {
    console.warn('Local notifications error:', error);
  }
}

/**
 * Schedules OS-level native reminders for upcoming subscriptions without needing the app to be open.
 * Uses exact reminder days configured per subscription at 09:00 AM.
 * Formats texts cleanly without parentheses and with formatted currency.
 */
export async function scheduleAllSubscriptionReminders(
  subscriptions: SubscriptionItem[],
  currency = 'COP'
) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    // Get all pending and cancel existing subscription reminders (IDs >= 20000)
    const pending = await LocalNotifications.getPending();
    const subsPending = pending.notifications.filter((n) => n.id >= 20000 && n.id < 90000);
    if (subsPending.length > 0) {
      await LocalNotifications.cancel({ notifications: subsPending });
    }

    const now = new Date();
    const newNotifications: any[] = [];

    subscriptions.forEach((sub, index) => {
      if (sub.status !== 'active') return;

      const reminderDays = typeof sub.reminderDays === 'number' ? sub.reminderDays : 3;
      const formattedPrice = formatAmount(sub.amount);

      // Compute the next billing date for this subscription
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const billingDay = Math.min(Math.max(sub.billingDay || 1, 1), 28); // Cap at 28 to safely fit all months

      // Candidate 1: this month
      let targetBilling = new Date(currentYear, currentMonth, billingDay, 9, 0, 0, 0);
      let alertDate = new Date(targetBilling.getTime() - reminderDays * 24 * 60 * 60 * 1000);

      // If this month's alert date has already passed, schedule for next month
      if (alertDate.getTime() <= now.getTime()) {
        targetBilling = new Date(currentYear, currentMonth + 1, billingDay, 9, 0, 0, 0);
        alertDate = new Date(targetBilling.getTime() - reminderDays * 24 * 60 * 60 * 1000);
      }

      if (alertDate.getTime() > now.getTime()) {
        const diffDays = Math.max(0, Math.round((targetBilling.getTime() - alertDate.getTime()) / (24 * 60 * 60 * 1000)));
        const bodyText =
          diffDays === 0
            ? `Tu suscripción a ${sub.name} vence hoy por un valor de $${formattedPrice} ${currency}.`
            : `Tu suscripción a ${sub.name} renovará en ${diffDays} ${diffDays === 1 ? 'día' : 'días'} por un valor de $${formattedPrice} ${currency}.`;

        newNotifications.push({
          id: 20000 + (index % 60000),
          title: `Recordatorio de pago · ${sub.name}`,
          body: bodyText,
          schedule: {
            at: alertDate,
            allowWhileIdle: true,
          },
          sound: 'default',
        });
      }
    });

    if (newNotifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: newNotifications,
      });
      console.log(`[Notifications] Programadas ${newNotifications.length} notificaciones de suscripción en segundo plano`);
    }
  } catch (error) {
    console.warn('[Notifications] Error scheduling subscription reminders:', error);
  }
}

/**
 * Checks subscriptions and sends immediate notification if due today or within daysAhead.
 * Format is completely free of parentheses.
 */
export function checkAndNotifyUpcomingSubscriptions(
  subscriptions: SubscriptionItem[],
  daysAheadOrCurrency: number | string = 3,
  currency = 'COP'
) {
  const daysAhead = typeof daysAheadOrCurrency === 'number' ? daysAheadOrCurrency : 3;
  const effectiveCurrency = typeof daysAheadOrCurrency === 'string' ? daysAheadOrCurrency : currency;
  const now = new Date();
  const currentDay = now.getDate();

  subscriptions.forEach((sub) => {
    if (sub.status !== 'active') return;

    let diff = sub.billingDay - currentDay;
    if (diff < 0) diff += 30;

    const reminderDays = typeof sub.reminderDays === 'number' ? sub.reminderDays : daysAhead;

    if (diff <= reminderDays && diff >= 0) {
      const formattedPrice = formatAmount(sub.amount);
      const msg =
        diff === 0
          ? `Tu suscripción a ${sub.name} vence hoy por un valor de $${formattedPrice} ${effectiveCurrency}.`
          : `Tu suscripción a ${sub.name} renovará en ${diff} ${diff === 1 ? 'día' : 'días'} por un valor de $${formattedPrice} ${effectiveCurrency}.`;

      sendLocalNotification(`Recordatorio de pago · ${sub.name}`, msg, sub.billingDay * 100);
    }
  });

  // Also trigger OS-level scheduling so future dates are set in iOS system background
  scheduleAllSubscriptionReminders(subscriptions, effectiveCurrency);
}
