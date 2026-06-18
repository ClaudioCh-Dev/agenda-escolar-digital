import type { User } from '@/types';
import { notImplemented } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export async function login(_credentials: LoginCredentials): Promise<User> {
  notImplemented('POST /auth/login');
}

export async function logout(): Promise<void> {
  notImplemented('POST /auth/logout');
}

export async function getSession(): Promise<User | null> {
  notImplemented('GET /auth/session');
}

export async function changePassword(_data: ChangePasswordDto): Promise<void> {
  notImplemented('PATCH /auth/password');
}
