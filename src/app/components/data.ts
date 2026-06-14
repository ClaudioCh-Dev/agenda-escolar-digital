export type Role = 'auxiliar' | 'padre' | 'alumno';
export type EntryType = 'tarea' | 'comunicado' | 'material' | 'observacion' | 'recordatorio' | 'examen' | 'evento';
export type Screen =
  | 'login'
  | 'dashboard'
  | 'agenda'
  | 'calendario'
  | 'notificaciones'
  | 'nueva-anotacion'
  | 'chat'
  | 'perfil'
  | 'chat-thread';

export interface Attachment {
  name: string;
  size: string;
  fileType: 'pdf' | 'image' | 'doc';
}

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  description: string;
  date: string;
  time: string;
  isImportant: boolean;
  attachments: Attachment[];
  readBy: string[];
  author: string;
  section: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'festivo' | 'examen' | 'reunion' | 'actuacion' | 'evento' | 'tarea';
  color: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: EntryType;
  entryId?: string;
}

export interface Child {
  id: string;
  name: string;
  section: string;
  grade: string;
  initials: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  initials: string;
  section?: string;
  children?: Child[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantInitials: string;
  participantColor: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: Message[];
}

export const MOCK_USERS: User[] = [
  {
    id: 'aux-001',
    name: 'María García',
    email: 'auxiliar@colegio.edu',
    role: 'auxiliar',
    initials: 'MG',
    section: '3° A – Primaria',
  },
  {
    id: 'padre-001',
    name: 'Carlos Rodríguez',
    email: 'padre@colegio.edu',
    role: 'padre',
    initials: 'CR',
    children: [
      { id: 'stu-001', name: 'Lucas Rodríguez', section: '3° A – Primaria', grade: '3er Grado', initials: 'LR', color: '#4F46E5' },
    ],
  },
  {
    id: 'padre-002',
    name: 'Ana López',
    email: 'padre2@colegio.edu',
    role: 'padre',
    initials: 'AL',
    children: [
      { id: 'stu-002', name: 'Sofía López', section: '3° A – Primaria', grade: '3er Grado', initials: 'SL', color: '#8B5CF6' },
      { id: 'stu-003', name: 'Mateo López', section: '5° B – Primaria', grade: '5to Grado', initials: 'ML', color: '#10B981' },
    ],
  },
  {
    id: 'stu-001',
    name: 'Lucas Rodríguez',
    email: 'alumno@colegio.edu',
    role: 'alumno',
    initials: 'LR',
    section: '3° A – Primaria',
  },
];

export const TODAY = '2026-06-13';

export const MOCK_ENTRIES: Entry[] = [
  {
    id: 'e-001',
    type: 'tarea',
    title: 'Matemáticas – Página 45',
    description: 'Resolver los ejercicios 1 al 5. Recordar mostrar el procedimiento completo. Entregar mañana lunes.',
    date: '2026-06-13',
    time: '08:30',
    isImportant: true,
    attachments: [{ name: 'ejercicios_pag45.pdf', size: '1.2 MB', fileType: 'pdf' }],
    readBy: [],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-002',
    type: 'comunicado',
    title: 'Reunión de padres – Viernes 20 de junio',
    description: 'Se convoca a todos los padres a la reunión del tercer trimestre. Horario: 18:00 a 19:30 hs. Aula 12. Asistencia obligatoria.',
    date: '2026-06-13',
    time: '09:00',
    isImportant: true,
    attachments: [{ name: 'circular_reunion.pdf', size: '456 KB', fileType: 'pdf' }],
    readBy: ['padre-002'],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-003',
    type: 'material',
    title: 'Materiales para proyecto de Arte',
    description: 'Para el miércoles traer: cartulina de colores (A3), tijeras, pegamento en barra, marcadores. Proyecto sobre ecosistemas.',
    date: '2026-06-13',
    time: '10:15',
    isImportant: false,
    attachments: [],
    readBy: ['padre-001', 'padre-002'],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-004',
    type: 'examen',
    title: 'Examen de Ciencias Naturales – Lunes 17/06',
    description: 'El examen abarca las unidades 3 y 4: El ecosistema y la cadena alimentaria. Repasar el cuaderno de clase y el libro páginas 78-95.',
    date: '2026-06-13',
    time: '11:00',
    isImportant: true,
    attachments: [{ name: 'guia_repaso_ciencias.pdf', size: '2.1 MB', fileType: 'pdf' }],
    readBy: [],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-005',
    type: 'recordatorio',
    title: 'Celebración Día del Padre – Miércoles 18/06',
    description: 'Invitamos a todos los papás al acto especial del Día del Padre. Horario: 10:00 hs. Traer regalo sorpresa para el acto.',
    date: '2026-06-13',
    time: '12:00',
    isImportant: false,
    attachments: [{ name: 'foto_acto_anterior.jpg', size: '3.4 MB', fileType: 'image' }],
    readBy: ['padre-001'],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-006',
    type: 'observacion',
    title: 'Observación: Excelente participación',
    description: 'El grupo demostró muy buena participación durante la clase de Ciencias. Se destacaron varios alumnos en la exposición oral.',
    date: '2026-06-13',
    time: '13:30',
    isImportant: false,
    attachments: [{ name: 'foto_clase.jpg', size: '2.8 MB', fileType: 'image' }],
    readBy: [],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  // Yesterday
  {
    id: 'e-007',
    type: 'tarea',
    title: 'Lengua – Comprensión lectora',
    description: 'Leer el cuento "El principito" capítulos 1-5 y responder las preguntas del cuadernillo.',
    date: '2026-06-12',
    time: '09:00',
    isImportant: false,
    attachments: [],
    readBy: ['padre-001', 'padre-002'],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
  {
    id: 'e-008',
    type: 'evento',
    title: 'Visita al Museo de Ciencias Naturales',
    description: 'La salida educativa fue un éxito. Los alumnos disfrutaron los dinosaurios y el planetario.',
    date: '2026-06-12',
    time: '08:00',
    isImportant: false,
    attachments: [{ name: 'fotos_museo.jpg', size: '5.2 MB', fileType: 'image' }],
    readBy: ['padre-001', 'padre-002'],
    author: 'Sra. García',
    section: '3° A – Primaria',
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ce-001', title: 'Examen Ciencias', date: '2026-06-17', type: 'examen', color: '#EF4444' },
  { id: 'ce-002', title: 'Día del Padre', date: '2026-06-18', type: 'actuacion', color: '#F59E0B' },
  { id: 'ce-003', title: 'Reunión de Padres', date: '2026-06-20', type: 'reunion', color: '#4F46E5' },
  { id: 'ce-004', title: 'Día Festivo', date: '2026-06-16', type: 'festivo', color: '#10B981' },
  { id: 'ce-005', title: 'Entrega Boletines', date: '2026-06-30', type: 'evento', color: '#8B5CF6' },
  { id: 'ce-006', title: 'Día del Deporte', date: '2026-06-25', type: 'actuacion', color: '#F59E0B' },
  { id: 'ce-007', title: 'Examen Matemáticas', date: '2026-06-24', type: 'examen', color: '#EF4444' },
  { id: 'ce-008', title: 'Feria de Ciencias', date: '2026-07-05', type: 'evento', color: '#8B5CF6' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-001',
    title: '📚 Nueva tarea registrada',
    body: 'Matemáticas – Página 45. Entregar mañana.',
    timestamp: '2026-06-13T08:35:00',
    isRead: false,
    type: 'tarea',
    entryId: 'e-001',
  },
  {
    id: 'n-002',
    title: '📢 Comunicado importante',
    body: 'Reunión de padres – Viernes 20 de junio, 18:00 hs.',
    timestamp: '2026-06-13T09:05:00',
    isRead: false,
    type: 'comunicado',
    entryId: 'e-002',
  },
  {
    id: 'n-003',
    title: '🧪 Examen próximo',
    body: 'Examen de Ciencias Naturales el lunes 17 de junio.',
    timestamp: '2026-06-13T11:05:00',
    isRead: true,
    type: 'examen',
    entryId: 'e-004',
  },
  {
    id: 'n-004',
    title: '🎨 Materiales solicitados',
    body: 'Traer cartulina, tijeras y pegamento para el miércoles.',
    timestamp: '2026-06-13T10:20:00',
    isRead: true,
    type: 'material',
    entryId: 'e-003',
  },
  {
    id: 'n-005',
    title: '📚 Tarea de Lengua',
    body: 'Leer El Principito capítulos 1-5.',
    timestamp: '2026-06-12T09:05:00',
    isRead: true,
    type: 'tarea',
    entryId: 'e-007',
  },
];

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

export const entryTypeConfig: Record<EntryType, { label: string; icon: string; color: string; bg: string; darkBg: string }> = {
  tarea: { label: 'Tarea', icon: 'BookOpen', color: '#4F46E5', bg: '#EEF2FF', darkBg: '#2D2B50' },
  comunicado: { label: 'Comunicado', icon: 'Megaphone', color: '#0EA5E9', bg: '#E0F2FE', darkBg: '#0C2E40' },
  material: { label: 'Material', icon: 'Package', color: '#F59E0B', bg: '#FEF3C7', darkBg: '#3D2E0A' },
  observacion: { label: 'Observación', icon: 'Eye', color: '#8B5CF6', bg: '#EDE9FE', darkBg: '#2D2050' },
  recordatorio: { label: 'Recordatorio', icon: 'Bell', color: '#EC4899', bg: '#FCE7F3', darkBg: '#3D1030' },
  examen: { label: 'Examen', icon: 'FileText', color: '#EF4444', bg: '#FEE2E2', darkBg: '#3D1010' },
  evento: { label: 'Evento', icon: 'Star', color: '#10B981', bg: '#D1FAE5', darkBg: '#0A2E20' },
};
