import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { ApiEnvelopeOk, ApiProtectedErrors } from '../shared/swagger';
import { PARENT_EXAMPLE } from '../shared/swagger/examples';
import { UserScopeService } from '../shared/access/user-scope.service';
import { ListParentsQueryDto } from './dto/list-students-query.dto';
import { ParentResponseDto } from './dto/parent-response.dto';
import { StudentsService } from './students.service';

@ApiTags('Parents')
@ApiBearerAuth()
@Controller('parents')
export class ParentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Get()
  @RequirePermission('students.read')
  @ApiOperation({
    summary: 'Listar padres',
    description:
      'Permiso: students.read. Filtros opcionales: section, studentId',
  })
  @ApiEnvelopeOk(ParentResponseDto, {
    isArray: true,
    example: [PARENT_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListParentsQueryDto,
  ): Promise<ApiSuccess<ParentResponseDto[]>> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const parents = await this.studentsService.listParents(
      auth.schoolId,
      context,
      query.section,
      query.studentId,
    );
    return new ApiSuccess(parents);
  }
}
