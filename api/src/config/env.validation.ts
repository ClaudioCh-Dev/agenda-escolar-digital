import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnvValidation {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES!: string;

  @IsOptional()
  @IsIn(['debug', 'info', 'warn', 'error'])
  LOG_LEVEL?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_FOLDER?: string;
}
