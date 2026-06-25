import { Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import {
  ApiEnvelopeDataOk,
  ApiEnvelopeNullOk,
  ApiEnvelopeOk,
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import { NOTIFICATION_EXAMPLE } from '../shared/swagger/examples';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('notifications.read')
  @ApiOperation({ summary: 'Bandeja de notificaciones', description: 'Permiso: notifications.read' })
  @ApiEnvelopeOk(NotificationResponseDto, {
    isArray: true,
    example: [NOTIFICATION_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<NotificationResponseDto[]>> {
    return new ApiSuccess(await this.notificationsService.list(auth.userId));
  }

  @Get('unread-count')
  @RequirePermission('notifications.read')
  @ApiOperation({ summary: 'Contador de no leídas' })
  @ApiEnvelopeDataOk('Cantidad de notificaciones sin leer', { count: 3 })
  @ApiProtectedErrors()
  async unreadCount(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<{ count: number }>> {
    const count = await this.notificationsService.getUnreadCount(auth.userId);
    return new ApiSuccess({ count });
  }

  @Patch('read-all')
  @RequirePermission('notifications.read')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  @ApiEnvelopeNullOk('Todas marcadas como leídas')
  @ApiProtectedErrors()
  async markAllAsRead(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<null>> {
    await this.notificationsService.markAllAsRead(auth.userId);
    return new ApiSuccess(null);
  }

  @Patch(':id/read')
  @RequirePermission('notifications.read')
  @ApiParam({ name: 'id', example: '33333333-3333-3333-3333-333333333301' })
  @ApiOperation({ summary: 'Marcar una como leída' })
  @ApiEnvelopeNullOk('Notificación marcada como leída')
  @ApiNotFoundError('Notificación no encontrada')
  @ApiProtectedErrors()
  async markAsRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.notificationsService.markAsRead(auth.userId, id);
    return new ApiSuccess(null);
  }
}
