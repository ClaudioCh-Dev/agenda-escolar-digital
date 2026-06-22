import type { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import { USE_MOCK } from '@/constants/config';
import * as calendarApi from './api/calendar.api';
import * as calendarMock from './mocks/calendar.mock';
import type { ListEventsParams } from './api/calendar.api';

export async function listEvents(params?: ListEventsParams): Promise<CalendarEvent[]> {
  return USE_MOCK ? calendarMock.listEvents(params) : calendarApi.listEvents(params);
}

export async function getEvent(id: string): Promise<CalendarEvent> {
  return USE_MOCK ? calendarMock.getEvent(id) : calendarApi.getEvent(id);
}

export async function createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
  return USE_MOCK ? calendarMock.createEvent(data) : calendarApi.createEvent(data);
}

export async function updateEvent(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
  return USE_MOCK ? calendarMock.updateEvent(id, data) : calendarApi.updateEvent(id, data);
}

export async function deleteEvent(id: string): Promise<void> {
  return USE_MOCK ? calendarMock.deleteEvent(id) : calendarApi.deleteEvent(id);
}
