export const queryKeys = {
  entries: ['entries'] as const,
  calendar: ['calendar'] as const,
  notifications: ['notifications'] as const,
  conversations: ['conversations'] as const,
  students: (section: string) => ['students', section] as const,
  parents: (section: string) => ['parents', section] as const,
};
