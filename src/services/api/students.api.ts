import type { Child, User } from '@/types';
import { notImplemented } from './client';

export async function listStudentsBySection(_section: string): Promise<Child[]> {
  notImplemented('GET /students?section=');
}

export async function getStudent(_id: string): Promise<Child> {
  notImplemented('GET /students/:id');
}

export async function listParentsBySection(_section: string): Promise<User[]> {
  notImplemented('GET /parents?section=');
}

export async function listParentsByStudent(_studentId: string): Promise<User[]> {
  notImplemented('GET /parents?studentId=');
}

export async function getProfile(): Promise<User> {
  notImplemented('GET /users/me');
}
