import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { ChatModule } from './chat/chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { DatabaseModule } from './database/database.module';
import { EntriesModule } from './entries/entries.module';
import { IamModule } from './iam/iam.module';
import { PermissionsGuard } from './iam/guards/permissions.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { SchoolsModule } from './schools/schools.module';
import { StudentsModule } from './students/students.module';
import { GlobalExceptionFilter } from './shared';
import { AccessModule } from './shared/access/access.module';
import { LoggingModule } from './shared/logging';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DatabaseModule,
    LoggingModule,
    AccessModule,
    SchoolsModule,
    IamModule,
    UsersModule,
    AuthModule,
    StudentsModule,
    EntriesModule,
    CalendarModule,
    AttachmentsModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
