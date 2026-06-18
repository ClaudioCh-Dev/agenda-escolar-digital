export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const MONTHS_SHORT = MONTHS_ES.map(m => m.slice(0, 3));

export const MONTHS_ES_LOWER = MONTHS_ES.map(m => m.toLowerCase());
export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DAYS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

export function formatDateLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${d.getDate()} de ${MONTHS_ES_LOWER[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatFullDate(dateStr: string, isToday: boolean): string {
  const d = parseDate(dateStr);
  const dayName = DAYS_FULL[d.getDay()];
  const label = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d.getDate()} de ${MONTHS_ES_LOWER[d.getMonth()]}`;
  return isToday ? `Hoy · ${label}` : label;
}

/** Día y mes para modales; incluye "Hoy ·" cuando corresponde. */
export function formatModalDate(dateStr: string, today: string): string {
  const d = parseDate(dateStr);
  const dayMonth = `${d.getDate()} de ${MONTHS_ES_LOWER[d.getMonth()]}`;
  return dateStr === today ? `Hoy · ${dayMonth}` : dayMonth;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysFromToday(dateStr: string, today: string): number {
  const d = parseDate(dateStr);
  const t = parseDate(today);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function formatRelativeDay(dateStr: string, today: string): string {
  const diff = daysFromToday(dateStr, today);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `En ${diff} días`;
}
