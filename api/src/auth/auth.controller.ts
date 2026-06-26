import { Body, Controller, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiSuccess } from '../shared';
import {
  ApiEnvelopeCreated,
  ApiEnvelopeNullOk,
  ApiValidationError,
  apiErrorExample,
} from '../shared/swagger';
import {
  LOGIN_RESPONSE_EXAMPLE,
  REFRESH_RESPONSE_EXAMPLE,
} from '../shared/swagger/examples';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Login con código (e/t/p…) y contraseña',
  })
  @ApiEnvelopeCreated(LoginResponseDto, {
    description: 'Tokens JWT y perfil del usuario',
    example: LOGIN_RESPONSE_EXAMPLE,
  })
  @ApiValidationError()
  @ApiUnauthorizedResponse({
    description: 'Credenciales incorrectas',
    schema: {
      example: apiErrorExample('INVALID_CREDENTIALS', 'Invalid credentials'),
    },
  })
  async login(@Body() dto: LoginDto): Promise<ApiSuccess<LoginResponseDto>> {
    return new ApiSuccess(await this.authService.login(dto));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar tokens',
    description: 'Rota refresh token y emite nuevo par access/refresh',
  })
  @ApiEnvelopeCreated(RefreshResponseDto, {
    example: REFRESH_RESPONSE_EXAMPLE,
  })
  @ApiValidationError()
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido o reutilizado',
    schema: {
      example: apiErrorExample(
        'INVALID_REFRESH_TOKEN',
        'Invalid refresh token',
      ),
    },
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<ApiSuccess<RefreshResponseDto>> {
    return new ApiSuccess(await this.authService.refresh(dto.refreshToken));
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Revoca el refresh token en servidor',
  })
  @ApiEnvelopeNullOk('Sesión cerrada')
  @ApiValidationError()
  async logout(@Body() dto: RefreshTokenDto): Promise<ApiSuccess<null>> {
    await this.authService.logout(dto.refreshToken);
    return new ApiSuccess(null);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Requiere JWT del usuario autenticado',
  })
  @ApiEnvelopeNullOk('Contraseña actualizada')
  @ApiValidationError()
  @ApiUnauthorizedResponse({
    description: 'Contraseña actual incorrecta o sin sesión',
    schema: {
      example: apiErrorExample('INVALID_CREDENTIALS', 'Invalid credentials'),
    },
  })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiSuccess<null>> {
    await this.authService.changePassword(user.userId, dto);
    return new ApiSuccess(null);
  }
}
