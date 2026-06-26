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
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import {
  ATTACHMENT_EXAMPLE,
  UPLOAD_ATTACHMENT_EXAMPLE,
} from '../shared/swagger/examples';
import { AttachmentsService } from './attachments.service';
import { MAX_ATTACHMENT_BYTES } from './attachment-limits';
import {
  AttachmentResponseDto,
  UploadAttachmentResponseDto,
} from './dto/attachment.dto';
import { CancelStagingAttachmentDto } from './dto/cancel-staging.dto';

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_ATTACHMENT_BYTES },
};

const fileUploadBody = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'Imagen, PDF o Word (máx. 10 MB)',
      },
    },
  },
};

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @RequirePermission('entries.create', 'calendar.create')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileUploadBody)
  @ApiOperation({
    summary: 'Subir adjunto (staging)',
    description:
      'Sube a Cloudinary sin vincular aún. Permiso: entries.create o calendar.create',
  })
  @ApiEnvelopeCreated(UploadAttachmentResponseDto, {
    example: UPLOAD_ATTACHMENT_EXAMPLE,
  })
  @ApiProtectedErrors()
  async upload(
    @CurrentUser() auth: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiSuccess<UploadAttachmentResponseDto>> {
    return new ApiSuccess(await this.attachmentsService.uploadFile(auth, file));
  }

  @Delete('staging')
  @RequirePermission('entries.create', 'calendar.create')
  @ApiOperation({
    summary: 'Cancelar adjunto en staging',
    description: 'Elimina archivo temporal de Cloudinary',
  })
  @ApiEnvelopeNullOk('Adjunto staging eliminado')
  @ApiProtectedErrors()
  async cancelStaging(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CancelStagingAttachmentDto,
  ): Promise<ApiSuccess<null>> {
    await this.attachmentsService.cancelStagingUpload(auth, dto.publicId);
    return new ApiSuccess(null);
  }

  @Delete(':id')
  @RequirePermission('entries.update', 'calendar.update')
  @ApiParam({ name: 'id', example: '44444444-4444-4444-4444-444444444401' })
  @ApiOperation({
    summary: 'Eliminar adjunto',
    description: 'Permiso: entries.update o calendar.update',
  })
  @ApiEnvelopeNullOk('Adjunto eliminado')
  @ApiNotFoundError('Adjunto no encontrado')
  @ApiProtectedErrors()
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.attachmentsService.deleteAttachment(auth, id);
    return new ApiSuccess(null);
  }
}

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('entries')
export class EntryAttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':id/attachments')
  @RequirePermission('entries.update')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileUploadBody)
  @ApiParam({ name: 'id', example: '11111111-1111-1111-1111-111111111101' })
  @ApiOperation({
    summary: 'Adjuntar archivo a anotación',
    description: 'Permiso: entries.update',
  })
  @ApiEnvelopeCreated(AttachmentResponseDto, { example: ATTACHMENT_EXAMPLE })
  @ApiNotFoundError('Anotación no encontrada')
  @ApiProtectedErrors()
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

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('calendar/events')
export class CalendarAttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':id/attachments')
  @RequirePermission('calendar.update')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileUploadBody)
  @ApiParam({ name: 'id', example: '22222222-2222-2222-2222-222222222201' })
  @ApiOperation({
    summary: 'Adjuntar archivo a evento',
    description: 'Permiso: calendar.update',
  })
  @ApiEnvelopeCreated(AttachmentResponseDto, { example: ATTACHMENT_EXAMPLE })
  @ApiNotFoundError('Evento no encontrado')
  @ApiProtectedErrors()
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
