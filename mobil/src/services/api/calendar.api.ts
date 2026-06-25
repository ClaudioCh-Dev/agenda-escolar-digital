import type { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import { apiFetch, buildQuery } from './client';
import {
  mapCalendarEvent,
  toCreateCalendarPayload,
  toUpdateCalendarPayload,
} from './mappers';
import type { CalendarEventResponseDto } from './types';

export interface ListEventsParams {
  from?: string;
  to?: string;
  section?: string;
}

export async function listEvents(params?: ListEventsParams): Promise<CalendarEvent[]> {
  const data = await apiFetch<CalendarEventResponseDto[]>(
    `/calendar/events${buildQuery(params)}`,
  );
  return data.map(mapCalendarEvent);
}

export async function getEvent(id: string): Promise<CalendarEvent> {
  const data = await apiFetch<CalendarEventResponseDto>(`/calendar/events/${id}`);
  return mapCalendarEvent(data);
}

export async function createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
  const created = await apiFetch<CalendarEventResponseDto>('/calendar/events', {
    method: 'POST',
    body: JSON.stringify(toCreateCalendarPayload(data)),
  });
  return mapCalendarEvent(created);
}

export async function updateEvent(
  id: string,
  data: UpdateCalendarEventDto,
): Promise<CalendarEvent> {
  const updated = await apiFetch<CalendarEventResponseDto>(`/calendar/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpdateCalendarPayload(data)),
  });
  return mapCalendarEvent(updated);
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch<null>(`/calendar/events/${id}`, { method: 'DELETE' });
}
