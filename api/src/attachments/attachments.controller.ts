import {
  Body,
  Controller,
  Delete,
  Param,
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
import { AttachmentsService } from './attachments.service';
import {
  AttachmentResponseDto,
  UploadAttachmentResponseDto,
} from './dto/attachment.dto';
import { CancelStagingAttachmentDto } from './dto/cancel-staging.dto';

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
};

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @RequirePermission('entries.create', 'calendar.create')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async upload(
    @CurrentUser() auth: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<UploadAttachmentResponseDto>> {
    return new ApiSuccess(await this.attachmentsService.uploadFile(auth, file));
  }

  @Delete('staging')
  @RequirePermission('entries.create', 'calendar.create')
  async cancelStaging(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CancelStagingAttachmentDto,
  ): Promise<ApiSuccess<null>> {
    await this.attachmentsService.cancelStagingUpload(auth, dto.publicId);
    return new ApiSuccess(null);
  }

  @Delete(':id')
  @RequirePermission('entries.update', 'calendar.update')
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.attachmentsService.deleteAttachment(auth, id);
    return new ApiSuccess(null);
  }
}

@Controller('entries')
export class EntryAttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':id/attachments')
  @RequirePermission('entries.update')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadToEntry(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') entryId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<AttachmentResponseDto>> {
    return new ApiSuccess(
      await this.attachmentsService.uploadToEntry(auth, entryId, file),
    );
  }
}

@Controller('calendar/events')
export class CalendarAttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':id/attachments')
  @RequirePermission('calendar.update')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadToEvent(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') eventId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<AttachmentResponseDto>> {
    return new ApiSuccess(
      await this.attachmentsService.uploadToCalendarEvent(auth, eventId, file),
    );
  }
}
