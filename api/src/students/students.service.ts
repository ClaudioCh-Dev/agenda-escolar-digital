import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ParentStudentEntity } from '../users/entities/parent-student.entity';
import { StudentEntity } from '../users/entities/student.entity';
import { UserEntity } from '../users/entities/user.entity';
import {
  buildInitials,
  resolvePrimaryRole,
} from '../shared/access/access.utils';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { SectionScopeService } from '../shared/access/section-scope.service';
import type { ScopedUserContext } from '../shared/access/scoped-user-context.interface';
import { ChildResponseDto } from './dto/child-response.dto';
import { ParentResponseDto } from './dto/parent-response.dto';

const DEFAULT_CHILD_COLOR = '#6366F1';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ParentStudentEntity)
    private readonly parentStudentsRepository: Repository<ParentStudentEntity>,
    private readonly sectionScopeService: SectionScopeService,
  ) {}

  async listBySection(
    schoolId: string,
    context: ScopedUserContext,
    sectionName?: string,
  ): Promise<ChildResponseDto[]> {
    let sectionIds = context.sectionIds;

    if (sectionName) {
      const sectionId = await this.sectionScopeService.resolveSectionId(
        schoolId,
        sectionName,
      );
      this.sectionScopeService.assertSectionInScope(context, sectionId);
      sectionIds = [sectionId];
    }

    if (!sectionIds.length) {
      return [];
    }

    const students = await this.studentsRepository.find({
      where: { sectionId: In(sectionIds), schoolId },
      relations: { user: true, section: true },
      order: { user: { name: 'ASC' } },
    });

    return students.map((student) => this.toChildDto(student));
  }

  async getById(
    schoolId: string,
    context: ScopedUserContext,
    studentId: string,
  ): Promise<ChildResponseDto> {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId, schoolId },
      relations: { user: true, section: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    this.sectionScopeService.assertSectionInScope(context, student.sectionId);

    return this.toChildDto(student);
  }

  async listParents(
    schoolId: string,
    context: ScopedUserContext,
    sectionName?: string,
    studentId?: string,
  ): Promise<ParentResponseDto[]> {
    if (studentId) {
      const student = await this.getById(schoolId, context, studentId);
      return this.listParentsForStudent(schoolId, student.id);
    }

    if (!sectionName) {
      return [];
    }

    const sectionId = await this.sectionScopeService.resolveSectionId(
      schoolId,
      sectionName,
    );
    this.sectionScopeService.assertSectionInScope(context, sectionId);

    const links = await this.parentStudentsRepository
      .createQueryBuilder('ps')
      .innerJoinAndSelect('ps.parent', 'parent')
      .innerJoinAndSelect('ps.student', 'student')
      .innerJoinAndSelect('student.section', 'section')
      .where('student.section_id = :sectionId', { sectionId })
      .andWhere('student.school_id = :schoolId', { schoolId })
      .getMany();

    const uniqueParents = new Map<string, ParentResponseDto>();
    for (const link of links) {
      const child = this.toChildSummary(link.student);
      const existing = uniqueParents.get(link.parentId);
      if (existing) {
        const children = existing.children ?? [];
        if (!children.some((c) => c.id === child.id)) {
          existing.children = [...children, child];
        }
      } else {
        uniqueParents.set(link.parentId, {
          ...this.toParentDto(link.parent),
          children: [child],
        });
      }
    }

    return Array.from(uniqueParents.values());
  }

  private async listParentsForStudent(
    schoolId: string,
    studentId: string,
  ): Promise<ParentResponseDto[]> {
    const links = await this.parentStudentsRepository.find({
      where: { studentId },
      relations: {
        parent: { userRoles: { role: true }, userSections: { section: true } },
        student: { user: true, section: true },
      },
    });

    return links
      .filter((link) => link.parent.schoolId === schoolId)
      .map((link) => ({
        ...this.toParentDto(link.parent),
        children: [this.toChildSummary(link.student)],
      }));
  }

  private toChildDto(student: StudentEntity): ChildResponseDto {
    return {
      id: student.id,
      name: student.user.name,
      section: student.section.name,
      grade: student.section.grade ?? '',
      initials: buildInitials(student.user.name),
      color: DEFAULT_CHILD_COLOR,
      avatar: student.user.avatarUrl ?? undefined,
    };
  }

  private toChildSummary(student: StudentEntity) {
    return {
      id: student.id,
      name: student.user.name,
      section: student.section.name,
      grade: student.section.grade ?? '',
      initials: buildInitials(student.user.name),
      avatar: student.user.avatarUrl ?? undefined,
    };
  }

  private toParentDto(user: UserEntity): ParentResponseDto {
    const roles = user.userRoles?.map((ur) => ur.role.code) ?? [];
    return {
      id: user.id,
      name: user.name,
      code: user.code,
      role: resolvePrimaryRole(roles),
      initials: buildInitials(user.name),
      avatar: user.avatarUrl ?? undefined,
      sections: user.userSections?.map((us) => us.section.name),
    };
  }
}
