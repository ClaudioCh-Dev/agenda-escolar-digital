import type { Entry, User, VisibilityContext } from '@/types';

export function getEntryStudentIds(entry: Entry): string[] {
  if (entry.studentIds?.length) return entry.studentIds;
  if (entry.studentId) return [entry.studentId];
  return [];
}

export function entryHasStudentTarget(entry: Entry): boolean {
  return getEntryStudentIds(entry).length > 0;
}

export function entryTargetsStudent(entry: Entry, studentId: string): boolean {
  return getEntryStudentIds(entry).includes(studentId);
}

export function isEntryVisible(entry: Entry, user: User, context?: VisibilityContext): boolean {
  if (user.role === 'auxiliar') {
    const sections = user.sections ?? [];
    if (!sections.includes(entry.section)) return false;
    if (context?.selectedSection) return entry.section === context.selectedSection;
    return true;
  }

  if (user.role === 'alumno') {
    if (entry.parentsOnly) return false;
    if (entryHasStudentTarget(entry)) return entryTargetsStudent(entry, user.id);
    return entry.section === user.section;
  }

  if (user.role === 'padre') {
    const childId = context?.selectedChildId ?? user.children?.[0]?.id;
    const child = user.children?.find(c => c.id === childId) ?? user.children?.[0];
    if (!child) return false;
    if (entryHasStudentTarget(entry)) return entryTargetsStudent(entry, child.id);
    return entry.section === child.section;
  }

  return false;
}

export function shortSectionLabel(section: string): string {
  return section.split(' – ')[0];
}
