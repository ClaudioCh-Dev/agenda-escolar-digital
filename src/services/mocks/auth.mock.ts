import type { User } from '@/types';
import { MOCK_USERS } from '@/data/mocks';
import { mockStore } from './store';
import type { ChangePasswordDto, LoginCredentials } from '../api/auth.api';

export async function login(credentials: LoginCredentials): Promise<User> {
  const user = MOCK_USERS.find(u => u.email === credentials.email);
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

export async function changePassword(_data: ChangePasswordDto): Promise<void> {
  await new Promise(r => setTimeout(r, 800));
}
