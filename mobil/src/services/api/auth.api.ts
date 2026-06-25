import type { User } from '@/types';
import { apiFetch } from './client';
import { mapUser } from './mappers';
import { clearTokens, getRefreshToken, setTokens } from './tokenStore';
import type { LoginResponseDto, UserProfileDto } from './types';

export interface LoginCredentials {
  code: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const data = await apiFetch<LoginResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      code: credentials.code.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  await setTokens(data.accessToken, data.refreshToken, data.expiresIn);
  return mapUser(data.user);
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch<null>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Clear local session even if server logout fails
    }
  }
  await clearTokens();
}

export async function getSession(): Promise<User | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const profile = await apiFetch<UserProfileDto>('/users/me');
    return mapUser(profile);
  } catch {
    return null;
  }
}

export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await apiFetch<null>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
