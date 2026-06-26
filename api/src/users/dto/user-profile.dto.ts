import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserChildDto {
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

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
  })
  avatar?: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  id!: string;

  @ApiProperty({ example: 'María Auxiliar' })
  name!: string;

  @ApiProperty({ example: 't10000001' })
  code!: string;

  @ApiProperty({ enum: ['student', 'staff', 'parent'], example: 'staff' })
  userType!: 'student' | 'staff' | 'parent';

  @ApiProperty({ example: 'auxiliar' })
  role!: string;

  @ApiProperty({ example: ['auxiliar'] })
  roles!: string[];

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
  })
  avatar?: string;

  @ApiProperty({ example: 'MA' })
  initials!: string;

  @ApiPropertyOptional({ example: '3° A – Primaria' })
  section?: string;

  @ApiPropertyOptional({ example: ['3° A – Primaria'] })
  sections?: string[];

  @ApiPropertyOptional({ example: 'Sede Los Olivos' })
  sede?: string;

  @ApiPropertyOptional({ example: ['Sede Los Olivos'] })
  sedes?: string[];

  @ApiPropertyOptional({ type: [UserChildDto] })
  children?: UserChildDto[];
}
