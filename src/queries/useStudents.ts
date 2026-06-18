import { useQuery } from '@tanstack/react-query';
import { listStudentsBySection, listParentsBySection } from '@/services/students.service';
import { queryKeys } from './keys';

export function useStudentsBySection(section: string) {
  return useQuery({
    queryKey: queryKeys.students(section),
    queryFn: () => listStudentsBySection(section),
    enabled: !!section,
  });
}

export function useParentsBySection(section: string) {
  return useQuery({
    queryKey: queryKeys.parents(section),
    queryFn: () => listParentsBySection(section),
    enabled: !!section,
  });
}
