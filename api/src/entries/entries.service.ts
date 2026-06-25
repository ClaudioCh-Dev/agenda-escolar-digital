import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEventEntity } from '../calendar/entities/calendar-event.entity';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CALENDAR_LINKED_ENTRY_TYPES } from '../shared/access/access.utils';
import { EntryVisibilityService } from '../shared/access/entry-visibility.service';
import { SectionScopeService } from '../shared/access/section-scope.service';
import type { ScopedUserContext } from '../shared/access/scoped-user-context.interface';
import { canModifyEntry } from '../shared/access/entry-modify.util';
import { UserScopeService } from '../shared/access/user-scope.service';
import type { CalendarEventType } from '../shared/database/enums';
import { ForbiddenException } from '../shared/exception/forbidden.exception';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { domainLog } from '../shared/logging';
import { EntryReadEntity } from './entities/entry-read.entity';
import { EntryStudentEntity } from './entities/entry-student.entity';
import { EntryEntity } from './entities/entry.entity';
import {
  CreateEntryDto,
  ListEntriesQueryDto,
  UpdateEntryDto,
} from './dto/entry.dto';
import { EntryResponseDto } from './dto/entry-response.dto';
import { toEntryResponse } from './entry.mapper';

const ENTRY_RELATIONS = {
  section: true,
  author: { userRoles: { role: true } },
  entryStudents: true,
  entryReads: true,
  attachments: true,
} as const;

@Injectable()
export class EntriesService {
  private readonly logger = new Logger(EntriesService.name);

  constructor(
    @InjectRepository(EntryEntity)
    private readonly entriesRepository: Repository<EntryEntity>,
    @InjectRepository(EntryStudentEntity)
    private readonly entryStudentsRepository: Repository<EntryStudentEntity>,
    @InjectRepository(EntryReadEntity)
    private readonly entryReadsRepository: Repository<EntryReadEntity>,
    @InjectRepository(CalendarEventEntity)
    private readonly calendarEventsRepository: Repository<CalendarEventEntity>,
    private readonly userScopeService: UserScopeService,
    private readonly sectionScopeService: SectionScopeService,
    private readonly entryVisibilityService: EntryVisibilityService,
    private readonly notificationsService: NotificationsService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async list(
    auth: AuthenticatedUser,
    query: ListEntriesQueryDto,
  ): Promise<EntryResponseDto[]> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const qb = this.entriesRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.section', 'section')
      .leftJoinAndSelect('entry.author', 'author')
      .leftJoinAndSelect('author.userRoles', 'authorRoles')
      .leftJoinAndSelect('authorRoles.role', 'authorRole')
      .leftJoinAndSelect('entry.entryStudents', 'entryStudents')
      .leftJoinAndSelect('entry.entryReads', 'entryReads')
      .leftJoinAndSelect('entry.attachments', 'attachments')
      .where('entry.school_id = :schoolId', { schoolId: auth.schoolId });

    if (query.date) {
      qb.andWhere('entry.entry_date = :date', { date: query.date });
    } else if (query.from && query.to) {
      qb.andWhere('entry.entry_date BETWEEN :from AND :to', {
        from: query.from,
        to: query.to,
      });
    }

    if (query.section) {
      const sectionId = await this.sectionScopeService.resolveSectionId(
        auth.schoolId,
        query.section,
      );
      qb.andWhere('entry.section_id = :sectionId', { sectionId });
    } else if (
      context.primaryRole !== 'direccion' &&
      context.sectionIds.length
    ) {
      qb.andWhere('entry.section_id IN (:...sectionIds)', {
        sectionIds: context.sectionIds,
      });
    }

    qb.orderBy('entry.entry_date', 'DESC').addOrderBy(
      'entry.entry_time',
      'DESC',
    );

    const entries = await qb.getMany();
    const visibilityOptions = {
      selectedSection: query.section,
      selectedChildId: query.childId,
    };
    const visible = this.entryVisibilityService.filterVisible(
      entries,
      context,
      visibilityOptions,
    );

    return visible.map(toEntryResponse);
  }

  async getById(
    auth: AuthenticatedUser,
    id: string,
  ): Promise<EntryResponseDto> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const entry = await this.findEntryOrThrow(id, auth.schoolId);

    if (!this.entryVisibilityService.isVisible(entry, context)) {
      throw new NotFoundException('Entry not found');
    }

    return toEntryResponse(entry);
  }

  async create(
    auth: AuthenticatedUser,
    dto: CreateEntryDto,
  ): Promise<EntryResponseDto> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const sectionId = await this.sectionScopeService.resolveSectionId(
      auth.schoolId,
      dto.section,
    );
    this.sectionScopeService.assertSectionInScope(context, sectionId);

    const requiresAck =
      dto.requiresAck ??
      (dto.type === 'comunicado' || dto.type === 'nota_personal');

    const entry = await this.entriesRepository.save(
      this.entriesRepository.create({
        schoolId: auth.schoolId,
        sectionId,
        authorId: auth.userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        entryDate: dto.date,
        entryTime: dto.time.length === 5 ? `${dto.time}:00` : dto.time,
        isImportant: dto.isImportant,
        parentsOnly: dto.parentsOnly ?? false,
        requiresAck,
      }),
    );

    if (dto.studentIds?.length) {
      await this.entryStudentsRepository.save(
        dto.studentIds.map((studentId) =>
          this.entryStudentsRepository.create({ entryId: entry.id, studentId }),
        ),
      );
    }

    if (CALENDAR_LINKED_ENTRY_TYPES.has(dto.type)) {
      const calendarEvent = await this.calendarEventsRepository.save(
        this.calendarEventsRepository.create({
          schoolId: auth.schoolId,
          sectionId,
          authorId: auth.userId,
          title: dto.title,
          description: dto.description,
          eventDate: dto.date,
          eventTime: dto.time.length === 5 ? `${dto.time}:00` : dto.time,
          type: dto.type as CalendarEventType,
          entryId: entry.id,
        }),
      );

      await this.attachmentsService.syncForEntry(
        entry.id,
        calendarEvent.id,
        dto.attachments,
      );
    } else {
      await this.attachmentsService.syncForEntry(
        entry.id,
        null,
        dto.attachments,
      );
    }

    const saved = await this.findEntryOrThrow(entry.id, auth.schoolId);

    if (dto.sendNotification) {
      await this.notificationsService.createForEntry(saved);
    }

    this.logger.log(
      domainLog({
        action: 'entries.create',
        userId: auth.userId,
        entryId: entry.id,
        module: 'entries',
      }),
    );

    return toEntryResponse(saved);
  }

  async update(
    auth: AuthenticatedUser,
    id: string,
    dto: UpdateEntryDto,
  ): Promise<EntryResponseDto> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const entry = await this.findEntryOrThrow(id, auth.schoolId);

    if (!this.canModify(entry, context, auth.userId)) {
      throw new ForbiddenException();
    }

    if (dto.section) {
      const sectionId = await this.sectionScopeService.resolveSectionId(
        auth.schoolId,
        dto.section,
      );
      this.sectionScopeService.assertSectionInScope(context, sectionId);
      entry.sectionId = sectionId;
    }

    if (dto.type !== undefined) entry.type = dto.type;
    if (dto.title !== undefined) entry.title = dto.title;
    if (dto.description !== undefined) entry.description = dto.description;
    if (dto.date !== undefined) entry.entryDate = dto.date;
    if (dto.time !== undefined) {
      entry.entryTime = dto.time.length === 5 ? `${dto.time}:00` : dto.time;
    }
    if (dto.isImportant !== undefined) entry.isImportant = dto.isImportant;
    if (dto.parentsOnly !== undefined) entry.parentsOnly = dto.parentsOnly;
    if (dto.requiresAck !== undefined) entry.requiresAck = dto.requiresAck;

    await this.entriesRepository.save(entry);

    if (dto.studentIds !== undefined) {
      await this.entryStudentsRepository.delete({ entryId: entry.id });
      if (dto.studentIds.length) {
        await this.entryStudentsRepository.save(
          dto.studentIds.map((studentId) =>
            this.entryStudentsRepository.create({
              entryId: entry.id,
              studentId,
            }),
          ),
        );
      }
    }

    const calendarEvent = await this.calendarEventsRepository.findOne({
      where: { entryId: entry.id },
    });

    if (dto.attachments !== undefined) {
      await this.attachmentsService.replaceForEntry(
        entry.id,
        calendarEvent?.id ?? null,
        dto.attachments,
      );
    }

    const saved = await this.findEntryOrThrow(entry.id, auth.schoolId);

    if (dto.sendNotification) {
      await this.notificationsService.createForEntry(saved);
    }

    this.logger.log(
      domainLog({
        action: 'entries.update',
        userId: auth.userId,
        entryId: entry.id,
        module: 'entries',
      }),
    );

    return toEntryResponse(saved);
  }

  async remove(auth: AuthenticatedUser, id: string): Promise<void> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const entry = await this.findEntryOrThrow(id, auth.schoolId);

    if (!this.canModify(entry, context, auth.userId)) {
      throw new ForbiddenException();
    }

    await this.entriesRepository.delete(id);

    this.logger.log(
      domainLog({
        action: 'entries.delete',
        userId: auth.userId,
        entryId: id,
        module: 'entries',
      }),
    );
  }

  async acknowledgeRead(auth: AuthenticatedUser, id: string): Promise<void> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const entry = await this.findEntryOrThrow(id, auth.schoolId);

    if (!this.entryVisibilityService.isVisible(entry, context)) {
      throw new NotFoundException('Entry not found');
    }

    const existing = await this.entryReadsRepository.findOne({
      where: { entryId: id, userId: auth.userId },
    });

    if (!existing) {
      await this.entryReadsRepository.save(
        this.entryReadsRepository.create({
          entryId: id,
          userId: auth.userId,
        }),
      );
    }

    this.logger.log(
      domainLog({
        action: 'entries.ack',
        userId: auth.userId,
        entryId: id,
        module: 'entries',
      }),
    );
  }

  private canModify(
    entry: EntryEntity,
    context: ScopedUserContext,
    userId: string,
  ): boolean {
    return canModifyEntry(entry, context, userId);
  }

  private async findEntryOrThrow(
    id: string,
    schoolId: string,
  ): Promise<EntryEntity> {
    const entry = await this.entriesRepository.findOne({
      where: { id, schoolId },
      relations: ENTRY_RELATIONS,
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    return entry;
  }
}
