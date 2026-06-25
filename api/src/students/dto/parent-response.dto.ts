import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserChildDto } from '../../users/dto/user-profile.dto';

export class ParentResponseDto {
  @ApiProperty({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' })
  id!: string;

  @ApiProperty({ example: 'Carlos Padre' })
  name!: string;

  @ApiProperty({ example: 'p10000001' })
  code!: string;

  @ApiProperty({ example: 'padre' })
  role!: string;

  @ApiProperty({ example: 'CP' })
  initials!: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: ['3° A – Primaria'] })
  sections?: string[];

  @ApiPropertyOptional({ type: [UserChildDto] })
  children?: UserChildDto[];
}
