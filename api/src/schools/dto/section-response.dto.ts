import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SectionResponseDto {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  id!: string;

  @ApiProperty({ example: '3° A – Primaria' })
  name!: string;

  @ApiPropertyOptional({ example: '3er Grado' })
  grade?: string;
}
