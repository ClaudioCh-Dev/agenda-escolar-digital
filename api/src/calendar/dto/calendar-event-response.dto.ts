import type { CalendarEventType } from '../../shared/database/enums';
import { AttachmentResponseDto } from '../../attachments/dto/attachment.dto';

export class CalendarEventResponseDto {
  id!: string;
  title!: string;
  description?: string;
  date!: string;
  type!: CalendarEventType | 'tarea';
  color!: string;
  isImportant?: boolean;
  attachments?: AttachmentResponseDto[];
}
