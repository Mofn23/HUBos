import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { SubscriptionItem } from '@/stores/useSubsStore';

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

    // Flush cache of previously scheduled notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
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

    if (diff <= daysAhead && diff >= 0) {
      const msg =
        diff === 0
          ? `Tu suscripción a ${sub.name} vence HOY (${sub.amount} ${effectiveCurrency}).`
          : `Tu suscripción a ${sub.name} renovará en ${diff} día(s) (${sub.amount} ${effectiveCurrency}).`;

      sendLocalNotification(`🔔 Recordatorio de Pago: ${sub.name}`, msg, sub.billingDay * 100);
    }
  });
}
