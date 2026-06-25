export const USER_PROFILE_EXAMPLE = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'María Auxiliar',
  code: 't10000001',
  userType: 'staff',
  role: 'auxiliar',
  roles: ['auxiliar'],
  initials: 'MA',
  sections: ['3° A – Primaria'],
  sedes: ['Sede Los Olivos'],
};

export const LOGIN_RESPONSE_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  expiresIn: 900,
  user: USER_PROFILE_EXAMPLE,
};

export const REFRESH_RESPONSE_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'f0e9d8c7-b6a5-4321-fedc-ba0987654321',
  expiresIn: 900,
};

export const ENTRY_RESPONSE_EXAMPLE = {
  id: '11111111-1111-1111-1111-111111111101',
  type: 'comunicado',
  title: 'Reunión de padres',
  description: 'Se convoca a reunión el viernes a las 18:00.',
  date: '2026-06-13',
  time: '08:00',
  isImportant: true,
  attachments: [],
  readBy: [],
  author: 'María Auxiliar',
  authorRole: 'auxiliar',
  section: '3° A – Primaria',
  requiresAck: true,
  parentsOnly: false,
};

export const CALENDAR_EVENT_EXAMPLE = {
  id: '22222222-2222-2222-2222-222222222201',
  title: 'Festivo — Día del Padre',
  description: 'No hay clases',
  date: '2026-06-15',
  type: 'festivo',
  color: '#8B5CF6',
  isImportant: false,
  attachments: [],
};

export const NOTIFICATION_EXAMPLE = {
  id: '33333333-3333-3333-3333-333333333301',
  title: 'Nuevo comunicado',
  body: 'Reunión de padres — 3° A',
  timestamp: '2026-06-13T08:00:00.000Z',
  isRead: false,
  type: 'comunicado',
  entryId: '11111111-1111-1111-1111-111111111101',
};

export const CHILD_EXAMPLE = {
  id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  name: 'Lucas Alumno',
  section: '3° A – Primaria',
  grade: '3er Grado',
  initials: 'LA',
  color: '#0D9488',
};

export const SECTION_EXAMPLE = {
  id: '22222222-2222-2222-2222-222222222222',
  name: '3° A – Primaria',
  grade: '3er Grado',
};

export const USER_ADMIN_EXAMPLE = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'María Auxiliar',
  code: 't10000001',
  userType: 'staff',
  role: 'auxiliar',
  roles: ['auxiliar'],
  isActive: true,
  initials: 'MA',
};

export const ATTACHMENT_EXAMPLE = {
  id: '44444444-4444-4444-4444-444444444401',
  name: 'comunicado.pdf',
  size: '245 KB',
  fileType: 'pdf',
  url: 'https://res.cloudinary.com/demo/raw/upload/v1/comunicado.pdf',
  publicId: 'agenda/comunicado',
};

export const UPLOAD_ATTACHMENT_EXAMPLE = {
  name: 'comunicado.pdf',
  storageUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/comunicado.pdf',
  sizeLabel: '245 KB',
  fileType: 'pdf',
  publicId: 'agenda/staging/comunicado',
};

export const CONVERSATION_EXAMPLE = {
  id: '55555555-5555-5555-5555-555555555501',
  participantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  participantName: 'Carlos Padre',
  participantRole: 'padre',
  participantInitials: 'CP',
  participantColor: '#3B82F6',
  lastMessage: 'Gracias por el aviso',
  lastTimestamp: '2026-06-13T10:30:00.000Z',
  unreadCount: 0,
  messages: [],
};

export const MESSAGE_EXAMPLE = {
  id: '66666666-6666-6666-6666-666666666601',
  senderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  senderName: 'Carlos Padre',
  text: 'Gracias por el aviso',
  timestamp: '2026-06-13T10:30:00.000Z',
  isRead: true,
};

export const PARENT_EXAMPLE = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  name: 'Carlos Padre',
  code: 'p10000001',
  role: 'padre',
  initials: 'CP',
  sections: ['3° A – Primaria'],
  children: [
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      name: 'Lucas Alumno',
      section: '3° A – Primaria',
      grade: '3er Grado',
      initials: 'LA',
    },
  ],
};
