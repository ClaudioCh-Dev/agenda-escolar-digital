import type { CalendarEvent } from '@/types';

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ce-001', title: 'Examen Ciencias', date: '2026-06-17', type: 'examen', color: '#FF5C72' },
  { id: 'ce-002', title: 'Día del Padre', date: '2026-06-18', type: 'actuacion', color: '#7C3AED' },
  { id: 'ce-003', title: 'Reunión de Padres', date: '2026-06-20', type: 'reunion', color: '#C026D3' },
  { id: 'ce-004', title: 'Día Festivo', date: '2026-06-16', type: 'festivo', color: '#0284C7' },
  { id: 'ce-005', title: 'Entrega Boletines', date: '2026-06-30', type: 'evento', color: '#FF8B5C' },
  { id: 'ce-009', title: 'Acto de Fin de Año', date: '2026-06-30', type: 'actuacion', color: '#7C3AED' },
  { id: 'ce-010', title: 'Feriado Escolar', date: '2026-06-30', type: 'festivo', color: '#0284C7' },
  { id: 'ce-011', title: 'Examen Final', date: '2026-06-30', type: 'examen', color: '#FF5C72' },
  { id: 'ce-012', title: 'Reunión de Cierre', date: '2026-06-30', type: 'reunion', color: '#C026D3' },
  { id: 'ce-006', title: 'Día del Deporte', date: '2026-06-25', type: 'actuacion', color: '#7C3AED' },
  { id: 'ce-007', title: 'Examen Matemáticas', date: '2026-06-24', type: 'examen', color: '#FF5C72' },
  { id: 'ce-008', title: 'Feria de Ciencias', date: '2026-07-05', type: 'evento', color: '#FF8B5C' },
];
