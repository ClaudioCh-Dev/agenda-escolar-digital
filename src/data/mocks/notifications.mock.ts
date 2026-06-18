import type { AppNotification } from '@/types';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n-001', title: '📚 Nueva tarea registrada', body: 'Matemáticas – Página 45. Entregar mañana.', timestamp: '2026-06-13T08:35:00', isRead: false, type: 'tarea', entryId: 'e-001' },
  { id: 'n-002', title: '📢 Comunicado importante', body: 'Reunión de padres – Viernes 20 de junio, 18:00 hs.', timestamp: '2026-06-13T09:05:00', isRead: false, type: 'comunicado', entryId: 'e-002' },
  { id: 'n-003', title: '🧪 Examen próximo', body: 'Examen de Ciencias Naturales el lunes 17 de junio.', timestamp: '2026-06-13T11:05:00', isRead: true, type: 'examen', entryId: 'e-004' },
  { id: 'n-004', title: '🎨 Materiales solicitados', body: 'Traer cartulina, tijeras y pegamento para el miércoles.', timestamp: '2026-06-13T10:20:00', isRead: true, type: 'material', entryId: 'e-003' },
  { id: 'n-005', title: '📚 Tarea de Lengua', body: 'Leer El Principito capítulos 1-5.', timestamp: '2026-06-12T09:05:00', isRead: true, type: 'tarea', entryId: 'e-007' },
];
