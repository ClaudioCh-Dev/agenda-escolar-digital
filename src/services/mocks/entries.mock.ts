import type { Entry, CreateEntryDto, UpdateEntryDto, Role } from '@/types';
import { mockStore, createEntryInStore, updateEntryInStore, deleteEntryInStore, confirmEntryReadInStore } from './store';
import type { ListEntriesParams } from '../api/entries.api';

export async function listEntries(_params?: ListEntriesParams): Promise<Entry[]> {
  return [...mockStore.entries];
}

export async function getEntry(id: string): Promise<Entry> {
  const entry = mockStore.entries.find(e => e.id === id);
  if (!entry) throw new Error('Entry not found');
  return entry;
}

export async function createEntry(
  data: CreateEntryDto,
  authorName: string,
  options?: { sendNotification?: boolean; authorRole?: Role },
): Promise<Entry> {
  return createEntryInStore(data, authorName, options?.sendNotification ?? true, options?.authorRole);
}

export async function updateEntry(id: string, data: UpdateEntryDto, options?: { sendNotification?: boolean }): Promise<Entry> {
  return updateEntryInStore(id, data, options?.sendNotification ?? false);
}

export async function deleteEntry(id: string): Promise<void> {
  deleteEntryInStore(id);
}

export async function confirmEntryRead(id: string, userId: string): Promise<void> {
  confirmEntryReadInStore(id, userId);
}
