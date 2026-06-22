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
  @IsString()
  name!: string;

  @IsIn(['student', 'staff', 'parent'])
  userType!: UserType;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsArray()
  @IsString({ each: true })
  roleCodes!: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  childStudentIds?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleCodes?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds?: string[];
}

export class UserAdminResponseDto {
  id!: string;
  name!: string;
  code!: string;
  userType!: UserType;
  role!: string;
  roles!: string[];
  isActive!: boolean;
  avatar?: string;
  initials!: string;
}
