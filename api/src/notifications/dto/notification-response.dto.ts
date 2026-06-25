import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntryType } from '../../shared/database/enums';

export class NotificationResponseDto {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333301' })
  id!: string;

  @ApiProperty({ example: 'Nuevo comunicado' })
  title!: string;

  @ApiProperty({ example: 'Reunión de padres — 3° A' })
  body!: string;

  @ApiProperty({ example: '2026-06-13T08:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiProperty({ example: 'comunicado' })
  type!: EntryType;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111101' })
  entryId?: string;
}
