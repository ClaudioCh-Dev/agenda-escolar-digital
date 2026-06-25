import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'demo123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'nuevaClave123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
