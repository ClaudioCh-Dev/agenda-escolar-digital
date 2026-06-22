import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import { EntryEntity } from '../entries/entities/entry.entity';
import { ParentStudentEntity } from '../users/entities/parent-student.entity';
import { StudentEntity } from '../users/entities/student.entity';
import { UserEntity } from '../users/entities/user.entity';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { domainLog } from '../shared/logging';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import {
  buildCalendarNotificationCopy,
  buildEntryNotificationCopy,
  toNotificationResponse,
} from './notification.mapper';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
    @InjectRepository(ParentStudentEntity)
    private readonly parentStudentsRepository: Repository<ParentStudentEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async list(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsRepository.find({
      where: { userId },
      relations: { entry: true },
      order: { createdAt: 'DESC' },
    });

    return notifications.map(toNotificationResponse);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async createForEntry(entry: EntryEntity): Promise<void> {
    const recipientIds = await this.resolveEntryRecipientUserIds(entry);
    const copy = buildEntryNotificationCopy(entry);

    await this.insertNotifications(
      recipientIds,
      copy.title,
      copy.body,
      entry.id,
      null,
    );
  }

  async createForCalendarEvent(event: CalendarEventEntity): Promise<void> {
    const recipientIds = await this.resolveCalendarRecipientUserIds(event);
    const copy = buildCalendarNotificationCopy(event);

    await this.insertNotifications(
      recipientIds,
      copy.title,
      copy.body,
      null,
      event.id,
    );
  }

  private async insertNotifications(
    userIds: string[],
    title: string,
    body: string,
    entryId: string | null,
    calendarEventId: string | null,
  ): Promise<void> {
    const uniqueIds = [...new Set(userIds)];

    if (!uniqueIds.length) {
      return;
    }

    await this.notificationsRepository.save(
      uniqueIds.map((userId) =>
        this.notificationsRepository.create({
          userId,
          title,
          body,
          category: 'info',
          entryId,
          calendarEventId,
        }),
      ),
    );

    this.logger.log(
      domainLog({
        action: 'notifications.create',
        count: uniqueIds.length,
        module: 'notifications',
      }),
    );
  }

  private async resolveEntryRecipientUserIds(
    entry: EntryEntity,
  ): Promise<string[]> {
    const studentIds =
      entry.entryStudents?.map((es) => es.studentId) ??
      (
        await this.studentsRepository.find({
          where: { sectionId: entry.sectionId, schoolId: entry.schoolId },
          select: { id: true },
        })
      ).map((s) => s.id);

    const userIds = new Set<string>();

    if (!entry.parentsOnly) {
      const students = await this.studentsRepository.find({
        where: { id: In(studentIds) },
        relations: { user: true },
      });
      for (const student of students) {
        userIds.add(student.userId);
      }
    }

    const parentLinks = await this.parentStudentsRepository.find({
      where: { studentId: In(studentIds) },
    });

    for (const link of parentLinks) {
      userIds.add(link.parentId);
    }

    return [...userIds];
  }

  private async resolveCalendarRecipientUserIds(
    event: CalendarEventEntity,
  ): Promise<string[]> {
    if (!event.sectionId) {
      const users = await this.usersRepository.find({
        where: { schoolId: event.schoolId, isActive: true },
        select: { id: true },
      });
      return users.map((u) => u.id);
    }

    const students = await this.studentsRepository.find({
      where: { sectionId: event.sectionId, schoolId: event.schoolId },
      relations: { user: true },
    });

    const userIds = new Set<string>();
    for (const student of students) {
      userIds.add(student.userId);
    }

    const parentLinks = await this.parentStudentsRepository.find({
      where: { studentId: In(students.map((s) => s.id)) },
    });

    for (const link of parentLinks) {
      userIds.add(link.parentId);
    }

    const staff = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.userSections', 'userSection')
      .where('userSection.section_id = :sectionId', {
        sectionId: event.sectionId,
      })
      .andWhere('user.is_active = true')
      .getMany();

    for (const user of staff) {
      userIds.add(user.id);
    }

    return [...userIds];
  }
}
