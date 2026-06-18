import type { Conversation } from '@/types';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    participantId: 'padre-001',
    participantName: 'Carlos Rodríguez',
    participantRole: 'Padre de Lucas',
    participantInitials: 'CR',
    participantColor: '#4F46E5',
    lastMessage: 'Gracias por la información sobre el examen.',
    lastTimestamp: '2026-06-13T10:30:00',
    unreadCount: 0,
    messages: [
      { id: 'm-001', senderId: 'padre-001', senderName: 'Carlos', text: 'Buenas tardes, quería consultar si Lucas puede entregar la tarea el martes.', timestamp: '2026-06-12T15:20:00', isRead: true },
      { id: 'm-002', senderId: 'aux-001', senderName: 'Sra. García', text: 'Hola Carlos, sí puede entregarla el martes sin problema. ¡Que tenga buen fin de semana!', timestamp: '2026-06-12T16:05:00', isRead: true },
      { id: 'm-003', senderId: 'padre-001', senderName: 'Carlos', text: 'Muchas gracias, Sra. García. Igualmente.', timestamp: '2026-06-12T16:10:00', isRead: true },
      { id: 'm-004', senderId: 'padre-001', senderName: 'Carlos', text: 'Gracias por la información sobre el examen.', timestamp: '2026-06-13T10:30:00', isRead: true },
    ],
  },
  {
    id: 'conv-002',
    participantId: 'padre-002',
    participantName: 'Ana López',
    participantRole: 'Madre de Sofía',
    participantInitials: 'AL',
    participantColor: '#8B5CF6',
    lastMessage: '¿Puede Sofía ir al baño durante el examen?',
    lastTimestamp: '2026-06-13T09:15:00',
    unreadCount: 2,
    messages: [
      { id: 'm-005', senderId: 'padre-002', senderName: 'Ana', text: 'Buenos días, Sra. García!', timestamp: '2026-06-13T09:00:00', isRead: true },
      { id: 'm-006', senderId: 'padre-002', senderName: 'Ana', text: '¿Puede Sofía ir al baño durante el examen?', timestamp: '2026-06-13T09:15:00', isRead: false },
    ],
  },
];
