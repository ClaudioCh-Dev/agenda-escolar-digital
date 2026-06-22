import { IsOptional, IsString } from 'class-validator';

export class ListStudentsQueryDto {
  @IsOptional()
  @IsString()
  section?: string;
}

export class ListParentsQueryDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  studentId?: string;
}
