import {
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  getDocumentFolder,
  isDocumentPublicIdInSchoolScope,
} from '../cloudinary/cloudinary-paths';
import { EntryEntity } from '../entries/entities/entry.entity';
import { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import {
  canModifyCalendarEvent,
  canModifyEntry,
} from '../shared/access/entry-modify.util';
import { UserScopeService } from '../shared/access/user-scope.service';
import { ForbiddenException } from '../shared/exception/forbidden.exception';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { domainLog } from '../shared/logging';
import {
  AttachmentResponseDto,
  UploadAttachmentResponseDto,
} from './dto/attachment.dto';
import { CreateAttachmentInputDto } from './dto/create-attachment-input.dto';
import { AttachmentEntity } from './entities/attachment.entity';
import {
  formatFileSize,
  resolveAttachmentFileType,
  toAttachmentResponse,
} from './attachment.mapper';
import {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_ERROR_MESSAGE,
} from './attachment-limits';
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'application/msword',
];
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentsRepository: Repository<AttachmentEntity>,
    @InjectRepository(EntryEntity)
    private readonly entriesRepository: Repository<EntryEntity>,
    @InjectRepository(CalendarEventEntity)
    private readonly calendarEventsRepository: Repository<CalendarEventEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userScopeService: UserScopeService,
  ) {}

  async uploadFile(
    auth: AuthenticatedUser,
    file: Express.Multer.File,
  ): Promise<UploadAttachmentResponseDto> {
    this.validateFile(file);

    const upload = await this.cloudinaryService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      getDocumentFolder(this.cloudinaryService.getRootFolder(), auth.schoolId),
    );

    const fileType = resolveAttachmentFileType(
      file.mimetype,
      file.originalname,
    );

    this.logger.log(
      domainLog({
        action: 'attachments.upload',
        userId: auth.userId,
        module: 'attachments',
      }),
    );

    return {
      name: file.originalname,
      storageUrl: upload.storageUrl,
      sizeLabel: formatFileSize(upload.bytes),
      fileType,
      publicId: upload.publicId,
    };
  }

  async syncForEntry(
    entryId: string,
    calendarEventId: string | null,
    inputs: CreateAttachmentInputDto[] | undefined,
  ): Promise<void> {
    if (!inputs?.length) {
      return;
    }

    await this.attachmentsRepository.save(
      inputs.map((input) =>
        this.attachmentsRepository.create({
          entryId,
          calendarEventId,
          name: input.name,
          sizeLabel: input.sizeLabel,
          fileType: input.fileType,
          storageUrl: input.storageUrl,
          cloudinaryPublicId: input.publicId ?? null,
        }),
      ),
    );
  }

  async replaceForEntry(
    entryId: string,
    calendarEventId: string | null,
    inputs: CreateAttachmentInputDto[] | undefined,
  ): Promise<void> {
    const existing = await this.attachmentsRepository.find({
      where: { entryId },
    });

    for (const attachment of existing) {
      await this.removeFromCloudinary(attachment);
    }

    await this.attachmentsRepository.delete({ entryId });

    await this.syncForEntry(entryId, calendarEventId, inputs);
  }

  async syncForCalendarEvent(
    calendarEventId: string,
    inputs: CreateAttachmentInputDto[] | undefined,
  ): Promise<void> {
    if (!inputs?.length) {
      return;
    }

    await this.attachmentsRepository.save(
      inputs.map((input) =>
        this.attachmentsRepository.create({
          entryId: null,
          calendarEventId,
          name: input.name,
          sizeLabel: input.sizeLabel,
          fileType: input.fileType,
          storageUrl: input.storageUrl,
          cloudinaryPublicId: input.publicId ?? null,
        }),
      ),
    );
  }

  async replaceForCalendarEvent(
    calendarEventId: string,
    inputs: CreateAttachmentInputDto[] | undefined,
  ): Promise<void> {
    const existing = await this.attachmentsRepository.find({
      where: { calendarEventId },
    });

    for (const attachment of existing) {
      await this.removeFromCloudinary(attachment);
    }

    await this.attachmentsRepository.delete({ calendarEventId });
    await this.syncForCalendarEvent(calendarEventId, inputs);
  }

  async uploadToEntry(
    auth: AuthenticatedUser,
    entryId: string,
    file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    const entry = await this.findEntryInSchool(entryId, auth.schoolId);
    await this.assertCanModifyEntry(entry, auth.userId);

    const uploaded = await this.uploadFile(auth, file);
    const calendarEvent = await this.calendarEventsRepository.findOne({
      where: { entryId: entry.id },
    });

    const saved = await this.attachmentsRepository.save(
      this.attachmentsRepository.create({
        entryId: entry.id,
        calendarEventId: calendarEvent?.id ?? null,
        name: uploaded.name,
        sizeLabel: uploaded.sizeLabel,
        fileType: uploaded.fileType,
        storageUrl: uploaded.storageUrl,
        cloudinaryPublicId: uploaded.publicId,
      }),
    );

    return toAttachmentResponse(saved);
  }

  async uploadToCalendarEvent(
    auth: AuthenticatedUser,
    calendarEventId: string,
    file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    const event = await this.findCalendarEventInSchool(
      calendarEventId,
      auth.schoolId,
    );
    await this.assertCanModifyCalendarEvent(event, auth.userId);

    const uploaded = await this.uploadFile(auth, file);

    const saved = await this.attachmentsRepository.save(
      this.attachmentsRepository.create({
        entryId: event.entryId,
        calendarEventId: event.id,
        name: uploaded.name,
        sizeLabel: uploaded.sizeLabel,
        fileType: uploaded.fileType,
        storageUrl: uploaded.storageUrl,
        cloudinaryPublicId: uploaded.publicId,
      }),
    );

    return toAttachmentResponse(saved);
  }

  async cancelStagingUpload(
    auth: AuthenticatedUser,
    publicId: string,
  ): Promise<void> {
    this.assertPublicIdInSchoolScope(publicId, auth.schoolId);

    if (this.cloudinaryService.isConfigured()) {
      await this.cloudinaryService.deleteByPublicId(publicId);
    }

    this.logger.log(
      domainLog({
        action: 'attachments.staging.cancel',
        userId: auth.userId,
        module: 'attachments',
      }),
    );
  }

  async deleteAttachment(auth: AuthenticatedUser, id: string): Promise<void> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id },
      relations: { entry: true, calendarEvent: true },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const schoolId =
      attachment.entry?.schoolId ?? attachment.calendarEvent?.schoolId;

    if (schoolId !== auth.schoolId) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.entry) {
      await this.assertCanModifyEntry(attachment.entry, auth.userId);
    } else if (attachment.calendarEvent) {
      await this.assertCanModifyCalendarEvent(
        attachment.calendarEvent,
        auth.userId,
      );
    }

    await this.removeFromCloudinary(attachment);
    await this.attachmentsRepository.delete(id);

    this.logger.log(
      domainLog({
        action: 'attachments.delete',
        userId: auth.userId,
        attachmentId: id,
        module: 'attachments',
      }),
    );
  }

  async findByEntryId(entryId: string): Promise<AttachmentEntity[]> {
    return this.attachmentsRepository.find({ where: { entryId } });
  }

  async findByCalendarEventId(
    calendarEventId: string,
  ): Promise<AttachmentEntity[]> {
    return this.attachmentsRepository.find({ where: { calendarEventId } });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file?.buffer?.length) {
      throw new UnsupportedMediaTypeException('File is required');
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new PayloadTooLargeException(MAX_ATTACHMENT_ERROR_MESSAGE);
    }

    const allowed =
      ALLOWED_MIME_TYPES.has(file.mimetype) ||
      ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));

    if (!allowed) {
      throw new UnsupportedMediaTypeException(
        'Allowed types: PDF, images, Word documents',
      );
    }
  }

  private async removeFromCloudinary(
    attachment: AttachmentEntity,
  ): Promise<void> {
    if (
      !attachment.cloudinaryPublicId ||
      !this.cloudinaryService.isConfigured()
    ) {
      return;
    }

    try {
      await this.cloudinaryService.deleteByPublicId(
        attachment.cloudinaryPublicId,
      );
    } catch (error) {
      this.logger.warn(
        domainLog({
          action: 'attachments.delete.cloudinary_failed',
          attachmentId: attachment.id,
          module: 'attachments',
          reason: error instanceof Error ? error.message : 'unknown',
        }),
      );
    }
  }

  private async findEntryInSchool(
    entryId: string,
    schoolId: string,
  ): Promise<EntryEntity> {
    const entry = await this.entriesRepository.findOne({
      where: { id: entryId, schoolId },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    return entry;
  }

  private async findCalendarEventInSchool(
    calendarEventId: string,
    schoolId: string,
  ): Promise<CalendarEventEntity> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id: calendarEventId, schoolId },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }

  private async assertCanModifyEntry(
    entry: EntryEntity,
    userId: string,
  ): Promise<void> {
    const context = await this.userScopeService.loadContext(userId);

    if (!canModifyEntry(entry, context, userId)) {
      throw new ForbiddenException();
    }
  }

  private async assertCanModifyCalendarEvent(
    event: CalendarEventEntity,
    userId: string,
  ): Promise<void> {
    const context = await this.userScopeService.loadContext(userId);

    if (!canModifyCalendarEvent(event, context, userId)) {
      throw new ForbiddenException();
    }
  }

  private assertPublicIdInSchoolScope(
    publicId: string,
    schoolId: string,
  ): void {
    const rootFolder = this.cloudinaryService.getRootFolder();

    if (!isDocumentPublicIdInSchoolScope(publicId, rootFolder, schoolId)) {
      throw new ForbiddenException();
    }
  }
}
