import { UserProfileDto } from '../../users/dto/user-profile.dto';

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponseDto extends AuthTokensDto {
  user: UserProfileDto;
}

export type RefreshResponseDto = AuthTokensDto;
