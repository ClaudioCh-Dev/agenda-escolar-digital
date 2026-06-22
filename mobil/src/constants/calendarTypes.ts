import type { SchoolCalendarEventType } from '@/types';

export const SCHOOL_CALENDAR_EVENT_TYPES: SchoolCalendarEventType[] = [
  'festivo',
  'examen',
  'reunion',
  'actuacion',
  'evento',
];

export const calendarEventTypeLabels: Record<SchoolCalendarEventType, string> = {
  festivo: 'Día festivo',
  examen: 'Examen',
  reunion: 'Reunión',
  actuacion: 'Actuación',
  evento: 'Evento',
};

const CALENDAR_EVENT_DOT_COLORS = {
  festivo: '#0284C7',
  examen: '#FF5C72',
  reunion: '#C026D3',
  actuacion: '#7C3AED',
  evento: '#FF8B5C',
  tarea: '#0D9488',
} as const;

export function getCalendarEventColor(type: keyof typeof CALENDAR_EVENT_DOT_COLORS): string {
  return CALENDAR_EVENT_DOT_COLORS[type];
}

export function getCalendarTypeColors(type: SchoolCalendarEventType, isDark: boolean) {
  const map = {
    festivo: { color: isDark ? '#38BDF8' : '#0284C7', bg: isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE' },
    examen: { color: isDark ? '#FF7A8E' : '#FF5C72', bg: isDark ? 'rgba(255,92,114,0.18)' : '#FFE8EC' },
    reunion: { color: isDark ? '#E879F9' : '#C026D3', bg: isDark ? 'rgba(232,121,249,0.18)' : '#FAE8FF' },
    actuacion: { color: isDark ? '#A78BFA' : '#7C3AED', bg: isDark ? 'rgba(167,139,250,0.18)' : '#EDE9FE' },
    evento: { color: isDark ? '#FF9D6C' : '#FF8B5C', bg: isDark ? 'rgba(255,139,92,0.15)' : '#FFF0E8' },
  } as const;
  return map[type];
}
