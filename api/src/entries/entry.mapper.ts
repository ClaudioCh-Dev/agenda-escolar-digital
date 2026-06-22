import type { EntryEntity } from './entities/entry.entity';
import { toAttachmentResponse } from '../attachments/attachment.mapper';
import { resolvePrimaryRole } from '../shared/access/access.utils';
import { EntryResponseDto } from './dto/entry-response.dto';

export function toEntryResponse(entry: EntryEntity): EntryResponseDto {
  const authorRoles = entry.author?.userRoles?.map((ur) => ur.role.code) ?? [];
  const studentIds = entry.entryStudents?.map((es) => es.studentId) ?? [];

  return {
    id: entry.id,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    date: entry.entryDate,
    time: entry.entryTime.slice(0, 5),
    isImportant: entry.isImportant,
    attachments: (entry.attachments ?? []).map(toAttachmentResponse),
    readBy: entry.entryReads?.map((read) => read.userId) ?? [],
    author: entry.author?.name ?? '',
    authorRole: resolvePrimaryRole(authorRoles),
    section: entry.section?.name ?? '',
    studentId: studentIds.length === 1 ? studentIds[0] : undefined,
    studentIds: studentIds.length > 1 ? studentIds : undefined,
    parentsOnly: entry.parentsOnly,
    requiresAck: entry.requiresAck,
  };
}
