import type { EntryType } from './entry';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: EntryType;
  entryId?: string;
}
