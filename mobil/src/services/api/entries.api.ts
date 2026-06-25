import type { Entry, CreateEntryDto, UpdateEntryDto } from '@/types';
import { apiFetch, buildQuery } from './client';
import { mapEntry, toCreateEntryPayload, toUpdateEntryPayload } from './mappers';
import type { EntryResponseDto } from './types';
import type { CreateEntryMeta, UpdateEntryOptions } from '../entries.service';

export interface ListEntriesParams {
  section?: string;
  childId?: string;
  date?: string;
  from?: string;
  to?: string;
}

export async function listEntries(params?: ListEntriesParams): Promise<Entry[]> {
  const data = await apiFetch<EntryResponseDto[]>(
    `/entries${buildQuery(params)}`,
  );
  return data.map(mapEntry);
}

export async function getEntry(id: string): Promise<Entry> {
  const data = await apiFetch<EntryResponseDto>(`/entries/${id}`);
  return mapEntry(data);
}

export async function createEntry(data: CreateEntryDto, meta: CreateEntryMeta): Promise<Entry> {
  const created = await apiFetch<EntryResponseDto>('/entries', {
    method: 'POST',
    body: JSON.stringify(toCreateEntryPayload(data, meta)),
  });
  return mapEntry(created);
}

export async function updateEntry(
  id: string,
  data: UpdateEntryDto,
  options?: UpdateEntryOptions,
): Promise<Entry> {
  const updated = await apiFetch<EntryResponseDto>(`/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpdateEntryPayload(data, options)),
  });
  return mapEntry(updated);
}

export async function deleteEntry(id: string): Promise<void> {
  await apiFetch<null>(`/entries/${id}`, { method: 'DELETE' });
}

export async function confirmEntryRead(id: string, _userId: string): Promise<void> {
  await apiFetch<null>(`/entries/${id}/read`, { method: 'POST' });
}
