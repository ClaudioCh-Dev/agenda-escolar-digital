import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  refreshToken!: string;

  @ApiProperty({
    example: 900,
    description: 'Segundos hasta expirar el access token',
  })
  expiresIn!: number;
}

export class LoginResponseDto extends AuthTokensDto {
  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;
}

export class RefreshResponseDto extends AuthTokensDto {}
