import type { Entry, CreateEntryDto, UpdateEntryDto, Role } from '@/types';
import { notImplemented } from './client';
import type { CreateEntryMeta, UpdateEntryOptions } from '../entries.service';

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

export async function createEntry(_data: CreateEntryDto, _meta: CreateEntryMeta): Promise<Entry> {
  notImplemented('POST /entries');
}

export async function updateEntry(
  _id: string,
  _data: UpdateEntryDto,
  _options?: UpdateEntryOptions,
): Promise<Entry> {
  notImplemented('PATCH /entries/:id');
}

export async function deleteEntry(_id: string): Promise<void> {
  notImplemented('DELETE /entries/:id');
}

export async function confirmEntryRead(_id: string, _userId: string): Promise<void> {
  notImplemented('POST /entries/:id/read');
}
