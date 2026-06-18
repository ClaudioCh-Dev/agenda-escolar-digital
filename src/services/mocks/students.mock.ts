import type { Child, User } from '@/types';
import { MOCK_STUDENTS, MOCK_USERS } from '@/data/mocks';
import { mockStore } from './store';
import { getStudentName } from './store';

export async function listStudentsBySection(section: string): Promise<Child[]> {
  return MOCK_STUDENTS.filter(s => s.section === section);
}

export async function getStudent(id: string): Promise<Child> {
  const student = MOCK_STUDENTS.find(s => s.id === id);
  if (!student) throw new Error('Student not found');
  return student;
}

export { getStudentName };

export async function listParentsBySection(section: string): Promise<User[]> {
  return MOCK_USERS.filter(u => u.role === 'padre' && u.children?.some(c => c.section === section));
}

export async function listParentsByStudent(studentId: string): Promise<User[]> {
  return MOCK_USERS.filter(u => u.role === 'padre' && u.children?.some(c => c.id === studentId));
}

export async function getProfile(): Promise<User> {
  if (!mockStore.currentUser) throw new Error('Not authenticated');
  return mockStore.currentUser;
}

export { MOCK_USERS };
