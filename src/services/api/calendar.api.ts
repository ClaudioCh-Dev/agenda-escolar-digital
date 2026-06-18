import type { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import { notImplemented } from './client';

export interface ListEventsParams {
  from?: string;
  to?: string;
  section?: string;
}

export async function listEvents(_params?: ListEventsParams): Promise<CalendarEvent[]> {
  notImplemented('GET /calendar/events');
}

export async function getEvent(_id: string): Promise<CalendarEvent> {
  notImplemented('GET /calendar/events/:id');
}

export async function createEvent(_data: CreateCalendarEventDto): Promise<CalendarEvent> {
  notImplemented('POST /calendar/events');
}

export async function updateEvent(_id: string, _data: UpdateCalendarEventDto): Promise<CalendarEvent> {
  notImplemented('PATCH /calendar/events/:id');
}

export async function deleteEvent(_id: string): Promise<void> {
  notImplemented('DELETE /calendar/events/:id');
}
