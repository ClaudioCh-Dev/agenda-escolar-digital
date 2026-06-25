import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { SectionScopeService } from '../shared/access/section-scope.service';
import { canModifyCalendarEvent } from '../shared/access/entry-modify.util';
import { UserScopeService } from '../shared/access/user-scope.service';
import { ForbiddenException } from '../shared/exception/forbidden.exception';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { domainLog } from '../shared/logging';
import { toCalendarEventResponse } from './calendar.mapper';
import {
  CreateCalendarEventDto,
  ListCalendarEventsQueryDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';
import { CalendarEventResponseDto } from './dto/calendar-event-response.dto';
import { CalendarEventEntity } from './entities/calendar-event.entity';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly calendarEventsRepository: Repository<CalendarEventEntity>,
    private readonly userScopeService: UserScopeService,
    private readonly sectionScopeService: SectionScopeService,
    private readonly notificationsService: NotificationsService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async list(
    auth: AuthenticatedUser,
    query: ListCalendarEventsQueryDto,
  ): Promise<CalendarEventResponseDto[]> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const qb = this.calendarEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.entry', 'entry')
      .leftJoinAndSelect('event.attachments', 'attachments')
      .where('event.school_id = :schoolId', { schoolId: auth.schoolId });

    if (query.from && query.to) {
      qb.andWhere('event.event_date BETWEEN :from AND :to', {
        from: query.from,
        to: query.to,
      });
    }

    if (query.section) {
      const sectionId = await this.sectionScopeService.resolveSectionId(
        auth.schoolId,
        query.section,
      );
      qb.andWhere(
        '(event.section_id = :sectionId OR event.section_id IS NULL)',
        {
          sectionId,
        },
      );
    } else if (context.primaryRole !== 'direccion') {
      if (!context.sectionIds.length) {
        qb.andWhere('event.section_id IS NULL');
      } else {
        qb.andWhere(
          '(event.section_id IN (:...sectionIds) OR event.section_id IS NULL)',
          { sectionIds: context.sectionIds },
        );
      }
    }

    qb.orderBy('event.event_date', 'ASC');

    const events = await qb.getMany();
    return events.map(toCalendarEventResponse);
  }

  async getById(
    auth: AuthenticatedUser,
    id: string,
  ): Promise<CalendarEventResponseDto> {
    const event = await this.findEventOrThrow(id, auth.schoolId);
    await this.assertCanView(auth, event);
    return toCalendarEventResponse(event);
  }

  async create(
    auth: AuthenticatedUser,
    dto: CreateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    const context = await this.userScopeService.loadContext(auth.userId);
    let sectionId: string | null = null;

    if (dto.section) {
      sectionId = await this.sectionScopeService.resolveSectionId(
        auth.schoolId,
        dto.section,
      );
      this.sectionScopeService.assertSectionInScope(context, sectionId);
    }

    const event = await this.calendarEventsRepository.save(
      this.calendarEventsRepository.create({
        schoolId: auth.schoolId,
        sectionId,
        authorId: auth.userId,
        title: dto.title,
        description: dto.description ?? null,
        eventDate: dto.date,
        eventTime: dto.time
          ? dto.time.length === 5
            ? `${dto.time}:00`
            : dto.time
          : null,
        type: dto.type,
        entryId: null,
      }),
    );

    if (dto.attachments?.length) {
      await this.attachmentsService.syncForCalendarEvent(
        event.id,
        dto.attachments,
      );
    }

    const saved = await this.findEventOrThrow(event.id, auth.schoolId);

    if (dto.sendNotification) {
      await this.notificationsService.createForCalendarEvent(saved);
    }

    this.logger.log(
      domainLog({
        action: 'calendar.create',
        userId: auth.userId,
        eventId: event.id,
        module: 'calendar',
      }),
    );

    return toCalendarEventResponse(saved);
  }

  async update(
    auth: AuthenticatedUser,
    id: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEventResponseDto> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const event = await this.findEventOrThrow(id, auth.schoolId);
    this.assertCanModify(context, event, auth.userId);

    if (dto.section !== undefined) {
      if (dto.section) {
        const sectionId = await this.sectionScopeService.resolveSectionId(
          auth.schoolId,
          dto.section,
        );
        this.sectionScopeService.assertSectionInScope(context, sectionId);
        event.sectionId = sectionId;
      } else {
        event.sectionId = null;
      }
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined)
      event.description = dto.description ?? null;
    if (dto.date !== undefined) event.eventDate = dto.date;
    if (dto.time !== undefined) {
      event.eventTime = dto.time.length === 5 ? `${dto.time}:00` : dto.time;
    }
    if (dto.type !== undefined) event.type = dto.type;

    await this.calendarEventsRepository.save(event);

    if (dto.attachments !== undefined) {
      await this.attachmentsService.replaceForCalendarEvent(
        event.id,
        dto.attachments,
      );
    }

    const saved = await this.findEventOrThrow(event.id, auth.schoolId);

    if (dto.sendNotification) {
      await this.notificationsService.createForCalendarEvent(saved);
    }

    this.logger.log(
      domainLog({
        action: 'calendar.update',
        userId: auth.userId,
        eventId: event.id,
        module: 'calendar',
      }),
    );

    return toCalendarEventResponse(saved);
  }

  async remove(auth: AuthenticatedUser, id: string): Promise<void> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const event = await this.findEventOrThrow(id, auth.schoolId);
    this.assertCanModify(context, event, auth.userId);

    await this.calendarEventsRepository.delete(id);

    this.logger.log(
      domainLog({
        action: 'calendar.delete',
        userId: auth.userId,
        eventId: id,
        module: 'calendar',
      }),
    );
  }

  private async assertCanView(
    auth: AuthenticatedUser,
    event: CalendarEventEntity,
  ): Promise<void> {
    const context = await this.userScopeService.loadContext(auth.userId);

    if (context.primaryRole === 'direccion') {
      return;
    }

    if (event.sectionId === null) {
      return;
    }

    if (!context.sectionIds.includes(event.sectionId)) {
      throw new NotFoundException('Calendar event not found');
    }
  }

  private assertCanModify(
    context: Awaited<ReturnType<UserScopeService['loadContext']>>,
    event: CalendarEventEntity,
    userId: string,
  ): void {
    if (!canModifyCalendarEvent(event, context, userId)) {
      throw new ForbiddenException();
    }
  }

  private async findEventOrThrow(
    id: string,
    schoolId: string,
  ): Promise<CalendarEventEntity> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id, schoolId },
      relations: { entry: true, attachments: true },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }
}
