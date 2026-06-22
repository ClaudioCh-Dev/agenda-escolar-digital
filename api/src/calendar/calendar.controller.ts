import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { CalendarService } from './calendar.service';
import {
  CreateCalendarEventDto,
  ListCalendarEventsQueryDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';
import { CalendarEventResponseDto } from './dto/calendar-event-response.dto';

@Controller('calendar/events')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @RequirePermission('calendar.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListCalendarEventsQueryDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto[]>> {
    return new ApiSuccess(await this.calendarService.list(auth, query));
  }

  @Get(':id')
  @RequirePermission('calendar.read')
  async getById(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.getById(auth, id));
  }

  @Post()
  @RequirePermission('calendar.create')
  async create(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CreateCalendarEventDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.create(auth, dto));
  }

  @Patch(':id')
  @RequirePermission('calendar.update')
  async update(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.update(auth, id, dto));
  }

  @Delete(':id')
  @RequirePermission('calendar.delete')
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.calendarService.remove(auth, id);
    return new ApiSuccess(null);
  }
}
