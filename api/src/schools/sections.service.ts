import { Injectable } from '@nestjs/common';
import { SectionScopeService } from '../shared/access/section-scope.service';
import type { ScopedUserContext } from '../shared/access/scoped-user-context.interface';
import { SectionResponseDto } from './dto/section-response.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly sectionScopeService: SectionScopeService) {}

  async listBySchool(
    schoolId: string,
    context: ScopedUserContext,
  ): Promise<SectionResponseDto[]> {
    const sections = await this.sectionScopeService.listAccessibleSections(
      schoolId,
      context,
    );

    return sections.map((section) => ({
      id: section.id,
      name: section.name,
      grade: section.grade ?? undefined,
    }));
  }
}
