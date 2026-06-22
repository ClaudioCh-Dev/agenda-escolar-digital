import type { EntryType } from '../../shared/database/enums';

export class NotificationResponseDto {
  id!: string;
  title!: string;
  body!: string;
  timestamp!: string;
  isRead!: boolean;
  type!: EntryType;
  entryId?: string;
}
