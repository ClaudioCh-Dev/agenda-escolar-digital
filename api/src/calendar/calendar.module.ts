import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { AccessModule } from '../shared/access/access.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarEventEntity } from './entities/calendar-event.entity';

@Module({
  imports: [
    AccessModule,
    AttachmentsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([CalendarEventEntity]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService, TypeOrmModule],
})
export class CalendarModule {}
