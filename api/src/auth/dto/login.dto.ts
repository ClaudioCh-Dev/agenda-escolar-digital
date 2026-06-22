import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[etp][0-9]+$/i, {
    message: 'code must start with e, t or p followed by digits',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
