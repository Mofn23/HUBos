import { SubjectItem, ClassSlot } from '@/stores/useScheduleStore';
import { sendLocalNotification } from './notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NextClassStatus {
  type: 'live' | 'upcoming' | 'none';
  subject?: SubjectItem;
  slot?: ClassSlot;
  timeLabel?: string;
  minutesRemaining?: number; // for live class or countdown
  progressPercent?: number; // 0 to 100 for live class
  relativeDayLabel?: string; // "Hoy", "Mañana", "Jueves", etc.
}

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Normalizes JS Date getDay() (0: Sun, 1: Mon, ..., 6: Sat)
 * into ISO Day of Week: 1: Lunes, ..., 7: Domingo
 */
export function getIsoDayOfWeek(date: Date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Calculates current time in minutes from 00:00 (e.g. 07:30 = 450)
 */
export function getCurrentTimeMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Analyzes all subjects and slots to find if there is a class LIVE right now,
 * or the NEXT upcoming class.
 */
export function findCurrentOrNextClass(subjects: SubjectItem[]): NextClassStatus {
  if (!subjects || subjects.length === 0) {
    return { type: 'none' };
  }

  const now = new Date();
  const currentDay = getIsoDayOfWeek(now);
  const currentMins = getCurrentTimeMinutes(now);

  // Flatten all slots with their parent subject
  const allSlots: { subject: SubjectItem; slot: ClassSlot }[] = [];
  subjects.forEach((subj) => {
    subj.slots.forEach((slot) => {
      allSlots.push({ subject: subj, slot });
    });
  });

  if (allSlots.length === 0) {
    return { type: 'none' };
  }

  // 1. Check if there is an active LIVE class right now
  for (const item of allSlots) {
    if (item.slot.dayOfWeek === currentDay) {
      const start = item.slot.startMinutes;
      const end = item.slot.startMinutes + item.slot.durationMinutes;

      if (currentMins >= start && currentMins < end) {
        const remaining = end - currentMins;
        const elapsed = currentMins - start;
        const progress = Math.min(100, Math.max(0, Math.round((elapsed / item.slot.durationMinutes) * 100)));

        return {
          type: 'live',
          subject: item.subject,
          slot: item.slot,
          timeLabel: `${item.slot.startHour} - ${item.slot.endHour}`,
          minutesRemaining: remaining,
          progressPercent: progress,
          relativeDayLabel: 'En Curso',
        };
      }
    }
  }

  // 2. Check for upcoming classes TODAY
  const todayUpcoming = allSlots
    .filter((item) => item.slot.dayOfWeek === currentDay && item.slot.startMinutes > currentMins)
    .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes);

  if (todayUpcoming.length > 0) {
    const next = todayUpcoming[0];
    const minsUntil = next.slot.startMinutes - currentMins;

    return {
      type: 'upcoming',
      subject: next.subject,
      slot: next.slot,
      timeLabel: `${next.slot.startHour} - ${next.slot.endHour}`,
      minutesRemaining: minsUntil,
      relativeDayLabel: 'Hoy',
    };
  }

  // 3. Search in subsequent days (tomorrow, day after, etc.)
  for (let offset = 1; offset <= 7; offset++) {
    const targetDay = ((currentDay - 1 + offset) % 7) + 1;
    const daySlots = allSlots
      .filter((item) => item.slot.dayOfWeek === targetDay)
      .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes);

    if (daySlots.length > 0) {
      const next = daySlots[0];
      const relativeLabel = offset === 1 ? 'Mañana' : DAY_NAMES[targetDay];

      return {
        type: 'upcoming',
        subject: next.subject,
        slot: next.slot,
        timeLabel: `${next.slot.startHour} - ${next.slot.endHour}`,
        relativeDayLabel: relativeLabel,
      };
    }
  }

  return { type: 'none' };
}

/**
 * Schedules pre-class notifications (default 30 mins before) via Capacitor & Web
 */
export async function scheduleClassNotifications(
  subjects: SubjectItem[],
  notifyBeforeMinutes: number = 30
) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    // Collect upcoming slots for the week
    const now = new Date();
    const currentDay = getIsoDayOfWeek(now);
    const currentMins = getCurrentTimeMinutes(now);

    const notificationsToSchedule: any[] = [];

    subjects.forEach((subj) => {
      subj.slots.forEach((slot, slotIdx) => {
        // Calculate days until this slot
        let dayDiff = slot.dayOfWeek - currentDay;
        let notifyMins = slot.startMinutes - notifyBeforeMinutes;

        if (dayDiff < 0 || (dayDiff === 0 && notifyMins <= currentMins)) {
          dayDiff += 7; // schedule for next week
        }

        const scheduledDate = new Date();
        scheduledDate.setDate(now.getDate() + dayDiff);
        const notifyHour = Math.floor(notifyMins / 60);
        const notifyMinute = notifyMins % 60;
        scheduledDate.setHours(notifyHour, notifyMinute, 0, 0);

        const id = Math.abs(
          (subj.name.charCodeAt(0) * 1000 + slot.dayOfWeek * 100 + slotIdx) % 100000
        );

        notificationsToSchedule.push({
          id,
          title: `🔔 Próxima Clase: ${subj.name}`,
          body: `Comienza en ${notifyBeforeMinutes} min (${slot.startHour})${
            slot.room ? ` en ${slot.room}` : ''
          }. ¡Prepárate!`,
          schedule: { at: scheduledDate },
          sound: 'default',
        });
      });
    });

    if (notificationsToSchedule.length > 0) {
      // Limit to next 20 notifications to respect OS limits
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule.slice(0, 20),
      });
    }
  } catch (err) {
    console.warn('Error scheduling class notifications:', err);
  }
}
