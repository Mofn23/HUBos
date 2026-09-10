import { SubjectItem } from '@/stores/useScheduleStore';

/**
 * Generates an iCalendar (.ics) string from subjects and their slots.
 * Formats events with RRULE for weekly repetition, alarms 30 mins before,
 * location and notes.
 */
export function generateIcsCalendar(subjects: SubjectItem[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HUBos//Horarios & Rutinas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Horario HUBos',
  ];

  const DAY_BYDAY = ['', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  subjects.forEach((subject) => {
    subject.slots.forEach((slot, idx) => {
      // Find the next date corresponding to slot.dayOfWeek
      const targetDay = slot.dayOfWeek; // 1: Mon .. 7: Sun
      const currentDay = now.getDay() === 0 ? 7 : now.getDay();
      let daysAhead = targetDay - currentDay;
      if (daysAhead < 0) daysAhead += 7;

      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + daysAhead);

      const [startH, startM] = slot.startHour.split(':').map(Number);
      const [endH, endM] = slot.endHour.split(':').map(Number);

      const startDateStr = formatDateForIcs(eventDate, startH, startM);
      const endDateStr = formatDateForIcs(eventDate, endH, endM);
      const byDay = DAY_BYDAY[slot.dayOfWeek];

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:hubos-${subject.id}-${slot.id}-${idx}@hubos.app`);
      lines.push(`DTSTAMP:${timestamp}`);
      lines.push(`DTSTART:${startDateStr}`);
      lines.push(`DTEND:${endDateStr}`);
      lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
      lines.push(`SUMMARY:${subject.emoji ? `${subject.emoji} ` : ''}${subject.name}`);
      
      const descParts = [];
      if (subject.instructor) descParts.push(`Profesor: ${subject.instructor}`);
      if (subject.shortInfo) descParts.push(`Info: ${subject.shortInfo}`);
      if (subject.notes) descParts.push(`Notas: ${subject.notes}`);
      
      if (descParts.length > 0) {
        lines.push(`DESCRIPTION:${escapeIcs(descParts.join('\\n'))}`);
      }

      if (slot.room || subject.shortInfo) {
        lines.push(`LOCATION:${escapeIcs(slot.room || subject.shortInfo || '')}`);
      }

      // Alarm: 30 minutes before
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT30M');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Clase de ${subject.name} en 30 minutos`);
      lines.push('END:VALARM');

      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatDateForIcs(d: Date, hours: number, minutes: number): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${year}${month}${day}T${h}${m}00`;
}

function escapeIcs(str: string): string {
  return str.replace(/[,;\\]/g, (match) => `\\${match}`);
}

/**
 * Initiates browser download of the generated .ics file
 */
export function downloadIcsFile(subjects: SubjectItem[], filename = 'Horario_HUBos.ics') {
  const content = generateIcsCalendar(subjects);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
