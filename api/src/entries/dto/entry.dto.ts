import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttachmentInputDto } from '../../attachments/dto/create-attachment-input.dto';
import type { EntryType } from '../../shared/database/enums';

const ENTRY_TYPES: EntryType[] = [
  'tarea',
  'comunicado',
  'material',
  'observacion',
  'recordatorio',
  'nota_personal',
  'personalizado',
  'festivo',
  'reunion',
  'actuacion',
  'examen',
  'evento',
];

export class ListEntriesQueryDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}

export class CreateEntryDto {
  @IsIn(ENTRY_TYPES)
  type!: EntryType;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  time!: string;

  @IsBoolean()
  isImportant!: boolean;

  @IsString()
  section!: string;

  @IsOptional()
  @IsBoolean()
  parentsOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAck?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentInputDto)
  attachments?: CreateAttachmentInputDto[];
}

export class UpdateEntryDto {
  @IsOptional()
  @IsIn(ENTRY_TYPES)
  type?: EntryType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  time?: string;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsBoolean()
  parentsOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAck?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsBoolean()
  sendNotification?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentInputDto)
  attachments?: CreateAttachmentInputDto[];
}
