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

export async function initNativeNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    // Flush cache of previously scheduled notifications with daily reminder IDs (101-105)
    const pending = await LocalNotifications.getPending();
    const routineIds = [101, 102, 103, 104, 105];
    const toCancel = pending.notifications.filter((n) => routineIds.includes(n.id));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    // Schedule daily recurrent notifications
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101,
          title: '🥐 Hora del Desayuno',
          body: 'Registra tu desayuno o toma una foto para que la IA calcule tus macros.',
          schedule: {
            on: { hour: 10, minute: 0 },
            allowWhileIdle: true,
          },
          sound: 'default',
        },
        {
          id: 102,
          title: '🍲 Almuerzo & Entrenamiento',
          body: '¡Mantén la energía alta! Revisa tus carbohidratos y tu rutina de hoy.',
          schedule: {
            on: { hour: 14, minute: 0 },
            allowWhileIdle: true,
          },
          sound: 'default',
        },
        {
          id: 103,
          title: '💊 Snack & Creatina',
          body: 'No olvides tomar tu dosis de 3-5g de creatina para mantener la saturación.',
          schedule: {
            on: { hour: 18, minute: 0 },
            allowWhileIdle: true,
          },
          sound: 'default',
        },
        {
          id: 104,
          title: '🍽️ Cena & Cierre de Macros',
          body: 'Ajusta tus proteínas y calorías restantes antes de finalizar tu día.',
          schedule: {
            on: { hour: 20, minute: 30 },
            allowWhileIdle: true,
          },
          sound: 'default',
        },
        {
          id: 105,
          title: '🔥 ¡Defiende tu Racha!',
          body: 'Aún no has registrado tus comidas de hoy. ¡No dejes romper tu racha de nutrición!',
          schedule: {
            on: { hour: 21, minute: 30 },
            allowWhileIdle: true,
          },
          sound: 'default',
        },
      ],
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
          title: `🔔 Recordatorio de Pago: ${sub.name}`,
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

      sendLocalNotification(`🔔 Recordatorio de Pago: ${sub.name}`, msg, sub.billingDay * 100);
    }
  });

  // Also trigger OS-level scheduling so future dates are set in iOS system background
  scheduleAllSubscriptionReminders(subscriptions, effectiveCurrency);
}
