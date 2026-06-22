import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../../schools/entities/section.entity';
import { SedeEntity } from '../../schools/entities/sede.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { NotFoundException } from '../exception/not-found.exception';
import { resolvePrimaryRole } from './access.utils';
import type { ScopedUserContext } from './scoped-user-context.interface';

@Injectable()
export class UserScopeService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SectionEntity)
    private readonly sectionsRepository: Repository<SectionEntity>,
  ) {}

  async loadContext(userId: string): Promise<ScopedUserContext> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: {
        userRoles: { role: true },
        userSections: { section: true },
        student: { section: true },
        parentStudents: { student: { section: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const roles = user.userRoles?.map((ur) => ur.role.code) ?? [];
    const primaryRole = resolvePrimaryRole(roles);

    let sectionIds: string[] = [];
    let sectionNames: string[] = [];

    if (primaryRole === 'direccion') {
      const sections = await this.sectionsRepository
        .createQueryBuilder('section')
        .innerJoin(SedeEntity, 'sede', 'sede.id = section.sede_id')
        .where('sede.school_id = :schoolId', { schoolId: user.schoolId })
        .getMany();
      sectionIds = sections.map((s) => s.id);
      sectionNames = sections.map((s) => s.name);
    } else if (primaryRole === 'auxiliar' || primaryRole === 'profesor') {
      sectionIds = user.userSections?.map((us) => us.sectionId) ?? [];
      sectionNames = user.userSections?.map((us) => us.section.name) ?? [];
    } else if (primaryRole === 'alumno' && user.student) {
      sectionIds = [user.student.sectionId];
      sectionNames = [user.student.section.name];
    } else if (primaryRole === 'padre') {
      const childSections =
        user.parentStudents?.map((ps) => ps.student.section) ?? [];
      sectionIds = [...new Set(childSections.map((s) => s.id))];
      sectionNames = [...new Set(childSections.map((s) => s.name))];
    }

    const studentIds = user.student != null ? [user.student.id] : [];
    const childStudentIds =
      user.parentStudents?.map((ps) => ps.student.id) ?? [];

    return {
      user,
      primaryRole,
      roles,
      sectionIds,
      sectionNames,
      studentIds,
      childStudentIds,
    };
  }
}
