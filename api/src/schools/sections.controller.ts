import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { ApiEnvelopeOk, ApiProtectedErrors } from '../shared/swagger';
import { SECTION_EXAMPLE } from '../shared/swagger/examples';
import { UserScopeService } from '../shared/access/user-scope.service';
import { SectionResponseDto } from './dto/section-response.dto';
import { SectionsService } from './sections.service';

@ApiTags('Sections')
@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Get()
  @RequirePermission('sections.read')
  @ApiOperation({
    summary: 'Listar secciones',
    description: 'Permiso: sections.read. Alcance según rol (auxiliar ve sus secciones)',
  })
  @ApiEnvelopeOk(SectionResponseDto, {
    isArray: true,
    example: [SECTION_EXAMPLE],
  })
  @ApiProtectedErrors()
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
