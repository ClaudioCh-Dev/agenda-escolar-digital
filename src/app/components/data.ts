export type Role = 'auxiliar' | 'padre' | 'alumno';
export type EntryType = 'tarea' | 'comunicado' | 'material' | 'observacion' | 'recordatorio' | 'examen' | 'evento' | 'nota_personal' | 'personalizado';
export type Screen =
  | 'login'
  | 'dashboard'
  | 'agenda'
  | 'calendario'
  | 'notificaciones'
  | 'nueva-anotacion'
  | 'chat'
  | 'perfil'
  | 'cambiar-contrasena'
  | 'en-construccion'
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
  studentId?: string;
}

export type SchoolCalendarEventType = 'festivo' | 'examen' | 'reunion' | 'actuacion' | 'evento';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: SchoolCalendarEventType | 'tarea';
  color: string;
}

export const SCHOOL_CALENDAR_EVENT_TYPES: SchoolCalendarEventType[] = [
  'festivo',
  'examen',
  'reunion',
  'actuacion',
  'evento',
];

const CALENDAR_EVENT_DOT_COLORS: Record<CalendarEvent['type'], string> = {
  festivo: '#0284C7',
  examen: '#FF5C72',
  reunion: '#C026D3',
  actuacion: '#7C3AED',
  evento: '#FF8B5C',
  tarea: '#0D9488',
};

export function getCalendarEventColor(type: CalendarEvent['type']): string {
  return CALENDAR_EVENT_DOT_COLORS[type];
}

export const calendarEventTypeLabels: Record<SchoolCalendarEventType, string> = {
  festivo: 'Día festivo',
  examen: 'Examen',
  reunion: 'Reunión',
  actuacion: 'Actuación',
  evento: 'Evento',
};

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
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  initials: string;
  section?: string;
  sections?: string[];
  children?: Child[];
}

export interface VisibilityContext {
  selectedChildId?: string;
  selectedSection?: string;
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

/** Avatares locales en public/mock-avatars/ (versionados en git) */
export const MOCK_AVATARS = {
  mariaGarcia: '/mock-avatars/maria-garcia.jpg',
  carlosRodriguez: '/mock-avatars/carlos-rodriguez.jpg',
  anaLopez: '/mock-avatars/ana-lopez.jpg',
  lucas: '/mock-avatars/lucas.jpg',
  sofia: '/mock-avatars/sofia.jpg',
  mateo: '/mock-avatars/mateo.png',
} as const;

export const MOCK_USERS: User[] = [
  {
    id: 'aux-001',
    name: 'María García',
    email: 'auxiliar@colegio.edu',
    role: 'auxiliar',
    initials: 'MG',
    avatar: MOCK_AVATARS.mariaGarcia,
    sections: ['5° A – Primaria', '5° B – Primaria', '5° C – Primaria'],
  },
  {
    id: 'padre-001',
    name: 'Carlos Rodríguez',
    email: 'padre@colegio.edu',
    role: 'padre',
    initials: 'CR',
    avatar: MOCK_AVATARS.carlosRodriguez,
    children: [
      { id: 'stu-001', name: 'Lucas Rodríguez', section: '3° A – Primaria', grade: '3er Grado', initials: 'LR', color: '#4F46E5', avatar: MOCK_AVATARS.lucas },
    ],
  },
  {
    id: 'padre-002',
    name: 'Ana López',
    email: 'padre2@colegio.edu',
    role: 'padre',
    initials: 'AL',
    avatar: MOCK_AVATARS.anaLopez,
    children: [
      { id: 'stu-002', name: 'Sofía López', section: '3° A – Primaria', grade: '3er Grado', initials: 'SL', color: '#8B5CF6', avatar: MOCK_AVATARS.sofia },
      { id: 'stu-003', name: 'Mateo López', section: '5° B – Primaria', grade: '5to Grado', initials: 'ML', color: '#10B981', avatar: MOCK_AVATARS.mateo },
    ],
  },
  {
    id: 'stu-001',
    name: 'Lucas Rodríguez',
    email: 'alumno@colegio.edu',
    role: 'alumno',
    initials: 'LR',
    avatar: MOCK_AVATARS.lucas,
    section: '3° A – Primaria',
  },
];

export const MOCK_STUDENTS: Child[] = [
  { id: 'stu-004', name: 'Valentina Ruiz', section: '5° A – Primaria', grade: '5to Grado', initials: 'VR', color: '#F59E0B' },
  { id: 'stu-005', name: 'Diego Pérez', section: '5° A – Primaria', grade: '5to Grado', initials: 'DP', color: '#EF4444' },
  { id: 'stu-003', name: 'Mateo López', section: '5° B – Primaria', grade: '5to Grado', initials: 'ML', color: '#10B981', avatar: MOCK_AVATARS.mateo },
  { id: 'stu-006', name: 'Camila Torres', section: '5° B – Primaria', grade: '5to Grado', initials: 'CT', color: '#0EA5E9' },
  { id: 'stu-007', name: 'Juan Martínez', section: '5° C – Primaria', grade: '5to Grado', initials: 'JM', color: '#8B5CF6' },
  { id: 'stu-008', name: 'Lucía Fernández', section: '5° C – Primaria', grade: '5to Grado', initials: 'LF', color: '#EC4899' },
];

export function getStudentName(id: string): string {
  const fromMock = MOCK_STUDENTS.find(s => s.id === id);
  if (fromMock) return fromMock.name;
  for (const u of MOCK_USERS) {
    const child = u.children?.find(c => c.id === id);
    if (child) return child.name;
    if (u.id === id) return u.name;
  }
  return 'Alumno';
}

export function getStudentsBySection(section: string): Child[] {
  return MOCK_STUDENTS.filter(s => s.section === section);
}

export function getParentsForSection(section: string): User[] {
  return MOCK_USERS.filter(
    u => u.role === 'padre' && u.children?.some(c => c.section === section),
  );
}

export function getParentsForStudent(studentId: string): User[] {
  return MOCK_USERS.filter(
    u => u.role === 'padre' && u.children?.some(c => c.id === studentId),
  );
}

export function isEntryVisible(entry: Entry, user: User, context?: VisibilityContext): boolean {
  if (user.role === 'auxiliar') {
    const sections = user.sections ?? [];
    if (!sections.includes(entry.section)) return false;
    if (context?.selectedSection) return entry.section === context.selectedSection;
    return true;
  }

  if (user.role === 'alumno') {
    if (entry.studentId) return entry.studentId === user.id;
    return entry.section === user.section;
  }

  if (user.role === 'padre') {
    const childId = context?.selectedChildId ?? user.children?.[0]?.id;
    const child = user.children?.find(c => c.id === childId) ?? user.children?.[0];
    if (!child) return false;
    if (entry.studentId) return entry.studentId === child.id;
    return entry.section === child.section;
  }

  return false;
}

export function shortSectionLabel(section: string): string {
  return section.split(' – ')[0];
}

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
  {
    id: 'e-009',
    type: 'tarea',
    title: 'Historia – Línea de tiempo',
    description: 'Completar la línea de tiempo de la Revolución de Mayo en el cuaderno.',
    date: '2026-06-13',
    time: '08:00',
    isImportant: false,
    attachments: [],
    readBy: [],
    author: 'Sra. García',
    section: '5° A – Primaria',
  },
  {
    id: 'e-010',
    type: 'comunicado',
    title: 'Salida al teatro – Solo Valentina',
    description: 'Valentina debe presentar la autorización firmada para la salida al teatro del viernes.',
    date: '2026-06-13',
    time: '09:30',
    isImportant: true,
    attachments: [],
    readBy: [],
    author: 'Sra. García',
    section: '5° A – Primaria',
    studentId: 'stu-004',
  },
  {
    id: 'e-011',
    type: 'comunicado',
    title: 'Reunión 5° B – Proyecto integrador',
    description: 'Padres de 5° B: reunión el martes 17/06 a las 17:00 hs para el proyecto de Ciencias.',
    date: '2026-06-13',
    time: '10:00',
    isImportant: true,
    attachments: [],
    readBy: [],
    author: 'Sra. García',
    section: '5° B – Primaria',
  },
  {
    id: 'e-012',
    type: 'nota_personal',
    title: 'Recordatorio: traer gorra',
    description: 'Lucas, no olvides la gorra para la actividad al aire libre del lunes.',
    date: '2026-06-13',
    time: '07:45',
    isImportant: false,
    attachments: [],
    readBy: [],
    author: 'Carlos Rodríguez',
    section: '3° A – Primaria',
    studentId: 'stu-001',
  },
];

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
  observacion: { label: 'Observación', icon: 'Eye', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
  recordatorio: { label: 'Recordatorio', icon: 'Bell', color: '#EC4899', bg: '#FCE7F3', darkBg: '#3D1030' },
  examen: { label: 'Examen', icon: 'FileText', color: '#EF4444', bg: '#FEE2E2', darkBg: '#3D1010' },
  evento: { label: 'Evento', icon: 'Star', color: '#10B981', bg: '#D1FAE5', darkBg: '#0A2E20' },
  nota_personal: { label: 'Nota personal', icon: 'User', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
  personalizado: { label: 'Personalizado', icon: 'User', color: '#0D9488', bg: '#CCFBF1', darkBg: '#0A2E28' },
};
