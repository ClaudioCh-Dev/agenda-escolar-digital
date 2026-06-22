import { Controller, Get, Param, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { UserScopeService } from '../shared/access/user-scope.service';
import { ChildResponseDto } from './dto/child-response.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Get()
  @RequirePermission('students.read')
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
