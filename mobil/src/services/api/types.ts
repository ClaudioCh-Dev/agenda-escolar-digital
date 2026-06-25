import type { EntryType } from '@/types';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; detail?: string } | null;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserChildDto {
  id: string;
  name: string;
  section: string;
  grade: string;
  initials: string;
  avatar?: string;
}

export interface UserProfileDto {
  id: string;
  name: string;
  code: string;
  userType: 'student' | 'staff' | 'parent';
  role: string;
  roles: string[];
  avatar?: string;
  initials: string;
  section?: string;
  sections?: string[];
  sede?: string;
  sedes?: string[];
  children?: UserChildDto[];
}

export interface LoginResponseDto extends AuthTokensResponse {
  user: UserProfileDto;
}

export interface AttachmentResponseDto {
  id: string;
  name: string;
  size: string;
  fileType: 'pdf' | 'image' | 'doc';
  url: string;
  publicId?: string;
}

export interface UploadAttachmentResponseDto {
  name: string;
  storageUrl: string;
  sizeLabel: string;
  fileType: 'pdf' | 'image' | 'doc';
  publicId: string;
}

export interface EntryResponseDto {
  id: string;
  type: EntryType | 'festivo' | 'reunion' | 'actuacion';
  title: string;
  description: string;
  date: string;
  time: string;
  isImportant: boolean;
  attachments: AttachmentResponseDto[];
  readBy: string[];
  author: string;
  authorRole?: string;
  section: string;
  studentId?: string;
  studentIds?: string[];
  parentsOnly?: boolean;
  requiresAck?: boolean;
}

export interface CalendarEventResponseDto {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'festivo' | 'examen' | 'reunion' | 'actuacion' | 'evento' | 'tarea';
  color: string;
  isImportant?: boolean;
  attachments?: AttachmentResponseDto[];
}

export interface NotificationResponseDto {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: EntryType | 'festivo' | 'reunion' | 'actuacion';
  entryId?: string;
}

export interface MessageResponseDto {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ConversationResponseDto {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantInitials: string;
  participantColor: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: MessageResponseDto[];
}

export interface ParentResponseDto {
  id: string;
  name: string;
  code: string;
  role: string;
  initials: string;
  avatar?: string;
  sections?: string[];
  children?: UserChildDto[];
}

export interface ChildResponseDto {
  id: string;
  name: string;
  section: string;
  grade: string;
  initials: string;
  color: string;
  avatar?: string;
}
