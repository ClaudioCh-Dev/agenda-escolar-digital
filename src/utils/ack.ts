import type { Entry } from '@/types';
import { MOCK_USERS, MOCK_STUDENTS } from '@/data/mocks';
import { getEntryStudentIds } from '@/utils/visibility';

/** Default al crear: comunicados y notas personales requieren confirmación. */
export function defaultRequiresAckForType(type: Entry['type']): boolean {
  return type === 'comunicado' || type === 'nota_personal';
}

/** Default: comunicados y notas personales requieren confirmación salvo que el auxiliar lo desactive. */
export function entryRequiresAck(entry: Entry): boolean {
  if (entry.requiresAck !== undefined) return entry.requiresAck;
  return entry.type === 'comunicado' || entry.type === 'nota_personal';
}

export function isPendingAck(entry: Entry, userId: string): boolean {
  return entryRequiresAck(entry) && !entry.readBy.includes(userId);
}

export function countPendingAck(entries: Entry[], userId: string): number {
  return entries.filter(e => isPendingAck(e, userId)).length;
}

/** Pendientes de lectura, del más antiguo al más reciente. */
export function getPendingAckEntries(entries: Entry[], userId: string): Entry[] {
  return entries
    .filter(e => isPendingAck(e, userId))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.time.localeCompare(b.time);
    });
}

/** Padres que deberían confirmar según sección o alumnos destinatarios. */
export function getExpectedParentIds(entry: Entry): string[] {
  const targetStudentIds = getEntryStudentIds(entry);

  if (targetStudentIds.length > 0) {
    const parentIds = new Set<string>();
    for (const user of MOCK_USERS) {
      if (user.role !== 'padre') continue;
      const hasTargetChild = user.children?.some(c => targetStudentIds.includes(c.id));
      if (hasTargetChild) parentIds.add(user.id);
    }
    return [...parentIds];
  }

  const sectionStudentIds = MOCK_STUDENTS
    .filter(s => s.section === entry.section)
    .map(s => s.id);

  const parentIds = new Set<string>();
  for (const user of MOCK_USERS) {
    if (user.role !== 'padre') continue;
    const hasChildInSection = user.children?.some(c => sectionStudentIds.includes(c.id));
    if (hasChildInSection) parentIds.add(user.id);
  }
  return [...parentIds];
}

export function getAckStats(entry: Entry): { confirmed: number; total: number } {
  if (!entryRequiresAck(entry)) {
    return { confirmed: 0, total: 0 };
  }
  const expected = getExpectedParentIds(entry);
  const total = expected.length || 1;
  const confirmed = entry.readBy.filter(id => expected.includes(id)).length;
  return { confirmed, total };
}

export function hasIncompleteAck(entry: Entry): boolean {
  if (!entryRequiresAck(entry)) return false;
  const { confirmed, total } = getAckStats(entry);
  return confirmed < total;
}

export interface ParentAckStatus {
  id: string;
  name: string;
  confirmed: boolean;
}

/** Lista de padres que deben confirmar lectura, con estado. */
export function getParentAckList(entry: Entry): ParentAckStatus[] {
  if (!entryRequiresAck(entry)) return [];

  const expectedIds = getExpectedParentIds(entry);
  const parents = MOCK_USERS.filter(u => u.role === 'padre' && expectedIds.includes(u.id));

  return parents
    .map(p => ({
      id: p.id,
      name: p.name,
      confirmed: entry.readBy.includes(p.id),
    }))
    .sort((a, b) => {
      if (a.confirmed !== b.confirmed) return a.confirmed ? -1 : 1;
      return a.name.localeCompare(b.name, 'es');
    });
}
