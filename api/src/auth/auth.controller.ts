import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiSuccess } from '../shared';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type {
  LoginResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiSuccess<LoginResponseDto>> {
    return new ApiSuccess(await this.authService.login(dto));
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<ApiSuccess<RefreshResponseDto>> {
    return new ApiSuccess(await this.authService.refresh(dto.refreshToken));
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<ApiSuccess<null>> {
    await this.authService.logout(dto.refreshToken);
    return new ApiSuccess(null);
  }

  @Patch('password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiSuccess<null>> {
    await this.authService.changePassword(user.userId, dto);
    return new ApiSuccess(null);
  }
}
