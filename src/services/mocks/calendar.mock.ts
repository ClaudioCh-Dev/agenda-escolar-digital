import type { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import { mockStore, createCalendarEventInStore, updateCalendarEventInStore, deleteCalendarEventInStore } from './store';

export async function listEvents(): Promise<CalendarEvent[]> {
  return [...mockStore.calendarEvents];
}

export async function getEvent(id: string): Promise<CalendarEvent> {
  const event = mockStore.calendarEvents.find(e => e.id === id);
  if (!event) throw new Error('Event not found');
  return event;
}

export async function createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
  return createCalendarEventInStore(data);
}

export async function updateEvent(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
  return updateCalendarEventInStore(id, data);
}

export async function deleteEvent(id: string): Promise<void> {
  deleteCalendarEventInStore(id);
}
