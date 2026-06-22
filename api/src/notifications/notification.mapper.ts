import type { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import type { EntryEntity } from '../entries/entities/entry.entity';
import type { NotificationEntity } from './entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';

export function toNotificationResponse(
  notification: NotificationEntity,
): NotificationResponseDto {
  const entryType =
    (notification.entry?.type as NotificationResponseDto['type']) ??
    'comunicado';

  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    timestamp: notification.createdAt.toISOString(),
    isRead: notification.isRead,
    type: entryType,
    entryId: notification.entryId ?? undefined,
  };
}

export function buildEntryNotificationCopy(entry: EntryEntity): {
  title: string;
  body: string;
} {
  return {
    title: entry.title,
    body: entry.description || 'Nueva anotación en la agenda',
  };
}

export function buildCalendarNotificationCopy(event: CalendarEventEntity): {
  title: string;
  body: string;
} {
  return {
    title: event.title,
    body: event.description || 'Nuevo evento en el calendario escolar',
  };
}
