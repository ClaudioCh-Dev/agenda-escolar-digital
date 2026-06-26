import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import {
  ApiEnvelopeCreated,
  ApiEnvelopeNullOk,
  ApiEnvelopeOk,
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import {
  USER_ADMIN_EXAMPLE,
  USER_PROFILE_EXAMPLE,
} from '../shared/swagger/examples';
import {
  CreateUserDto,
  UpdateUserDto,
  UserAdminResponseDto,
} from './dto/user-admin.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

const avatarUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Perfil propio',
    description: 'Sesión del usuario autenticado',
  })
  @ApiEnvelopeOk(UserProfileDto, { example: USER_PROFILE_EXAMPLE })
  @ApiProtectedErrors()
  getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return this.usersService
      .findProfileById(user.userId)
      .then((profile) => new ApiSuccess(profile));
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen (máx. 5 MB)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir avatar propio' })
  @ApiEnvelopeOk(UserProfileDto, { example: USER_PROFILE_EXAMPLE })
  @ApiProtectedErrors()
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return new ApiSuccess(await this.usersService.updateOwnAvatar(user, file));
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Quitar avatar propio' })
  @ApiEnvelopeOk(UserProfileDto, {
    example: { ...USER_PROFILE_EXAMPLE, avatar: undefined },
  })
  @ApiProtectedErrors()
  async removeAvatar(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return new ApiSuccess(await this.usersService.removeOwnAvatar(user));
  }

  @Get()
  @RequirePermission('users.read')
  @ApiOperation({
    summary: 'Listar usuarios del colegio',
    description: 'Permiso: users.read',
  })
  @ApiEnvelopeOk(UserAdminResponseDto, {
    isArray: true,
    example: [USER_ADMIN_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<UserAdminResponseDto[]>> {
    return new ApiSuccess(await this.usersService.listBySchool(auth.schoolId));
  }

  @Post()
  @RequirePermission('users.manage')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Permiso: users.manage',
  })
  @ApiEnvelopeCreated(UserAdminResponseDto, { example: USER_ADMIN_EXAMPLE })
  @ApiProtectedErrors()
  async create(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CreateUserDto,
  ): Promise<ApiSuccess<UserAdminResponseDto>> {
    return new ApiSuccess(
      await this.usersService.createUser(auth.schoolId, dto),
    );
  }

  @Patch(':id')
  @RequirePermission('users.manage')
  @ApiParam({ name: 'id', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Permiso: users.manage',
  })
  @ApiEnvelopeOk(UserAdminResponseDto, { example: USER_ADMIN_EXAMPLE })
  @ApiNotFoundError('Usuario no encontrado')
  @ApiProtectedErrors()
  async update(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiSuccess<UserAdminResponseDto>> {
    return new ApiSuccess(
      await this.usersService.updateUser(auth.schoolId, id, dto),
    );
  }

  @Delete(':id')
  @RequirePermission('users.manage')
  @ApiParam({ name: 'id', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @ApiOperation({
    summary: 'Desactivar usuario',
    description: 'Soft delete (isActive=false). Permiso: users.manage',
  })
  @ApiEnvelopeNullOk('Usuario desactivado')
  @ApiNotFoundError('Usuario no encontrado')
  @ApiProtectedErrors()
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.usersService.deactivateUser(auth.schoolId, id);
    return new ApiSuccess(null);
  }
}
