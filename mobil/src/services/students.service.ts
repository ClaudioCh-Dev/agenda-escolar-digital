import type { Child, User } from '@/types';
import { USE_MOCK } from '@/constants/config';
import * as studentsApi from './api/students.api';
import * as studentsMock from './mocks/students.mock';
import { getStudentName as getStudentNameFromStore } from './mocks/store';

export async function listStudentsBySection(section: string): Promise<Child[]> {
  return USE_MOCK
    ? studentsMock.listStudentsBySection(section)
    : studentsApi.listStudentsBySection(section);
}

export async function getStudent(id: string): Promise<Child> {
  return USE_MOCK ? studentsMock.getStudent(id) : studentsApi.getStudent(id);
}

export async function listParentsBySection(section: string): Promise<User[]> {
  return USE_MOCK
    ? studentsMock.listParentsBySection(section)
    : studentsApi.listParentsBySection(section);
}

export async function listParentsByStudent(studentId: string): Promise<User[]> {
  return USE_MOCK
    ? studentsMock.listParentsByStudent(studentId)
    : studentsApi.listParentsByStudent(studentId);
}

export async function getProfile(): Promise<User> {
  return USE_MOCK ? studentsMock.getProfile() : studentsApi.getProfile();
}

export function getStudentName(id: string): string {
  if (USE_MOCK) return getStudentNameFromStore(id);
  return 'Alumno';
}
