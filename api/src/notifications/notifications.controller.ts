import { Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('notifications.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<NotificationResponseDto[]>> {
    return new ApiSuccess(await this.notificationsService.list(auth.userId));
  }

  @Get('unread-count')
  @RequirePermission('notifications.read')
  async unreadCount(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<{ count: number }>> {
    const count = await this.notificationsService.getUnreadCount(auth.userId);
    return new ApiSuccess({ count });
  }

  @Patch('read-all')
  @RequirePermission('notifications.read')
  async markAllAsRead(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<null>> {
    await this.notificationsService.markAllAsRead(auth.userId);
    return new ApiSuccess(null);
  }

  @Patch(':id/read')
  @RequirePermission('notifications.read')
  async markAsRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.notificationsService.markAsRead(auth.userId, id);
    return new ApiSuccess(null);
  }
}
