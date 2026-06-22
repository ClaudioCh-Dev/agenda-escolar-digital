import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AccessModule } from '../shared/access/access.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { EntryReadEntity } from './entities/entry-read.entity';
import { EntryStudentEntity } from './entities/entry-student.entity';
import { EntryEntity } from './entities/entry.entity';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';

@Module({
  imports: [
    AccessModule,
    AttachmentsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      EntryEntity,
      EntryStudentEntity,
      EntryReadEntity,
      CalendarEventEntity,
    ]),
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService, TypeOrmModule],
})
export class EntriesModule {}
