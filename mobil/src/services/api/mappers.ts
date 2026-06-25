import type {
  AppNotification,
  Attachment,
  CalendarEvent,
  Child,
  CreateCalendarEventDto,
  CreateEntryDto,
  Entry,
  Role,
  UpdateCalendarEventDto,
  UpdateEntryDto,
  User,
} from '@/types';
import type {
  AttachmentResponseDto,
  CalendarEventResponseDto,
  ChildResponseDto,
  ConversationResponseDto,
  EntryResponseDto,
  NotificationResponseDto,
  ParentResponseDto,
  UserChildDto,
  UserProfileDto,
} from './types';
import type { CreateEntryMeta } from '../entries.service';

const DEFAULT_CHILD_COLOR = '#6366F1';

export function toMobileRole(apiRole: string): Role {
  if (apiRole === 'padre' || apiRole === 'alumno') return apiRole;
  return 'auxiliar';
}

function mapChild(child: UserChildDto): Child {
  return {
    id: child.id,
    name: child.name,
    section: child.section,
    grade: child.grade,
    initials: child.initials,
    color: DEFAULT_CHILD_COLOR,
    avatar: child.avatar,
  };
}

export function mapUser(profile: UserProfileDto): User {
  return {
    id: profile.id,
    name: profile.name,
    code: profile.code,
    email: profile.code,
    role: toMobileRole(profile.role),
    avatar: profile.avatar,
    initials: profile.initials,
    section: profile.section,
    sections: profile.sections,
    children: profile.children?.map(mapChild),
  };
}

export function mapParent(parent: ParentResponseDto): User {
  return {
    id: parent.id,
    name: parent.name,
    code: parent.code,
    email: parent.code,
    role: 'padre',
    avatar: parent.avatar,
    initials: parent.initials,
    sections: parent.sections,
    children: parent.children?.map(mapChild),
  };
}

export function mapChildDto(child: ChildResponseDto): Child {
  return {
    id: child.id,
    name: child.name,
    section: child.section,
    grade: child.grade,
    initials: child.initials,
    color: child.color || DEFAULT_CHILD_COLOR,
    avatar: child.avatar,
  };
}

export function mapAttachment(att: AttachmentResponseDto): Attachment {
  return {
    id: att.id,
    name: att.name,
    size: att.size,
    fileType: att.fileType,
    url: att.url,
    publicId: att.publicId,
  };
}

function toAttachmentPayload(att: Attachment) {
  return {
    name: att.name,
    storageUrl: att.storageUrl ?? att.url!,
    sizeLabel: att.size,
    fileType: att.fileType,
    publicId: att.publicId,
  };
}

export function mapEntry(entry: EntryResponseDto): Entry {
  return {
    id: entry.id,
    type: entry.type as Entry['type'],
    title: entry.title,
    description: entry.description,
    date: entry.date,
    time: entry.time.slice(0, 5),
    isImportant: entry.isImportant,
    attachments: entry.attachments.map(mapAttachment),
    readBy: entry.readBy,
    author: entry.author,
    authorRole: entry.authorRole ? toMobileRole(entry.authorRole) : undefined,
    section: entry.section,
    studentId: entry.studentId,
    studentIds: entry.studentIds,
    parentsOnly: entry.parentsOnly,
    requiresAck: entry.requiresAck,
  };
}

export function mapCalendarEvent(event: CalendarEventResponseDto): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    type: event.type,
    color: event.color,
    isImportant: event.isImportant,
    attachments: event.attachments?.map(mapAttachment),
  };
}

export function mapNotification(notification: NotificationResponseDto): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    timestamp: notification.timestamp,
    isRead: notification.isRead,
    type: notification.type as AppNotification['type'],
    entryId: notification.entryId,
  };
}

export function mapConversation(conversation: ConversationResponseDto) {
  return {
    id: conversation.id,
    participantId: conversation.participantId,
    participantName: conversation.participantName,
    participantRole: conversation.participantRole,
    participantInitials: conversation.participantInitials,
    participantColor: conversation.participantColor,
    lastMessage: conversation.lastMessage,
    lastTimestamp: conversation.lastTimestamp,
    unreadCount: conversation.unreadCount,
    messages: conversation.messages,
  };
}

function normalizeTime(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

export function toCreateEntryPayload(
  data: CreateEntryDto,
  meta?: CreateEntryMeta,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: data.type,
    title: data.title,
    description: data.description,
    date: data.date,
    time: normalizeTime(data.time),
    isImportant: data.isImportant,
    section: data.section,
  };

  if (data.parentsOnly !== undefined) payload.parentsOnly = data.parentsOnly;
  if (data.requiresAck !== undefined) payload.requiresAck = data.requiresAck;
  if (data.studentIds?.length) payload.studentIds = data.studentIds;
  if (meta?.sendNotification !== undefined) payload.sendNotification = meta.sendNotification;
  if (data.attachments?.length) {
    payload.attachments = data.attachments.map(toAttachmentPayload);
  }

  return payload;
}

export function toUpdateEntryPayload(
  data: UpdateEntryDto,
  options?: { sendNotification?: boolean },
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.type !== undefined) payload.type = data.type;
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.date !== undefined) payload.date = data.date;
  if (data.time !== undefined) payload.time = normalizeTime(data.time);
  if (data.isImportant !== undefined) payload.isImportant = data.isImportant;
  if (data.section !== undefined) payload.section = data.section;
  if (data.parentsOnly !== undefined) payload.parentsOnly = data.parentsOnly;
  if (data.requiresAck !== undefined) payload.requiresAck = data.requiresAck;
  if (data.studentIds !== undefined) payload.studentIds = data.studentIds;
  if (options?.sendNotification !== undefined) {
    payload.sendNotification = options.sendNotification;
  }
  if (data.attachments !== undefined) {
    payload.attachments = data.attachments.map(toAttachmentPayload);
  }

  return payload;
}

export function toCreateCalendarPayload(data: CreateCalendarEventDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: data.title,
    date: data.date,
    type: data.type,
  };

  if (data.description !== undefined) payload.description = data.description;
  if (data.isImportant !== undefined) payload.isImportant = data.isImportant;
  if (data.attachments?.length) {
    payload.attachments = data.attachments.map(toAttachmentPayload);
  }

  return payload;
}

export function toUpdateCalendarPayload(data: UpdateCalendarEventDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.date !== undefined) payload.date = data.date;
  if (data.type !== undefined) payload.type = data.type;
  if (data.isImportant !== undefined) payload.isImportant = data.isImportant;
  if (data.attachments !== undefined) {
    payload.attachments = data.attachments.map(toAttachmentPayload);
  }

  return payload;
}
