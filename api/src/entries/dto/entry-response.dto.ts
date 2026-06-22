import type { EntryType } from '../../shared/database/enums';
import { AttachmentResponseDto } from '../../attachments/dto/attachment.dto';

export class EntryResponseDto {
  id!: string;
  type!: EntryType;
  title!: string;
  description!: string;
  date!: string;
  time!: string;
  isImportant!: boolean;
  attachments!: AttachmentResponseDto[];
  readBy!: string[];
  author!: string;
  authorRole?: string;
  section!: string;
  studentId?: string;
  studentIds?: string[];
  parentsOnly?: boolean;
  requiresAck?: boolean;
}
