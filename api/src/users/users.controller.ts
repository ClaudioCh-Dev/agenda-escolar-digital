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
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return this.usersService
      .findProfileById(user.userId)
      .then((profile) => new ApiSuccess(profile));
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return new ApiSuccess(await this.usersService.updateOwnAvatar(user, file));
  }

  @Delete('me/avatar')
  async removeAvatar(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccess<UserProfileDto>> {
    return new ApiSuccess(await this.usersService.removeOwnAvatar(user));
  }

  @Get()
  @RequirePermission('users.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<UserAdminResponseDto[]>> {
    return new ApiSuccess(await this.usersService.listBySchool(auth.schoolId));
  }

  @Post()
  @RequirePermission('users.manage')
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
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.usersService.deactivateUser(auth.schoolId, id);
    return new ApiSuccess(null);
  }
}
