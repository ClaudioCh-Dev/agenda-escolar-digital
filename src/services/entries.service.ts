import type { Entry, CreateEntryDto, UpdateEntryDto, Role } from '@/types';
import { USE_MOCK } from '@/constants/config';
import * as entriesApi from './api/entries.api';
import * as entriesMock from './mocks/entries.mock';
import type { ListEntriesParams } from './api/entries.api';

export interface CreateEntryMeta {
  authorName: string;
  authorRole?: Role;
  sendNotification?: boolean;
}

export interface UpdateEntryOptions {
  sendNotification?: boolean;
}

export async function listEntries(params?: ListEntriesParams): Promise<Entry[]> {
  return USE_MOCK ? entriesMock.listEntries(params) : entriesApi.listEntries(params);
}

export async function getEntry(id: string): Promise<Entry> {
  return USE_MOCK ? entriesMock.getEntry(id) : entriesApi.getEntry(id);
}

export async function createEntry(data: CreateEntryDto, meta: CreateEntryMeta): Promise<Entry> {
  if (USE_MOCK) {
    return entriesMock.createEntry(data, meta.authorName, {
      sendNotification: meta.sendNotification,
      authorRole: meta.authorRole,
    });
  }
  return entriesApi.createEntry(data, meta);
}

export async function updateEntry(
  id: string,
  data: UpdateEntryDto,
  options?: UpdateEntryOptions,
): Promise<Entry> {
  return USE_MOCK
    ? entriesMock.updateEntry(id, data, options)
    : entriesApi.updateEntry(id, data, options);
}

export async function deleteEntry(id: string): Promise<void> {
  return USE_MOCK ? entriesMock.deleteEntry(id) : entriesApi.deleteEntry(id);
}

export async function confirmEntryRead(id: string, userId: string): Promise<void> {
  return USE_MOCK
    ? entriesMock.confirmEntryRead(id, userId)
    : entriesApi.confirmEntryRead(id, userId);
}
