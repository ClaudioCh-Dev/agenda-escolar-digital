export function buildInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const ROLE_PRIORITY = ['direccion', 'auxiliar', 'profesor', 'padre', 'alumno'];

export function resolvePrimaryRole(roles: string[]): string {
  for (const code of ROLE_PRIORITY) {
    if (roles.includes(code)) {
      return code;
    }
  }

  return roles[0] ?? 'auxiliar';
}

export const CALENDAR_LINKED_ENTRY_TYPES = new Set([
  'festivo',
  'reunion',
  'actuacion',
  'examen',
  'evento',
]);

export const CALENDAR_EVENT_COLORS: Record<string, string> = {
  festivo: '#EF4444',
  examen: '#F59E0B',
  reunion: '#3B82F6',
  actuacion: '#8B5CF6',
  evento: '#10B981',
  tarea: '#6366F1',
};
