import type { Entry, CreateEntryDto, UpdateEntryDto } from '@/types';
import { notImplemented } from './client';

export interface ListEntriesParams {
  section?: string;
  childId?: string;
  date?: string;
  from?: string;
  to?: string;
}

export async function listEntries(_params?: ListEntriesParams): Promise<Entry[]> {
  notImplemented('GET /entries');
}

export async function getEntry(_id: string): Promise<Entry> {
  notImplemented('GET /entries/:id');
}

export async function createEntry(_data: CreateEntryDto): Promise<Entry> {
  notImplemented('POST /entries');
}

export async function updateEntry(_id: string, _data: UpdateEntryDto): Promise<Entry> {
  notImplemented('PATCH /entries/:id');
}

export async function deleteEntry(_id: string): Promise<void> {
  notImplemented('DELETE /entries/:id');
}

export async function confirmEntryRead(_id: string): Promise<void> {
  notImplemented('POST /entries/:id/read');
}
