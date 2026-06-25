import type { Role } from './user';

export type EntryType =
  | 'tarea'
  | 'comunicado'
  | 'material'
  | 'observacion'
  | 'recordatorio'
  | 'examen'
  | 'evento'
  | 'nota_personal'
  | 'personalizado';

export interface Attachment {
  id?: string;
  name: string;
  size: string;
  fileType: 'pdf' | 'image' | 'doc';
  url?: string;
  publicId?: string;
  storageUrl?: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  description: string;
  date: string;
  time: string;
  isImportant: boolean;
  attachments: Attachment[];
  readBy: string[];
  author: string;
  authorRole?: Role;
  section: string;
  studentId?: string;
  /** Varios alumnos en registros personalizados. */
  studentIds?: string[];
  /** Si es true, el registro no aparece en la agenda del alumno. */
  parentsOnly?: boolean;
  /** Si es true, el padre debe confirmar que vio el registro. Default: true en comunicados y notas personales. */
  requiresAck?: boolean;
}

export type CreateEntryDto = Omit<Entry, 'id' | 'readBy' | 'author'>;
export type UpdateEntryDto = CreateEntryDto;
