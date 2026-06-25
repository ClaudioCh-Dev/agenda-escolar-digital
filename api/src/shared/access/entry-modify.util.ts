import type { CalendarEventEntity } from '../../calendar/entities/calendar-event.entity';
import type { EntryEntity } from '../../entries/entities/entry.entity';
import type { ScopedUserContext } from './scoped-user-context.interface';

export function canModifyEntry(
  entry: EntryEntity,
  context: ScopedUserContext,
  userId: string,
): boolean {
  if (entry.authorId === userId) {
    return true;
  }

  if (
    context.primaryRole === 'auxiliar' ||
    context.primaryRole === 'direccion'
  ) {
    return (
      context.sectionIds.includes(entry.sectionId) ||
      context.primaryRole === 'direccion'
    );
  }

  return false;
}

export function canModifyCalendarEvent(
  event: CalendarEventEntity,
  context: ScopedUserContext,
  userId: string,
): boolean {
  if (event.authorId === userId) {
    return true;
  }

  if (context.primaryRole === 'direccion') {
    return true;
  }

  if (
    (context.primaryRole === 'auxiliar' ||
      context.primaryRole === 'profesor') &&
    event.sectionId &&
    context.sectionIds.includes(event.sectionId)
  ) {
    return true;
  }

  return false;
}
