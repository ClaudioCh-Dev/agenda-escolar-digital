import type { User } from '@/types';
import { MOCK_USERS } from '@/data/mocks';
import { mockStore } from './store';
import type { ChangePasswordDto, LoginCredentials } from '../api/auth.api';

const CODE_TO_EMAIL: Record<string, string> = {
  t10000001: 'auxiliar@colegio.edu',
  p10000001: 'padre@colegio.edu',
  e10000001: 'alumno@colegio.edu',
  'auxiliar@colegio.edu': 'auxiliar@colegio.edu',
  'padre@colegio.edu': 'padre@colegio.edu',
  'alumno@colegio.edu': 'alumno@colegio.edu',
};

function resolveMockEmail(code: string): string {
  return CODE_TO_EMAIL[code.trim().toLowerCase()] ?? code.trim().toLowerCase();
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const email = resolveMockEmail(credentials.code);
  const user = MOCK_USERS.find(u => u.email === email);
  if (!user) throw new Error('Usuario no encontrado');
  mockStore.currentUser = user;
  return user;
}

export async function logout(): Promise<void> {
  mockStore.currentUser = null;
}

export async function getSession(): Promise<User | null> {
  return mockStore.currentUser;
}

export async function rehydrateSession(user: User): Promise<User | null> {
  const found = MOCK_USERS.find(u => u.id === user.id);
  if (!found) return null;
  mockStore.currentUser = found;
  return found;
}

export async function changePassword(_data: ChangePasswordDto): Promise<void> {
  await new Promise(r => setTimeout(r, 800));
}
