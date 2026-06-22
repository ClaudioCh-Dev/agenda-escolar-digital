import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { UserScopeService } from '../shared/access/user-scope.service';
import { SectionResponseDto } from './dto/section-response.dto';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Get()
  @RequirePermission('sections.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<SectionResponseDto[]>> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const sections = await this.sectionsService.listBySchool(
      auth.schoolId,
      context,
    );
    return new ApiSuccess(sections);
  }
}
