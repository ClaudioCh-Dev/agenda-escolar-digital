import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../../schools/entities/section.entity';
import { SedeEntity } from '../../schools/entities/sede.entity';
import { NotFoundException } from '../exception/not-found.exception';
import type { ScopedUserContext } from './scoped-user-context.interface';

@Injectable()
export class SectionScopeService {
  constructor(
    @InjectRepository(SectionEntity)
    private readonly sectionsRepository: Repository<SectionEntity>,
  ) {}

  async resolveSectionId(
    schoolId: string,
    sectionName: string,
  ): Promise<string> {
    const section = await this.sectionsRepository
      .createQueryBuilder('section')
      .innerJoin(SedeEntity, 'sede', 'sede.id = section.sede_id')
      .where('sede.school_id = :schoolId', { schoolId })
      .andWhere('section.name = :name', { name: sectionName })
      .getOne();

    if (!section) {
      throw new NotFoundException(`Section "${sectionName}" not found`);
    }

    return section.id;
  }

  async listAccessibleSections(
    schoolId: string,
    context: ScopedUserContext,
  ): Promise<SectionEntity[]> {
    const qb = this.sectionsRepository
      .createQueryBuilder('section')
      .innerJoinAndSelect('section.sede', 'sede')
      .where('sede.school_id = :schoolId', { schoolId });

    if (context.primaryRole !== 'direccion') {
      if (!context.sectionIds.length) {
        return [];
      }
      qb.andWhere('section.id IN (:...sectionIds)', {
        sectionIds: context.sectionIds,
      });
    }

    return qb.orderBy('section.name', 'ASC').getMany();
  }

  assertSectionInScope(context: ScopedUserContext, sectionId: string): void {
    if (context.primaryRole === 'direccion') {
      return;
    }

    if (!context.sectionIds.includes(sectionId)) {
      throw new NotFoundException('Section not in scope');
    }
  }
}
