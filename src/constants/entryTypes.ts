import type { EntryType } from '@/types';

export const entryTypeConfig: Record<
  EntryType,
  { label: string; icon: string; color: string; bg: string; darkBg: string }
> = {
  tarea: { label: 'Tarea', icon: 'BookOpen', color: '#4F46E5', bg: '#EEF2FF', darkBg: '#2D2B50' },
  comunicado: { label: 'Comunicado', icon: 'Megaphone', color: '#0EA5E9', bg: '#E0F2FE', darkBg: '#0C2E40' },
  material: { label: 'Material', icon: 'Package', color: '#F59E0B', bg: '#FEF3C7', darkBg: '#3D2E0A' },
  observacion: { label: 'Observación', icon: 'Eye', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
  recordatorio: { label: 'Recordatorio', icon: 'Bell', color: '#EC4899', bg: '#FCE7F3', darkBg: '#3D1030' },
  examen: { label: 'Examen', icon: 'FileText', color: '#EF4444', bg: '#FEE2E2', darkBg: '#3D1010' },
  evento: { label: 'Evento', icon: 'Star', color: '#10B981', bg: '#D1FAE5', darkBg: '#0A2E20' },
  nota_personal: { label: 'Nota personal', icon: 'User', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
  personalizado: { label: 'Personalizado', icon: 'User', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
};

export const REGISTRO_TYPE_OPTIONS: EntryType[] = [
  'tarea',
  'comunicado',
  'personalizado',
  'material',
  'observacion',
  'recordatorio',
];
