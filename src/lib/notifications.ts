import { LocalNotifications } from '@capacitor/local-notifications';
import { SubscriptionItem } from '@/stores/useSubsStore';
import { formatCurrency } from './utils';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') return true;
  } catch (err) {
    console.warn('[HUBos] Capacitor LocalNotifications request error:', err);
  }

  if ('Notification' in window) {
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function sendLocalNotification(
  id: number,
  title: string,
  body: string,
  scheduleDate?: Date
) {
  if (typeof window === 'undefined') return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: scheduleDate ? { at: scheduleDate } : undefined,
          sound: 'beep.wav',
          actionTypeId: '',
          extra: null,
        },
      ],
    });
    return;
  } catch (e) {
    console.warn('[HUBos] LocalNotification fallback to Web Notification:', e);
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
      });
    } catch (e) {
      console.warn('[HUBos] Web Notification error:', e);
    }
  }
}

export async function checkAndNotifyUpcomingSubscriptions(
  subscriptions: SubscriptionItem[],
  currency: string = 'COP'
) {
  if (typeof window === 'undefined') return;

  const today = new Date();
  const currentDay = today.getDate(); // 1-31
  const todayStr = today.toISOString().split('T')[0];

  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;

    const daysDiff = sub.billingDay - currentDay;

    // 1. Same day renewal
    if (daysDiff === 0 && sub.lastPaidDate !== todayStr) {
      const notifId = Math.abs(hashString(`same-${sub.id}-${todayStr}`));
      await sendLocalNotification(
        notifId,
        `🔔 ¡Hoy Vence Tu Suscripción!: ${sub.name}`,
        `Hoy corresponde el cobro de ${sub.name} por ${formatCurrency(sub.amount, currency)}. ¡Regístralo en HUBos!`
      );
    }
    // 2. 1 day before
    else if (daysDiff === 1) {
      const notifId = Math.abs(hashString(`1day-${sub.id}-${todayStr}`));
      await sendLocalNotification(
        notifId,
        `⏳ Próximo Cobro Mañana: ${sub.name}`,
        `Mañana se renovará ${sub.name} (${formatCurrency(sub.amount, currency)}).`
      );
    }
    // 3. 3 days before
    else if (daysDiff === 3) {
      const notifId = Math.abs(hashString(`3days-${sub.id}-${todayStr}`));
      await sendLocalNotification(
        notifId,
        `📅 Próximo Cobro en 3 Días: ${sub.name}`,
        `En 3 días vencerá la suscripción a ${sub.name} (${formatCurrency(sub.amount, currency)}).`
      );
    }
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
