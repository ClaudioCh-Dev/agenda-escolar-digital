import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 't10000001',
    description: 'Código único: e (alumno), t (staff), p (padre) + dígitos',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[etp][0-9]+$/i, {
    message: 'code must start with e, t or p followed by digits',
  })
  code!: string;

  @ApiProperty({ example: 'demo123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
