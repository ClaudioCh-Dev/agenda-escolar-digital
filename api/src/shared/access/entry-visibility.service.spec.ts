import { EntryVisibilityService } from './entry-visibility.service';
import type { EntryEntity } from '../../entries/entities/entry.entity';
import type { ScopedUserContext } from './scoped-user-context.interface';

describe('EntryVisibilityService', () => {
  const service = new EntryVisibilityService();

  const baseEntry = {
    id: 'entry-1',
    schoolId: 'school-1',
    sectionId: 'section-1',
    section: { name: '3° A – Primaria' },
    parentsOnly: false,
    entryStudents: [],
  } as EntryEntity;

  const auxiliarContext = {
    primaryRole: 'auxiliar',
    sectionNames: ['3° A – Primaria'],
    sectionIds: ['section-1'],
    studentIds: [],
    childStudentIds: [],
    user: { schoolId: 'school-1' },
  } as ScopedUserContext;

  it('shows section entry to auxiliar in scope', () => {
    expect(service.isVisible(baseEntry, auxiliarContext)).toBe(true);
  });

  it('hides parents_only entry from alumno', () => {
    const alumnoContext = {
      primaryRole: 'alumno',
      sectionNames: ['3° A – Primaria'],
      sectionIds: ['section-1'],
      studentIds: ['student-user-1'],
      childStudentIds: [],
      user: { id: 'student-user-1', schoolId: 'school-1' },
    } as ScopedUserContext;

    expect(
      service.isVisible({ ...baseEntry, parentsOnly: true }, alumnoContext),
    ).toBe(false);
  });
});
