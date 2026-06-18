import type { Entry, AppNotification, CalendarEvent, Conversation, User, CreateEntryDto, UpdateEntryDto, CreateCalendarEventDto, UpdateCalendarEventDto, Role } from '@/types';
import { getCalendarEventColor } from '@/constants/calendarTypes';
import {
  MOCK_ENTRIES,
  MOCK_CALENDAR_EVENTS,
  MOCK_NOTIFICATIONS,
  MOCK_CONVERSATIONS,
  MOCK_USERS,
  MOCK_STUDENTS,
} from '@/data/mocks';

class MockStore {
  entries: Entry[] = [...MOCK_ENTRIES];
  calendarEvents: CalendarEvent[] = [...MOCK_CALENDAR_EVENTS];
  notifications: AppNotification[] = [...MOCK_NOTIFICATIONS];
  conversations: Conversation[] = JSON.parse(JSON.stringify(MOCK_CONVERSATIONS));
  currentUser: User | null = null;

  reset() {
    this.entries = [...MOCK_ENTRIES];
    this.calendarEvents = [...MOCK_CALENDAR_EVENTS];
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.conversations = JSON.parse(JSON.stringify(MOCK_CONVERSATIONS));
    this.currentUser = null;
  }
}

export const mockStore = new MockStore();

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

function buildEntryNotification(entry: Entry, prefix: string): AppNotification {
  const typeLabel = entry.type === 'tarea' ? 'tarea'
    : entry.type === 'comunicado' ? 'comunicado'
    : entry.type === 'personalizado' ? 'anotación personalizada'
    : 'anotación';

  return {
    id: `n-${Date.now()}`,
    title: `${prefix}${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}`,
    body: entry.title,
    timestamp: new Date().toISOString(),
    isRead: false,
    type: entry.type,
    entryId: entry.id,
  };
}

export function createEntryInStore(
  data: CreateEntryDto,
  authorName: string,
  sendNotification = true,
  authorRole?: Role,
): Entry {
  const entry: Entry = {
    ...data,
    id: `e-new-${Date.now()}`,
    readBy: [],
    author: authorName,
    authorRole,
  };
  mockStore.entries = [entry, ...mockStore.entries];
  if (sendNotification && data.type !== 'nota_personal') {
    mockStore.notifications = [buildEntryNotification(entry, '📋 Nueva '), ...mockStore.notifications];
  }
  return entry;
}

export function updateEntryInStore(id: string, data: UpdateEntryDto, sendNotification = false): Entry {
  let updated!: Entry;
  mockStore.entries = mockStore.entries.map(e => {
    if (e.id !== id) return e;
    updated = { ...e, ...data, id: e.id, readBy: e.readBy, author: e.author, authorRole: e.authorRole };
    return updated;
  });
  if (sendNotification && data.type !== 'nota_personal') {
    mockStore.notifications = [buildEntryNotification(updated, '✏️ '), ...mockStore.notifications];
  }
  return updated;
}

export function deleteEntryInStore(id: string): void {
  mockStore.entries = mockStore.entries.filter(e => e.id !== id);
}

export function confirmEntryReadInStore(id: string, userId: string): void {
  mockStore.entries = mockStore.entries.map(e =>
    e.id === id && !e.readBy.includes(userId) ? { ...e, readBy: [...e.readBy, userId] } : e,
  );
}

export function createCalendarEventInStore(data: CreateCalendarEventDto): CalendarEvent {
  const event: CalendarEvent = {
    ...data,
    id: `ce-new-${Date.now()}`,
    color: getCalendarEventColor(data.type),
  };
  mockStore.calendarEvents = [...mockStore.calendarEvents, event];
  return event;
}

export function updateCalendarEventInStore(id: string, data: UpdateCalendarEventDto): CalendarEvent {
  let updated!: CalendarEvent;
  mockStore.calendarEvents = mockStore.calendarEvents.map(ev => {
    if (ev.id !== id) return ev;
    updated = { ...ev, ...data, id: ev.id, color: getCalendarEventColor(data.type) };
    return updated;
  });
  return updated;
}

export function deleteCalendarEventInStore(id: string): void {
  mockStore.calendarEvents = mockStore.calendarEvents.filter(ev => ev.id !== id);
}
