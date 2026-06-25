import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChildResponseDto {
  @ApiProperty({ example: 'dddddddd-dddd-dddd-dddd-dddddddddddd' })
  id!: string;

  @ApiProperty({ example: 'Lucas Alumno' })
  name!: string;

  @ApiProperty({ example: '3° A – Primaria' })
  section!: string;

  @ApiProperty({ example: '3er Grado' })
  grade!: string;

  @ApiProperty({ example: 'LA' })
  initials!: string;

  @ApiProperty({ example: '#0D9488' })
  color!: string;

  @ApiPropertyOptional()
  avatar?: string;
}
