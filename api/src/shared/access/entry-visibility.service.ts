import { Injectable } from '@nestjs/common';
import type { EntryEntity } from '../../entries/entities/entry.entity';
import type {
  ScopedUserContext,
  VisibilityOptions,
} from './scoped-user-context.interface';

@Injectable()
export class EntryVisibilityService {
  isVisible(
    entry: EntryEntity,
    context: ScopedUserContext,
    options?: VisibilityOptions,
  ): boolean {
    const sectionName = entry.section?.name ?? '';
    const studentIds = entry.entryStudents?.map((es) => es.studentId) ?? [];

    if (
      context.primaryRole === 'auxiliar' ||
      context.primaryRole === 'profesor'
    ) {
      if (!context.sectionNames.includes(sectionName)) {
        return false;
      }
      if (options?.selectedSection) {
        return sectionName === options.selectedSection;
      }
      return true;
    }

    if (context.primaryRole === 'alumno') {
      if (entry.parentsOnly) {
        return false;
      }
      if (studentIds.length) {
        return context.studentIds.some((id) => studentIds.includes(id));
      }
      return context.sectionNames.includes(sectionName);
    }

    if (context.primaryRole === 'padre') {
      const childId = options?.selectedChildId ?? context.childStudentIds[0];
      const childSection = context.user.parentStudents?.find(
        (ps) => ps.student.id === childId,
      )?.student.section.name;

      if (!childId || !childSection) {
        return false;
      }
      if (studentIds.length) {
        return studentIds.includes(childId);
      }
      return sectionName === childSection;
    }

    if (context.primaryRole === 'direccion') {
      return entry.schoolId === context.user.schoolId;
    }

    return false;
  }

  filterVisible(
    entries: EntryEntity[],
    context: ScopedUserContext,
    options?: VisibilityOptions,
  ): EntryEntity[] {
    return entries.filter((entry) => this.isVisible(entry, context, options));
  }
}
