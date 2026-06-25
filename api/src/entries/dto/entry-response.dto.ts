import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntryType } from '../../shared/database/enums';
import { AttachmentResponseDto } from '../../attachments/dto/attachment.dto';

export class EntryResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111101' })
  id!: string;

  @ApiProperty({ example: 'comunicado' })
  type!: EntryType;

  @ApiProperty({ example: 'Reunión de padres' })
  title!: string;

  @ApiProperty({ example: 'Se convoca a reunión el viernes a las 18:00.' })
  description!: string;

  @ApiProperty({ example: '2026-06-13' })
  date!: string;

  @ApiProperty({ example: '08:00' })
  time!: string;

  @ApiProperty({ example: true })
  isImportant!: boolean;

  @ApiProperty({ type: [AttachmentResponseDto] })
  attachments!: AttachmentResponseDto[];

  @ApiProperty({ example: [] })
  readBy!: string[];

  @ApiProperty({ example: 'María Auxiliar' })
  author!: string;

  @ApiPropertyOptional({ example: 'auxiliar' })
  authorRole?: string;

  @ApiProperty({ example: '3° A – Primaria' })
  section!: string;

  @ApiPropertyOptional({ example: 'dddddddd-dddd-dddd-dddd-dddddddddddd' })
  studentId?: string;

  @ApiPropertyOptional({ example: ['dddddddd-dddd-dddd-dddd-dddddddddddd'] })
  studentIds?: string[];

  @ApiPropertyOptional({ example: false })
  parentsOnly?: boolean;

  @ApiPropertyOptional({ example: true })
  requiresAck?: boolean;
}
