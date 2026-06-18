import { USE_MOCK } from '@/constants/config';
import * as authApi from './api/auth.api';
import * as authMock from './mocks/auth.mock';
import type { LoginCredentials, ChangePasswordDto } from './api/auth.api';
import type { User } from '@/types';

export type { LoginCredentials, ChangePasswordDto };

export async function login(credentials: LoginCredentials): Promise<User> {
  return USE_MOCK ? authMock.login(credentials) : authApi.login(credentials);
}

export async function logout(): Promise<void> {
  return USE_MOCK ? authMock.logout() : authApi.logout();
}

export async function getSession(): Promise<User | null> {
  return USE_MOCK ? authMock.getSession() : authApi.getSession();
}

export async function restoreAuthSession(persistedUser: User | null): Promise<User | null> {
  if (!persistedUser) return null;

  const session = await getSession();
  if (session) return session;

  if (USE_MOCK) {
    return authMock.rehydrateSession(persistedUser);
  }

  return null;
}

export async function changePassword(data: ChangePasswordDto): Promise<void> {
  return USE_MOCK ? authMock.changePassword(data) : authApi.changePassword(data);
}
