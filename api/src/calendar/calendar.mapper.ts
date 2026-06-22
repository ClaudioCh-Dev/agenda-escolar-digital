import type { CalendarEventEntity } from './entities/calendar-event.entity';
import { toAttachmentResponse } from '../attachments/attachment.mapper';
import { CALENDAR_EVENT_COLORS } from '../shared/access/access.utils';
import { CalendarEventResponseDto } from './dto/calendar-event-response.dto';

export function toCalendarEventResponse(
  event: CalendarEventEntity,
): CalendarEventResponseDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    date: event.eventDate,
    type: event.type,
    color: CALENDAR_EVENT_COLORS[event.type] ?? '#6366F1',
    isImportant: event.entry?.isImportant,
    attachments: (event.attachments ?? []).map(toAttachmentResponse),
  };
}
