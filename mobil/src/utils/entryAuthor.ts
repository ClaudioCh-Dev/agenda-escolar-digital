import type { Entry } from '@/types';
import type { Role } from '@/types/user';

const ROLE_LABELS: Record<Role, string> = {
  auxiliar: 'Auxiliar',
  padre: 'Padre',
  alumno: 'Alumno',
};

export function getEntryAuthorRole(entry: Entry): Role {
  if (entry.authorRole) return entry.authorRole;
  return 'auxiliar';
}

export function getEntryAuthorRoleLabel(entry: Entry): string {
  return ROLE_LABELS[getEntryAuthorRole(entry)];
}

export function formatEntryAuthor(entry: Entry): string {
  return `${getEntryAuthorRoleLabel(entry)} ${entry.author}`;
}
