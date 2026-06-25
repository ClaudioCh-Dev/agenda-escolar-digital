import type { Child, User } from '@/types';
import { apiFetch, buildQuery } from './client';
import { mapChildDto, mapParent, mapUser } from './mappers';
import type { ChildResponseDto, ParentResponseDto, UserProfileDto } from './types';

export async function listStudentsBySection(section: string): Promise<Child[]> {
  const data = await apiFetch<ChildResponseDto[]>(
    `/students${buildQuery({ section })}`,
  );
  return data.map(mapChildDto);
}

export async function getStudent(id: string): Promise<Child> {
  const data = await apiFetch<ChildResponseDto>(`/students/${id}`);
  return mapChildDto(data);
}

export async function listParentsBySection(section: string): Promise<User[]> {
  const data = await apiFetch<ParentResponseDto[]>(
    `/parents${buildQuery({ section })}`,
  );
  return data.map(mapParent);
}

export async function listParentsByStudent(studentId: string): Promise<User[]> {
  const data = await apiFetch<ParentResponseDto[]>(
    `/parents${buildQuery({ studentId })}`,
  );
  return data.map(mapParent);
}

export async function getProfile(): Promise<User> {
  const data = await apiFetch<UserProfileDto>('/users/me');
  return mapUser(data);
}
