import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CalendarEventType } from '../../shared/database/enums';
import { AttachmentResponseDto } from '../../attachments/dto/attachment.dto';

export class CalendarEventResponseDto {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222201' })
  id!: string;

  @ApiProperty({ example: 'Festivo — Día del Padre' })
  title!: string;

  @ApiPropertyOptional({ example: 'No hay clases' })
  description?: string;

  @ApiProperty({ example: '2026-06-15' })
  date!: string;

  @ApiProperty({ example: 'festivo' })
  type!: CalendarEventType | 'tarea';

  @ApiProperty({ example: '#8B5CF6' })
  color!: string;

  @ApiPropertyOptional({ example: false })
  isImportant?: boolean;

  @ApiPropertyOptional({ type: [AttachmentResponseDto] })
  attachments?: AttachmentResponseDto[];
}
