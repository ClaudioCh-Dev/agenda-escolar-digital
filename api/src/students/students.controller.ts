import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import {
  ApiEnvelopeOk,
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import { CHILD_EXAMPLE } from '../shared/swagger/examples';
import { UserScopeService } from '../shared/access/user-scope.service';
import { ChildResponseDto } from './dto/child-response.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Get()
  @RequirePermission('students.read')
  @ApiOperation({ summary: 'Listar alumnos', description: 'Permiso: students.read. Filtro opcional: section' })
  @ApiEnvelopeOk(ChildResponseDto, {
    isArray: true,
    example: [CHILD_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListStudentsQueryDto,
  ): Promise<ApiSuccess<ChildResponseDto[]>> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const students = await this.studentsService.listBySection(
      auth.schoolId,
      context,
      query.section,
    );
    return new ApiSuccess(students);
  }

  @Get(':id')
  @RequirePermission('students.read')
  @ApiParam({ name: 'id', example: 'dddddddd-dddd-dddd-dddd-dddddddddddd' })
  @ApiOperation({ summary: 'Detalle de alumno' })
  @ApiEnvelopeOk(ChildResponseDto, { example: CHILD_EXAMPLE })
  @ApiNotFoundError('Alumno no encontrado')
  @ApiProtectedErrors()
  async getById(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<ChildResponseDto>> {
    const context = await this.userScopeService.loadContext(auth.userId);
    const student = await this.studentsService.getById(
      auth.schoolId,
      context,
      id,
    );
    return new ApiSuccess(student);
  }
}
