import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import type { UserType } from '../../shared/database/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'Ana García' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['student', 'staff', 'parent'], example: 'staff' })
  @IsIn(['student', 'staff', 'parent'])
  userType!: UserType;

  @ApiProperty({ example: 'demo123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 't10000012' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: ['profesor'] })
  @IsArray()
  @IsString({ each: true })
  roleCodes!: string[];

  @ApiPropertyOptional({ example: ['22222222-2222-2222-2222-222222222222'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds?: string[];

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({ example: ['dddddddd-dddd-dddd-dddd-dddddddddddd'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  childStudentIds?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ana García' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['profesor'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleCodes?: string[];

  @ApiPropertyOptional({ example: ['22222222-2222-2222-2222-222222222222'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds?: string[];
}

export class UserAdminResponseDto {
  @ApiProperty({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  id!: string;

  @ApiProperty({ example: 'María Auxiliar' })
  name!: string;

  @ApiProperty({ example: 't10000001' })
  code!: string;

  @ApiProperty({ enum: ['student', 'staff', 'parent'], example: 'staff' })
  userType!: UserType;

  @ApiProperty({ example: 'auxiliar' })
  role!: string;

  @ApiProperty({ example: ['auxiliar'] })
  roles!: string[];

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiProperty({ example: 'MA' })
  initials!: string;
}
