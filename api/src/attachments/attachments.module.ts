import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EntryEntity } from '../entries/entities/entry.entity';
import { AccessModule } from '../shared/access/access.module';
import {
  AttachmentsController,
  CalendarAttachmentsController,
  EntryAttachmentsController,
} from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { AttachmentEntity } from './entities/attachment.entity';

@Module({
  imports: [
    AccessModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([
      AttachmentEntity,
      EntryEntity,
      CalendarEventEntity,
    ]),
  ],
  controllers: [
    AttachmentsController,
    EntryAttachmentsController,
    CalendarAttachmentsController,
  ],
  providers: [AttachmentsService],
  exports: [AttachmentsService, TypeOrmModule],
})
export class AttachmentsModule {}
