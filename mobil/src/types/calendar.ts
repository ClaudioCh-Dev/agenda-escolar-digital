import type { Attachment } from './entry';

export type SchoolCalendarEventType = 'festivo' | 'examen' | 'reunion' | 'actuacion' | 'evento';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: SchoolCalendarEventType | 'tarea';
  color: string;
  isImportant?: boolean;
  attachments?: Attachment[];
}

export type CreateCalendarEventDto = Omit<CalendarEvent, 'id' | 'color'>;
export type UpdateCalendarEventDto = CreateCalendarEventDto;
