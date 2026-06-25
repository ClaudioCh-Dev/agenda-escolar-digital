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
  ApiEnvelopeCreated,
  ApiEnvelopeNullOk,
  ApiEnvelopeOk,
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import { CALENDAR_EVENT_EXAMPLE } from '../shared/swagger/examples';
import { CalendarService } from './calendar.service';
import {
  CreateCalendarEventDto,
  ListCalendarEventsQueryDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';
import { CalendarEventResponseDto } from './dto/calendar-event-response.dto';

@ApiTags('Calendar')
@ApiBearerAuth()
@Controller('calendar/events')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @RequirePermission('calendar.read')
  @ApiOperation({ summary: 'Listar eventos', description: 'Permiso: calendar.read. Filtros: from, to, section' })
  @ApiEnvelopeOk(CalendarEventResponseDto, {
    isArray: true,
    example: [CALENDAR_EVENT_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListCalendarEventsQueryDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto[]>> {
    return new ApiSuccess(await this.calendarService.list(auth, query));
  }

  @Get(':id')
  @RequirePermission('calendar.read')
  @ApiParam({ name: 'id', example: '22222222-2222-2222-2222-222222222201' })
  @ApiOperation({ summary: 'Detalle de evento' })
  @ApiEnvelopeOk(CalendarEventResponseDto, { example: CALENDAR_EVENT_EXAMPLE })
  @ApiNotFoundError('Evento no encontrado')
  @ApiProtectedErrors()
  async getById(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.getById(auth, id));
  }

  @Post()
  @RequirePermission('calendar.create')
  @ApiOperation({ summary: 'Crear evento', description: 'Permiso: calendar.create' })
  @ApiEnvelopeCreated(CalendarEventResponseDto, { example: CALENDAR_EVENT_EXAMPLE })
  @ApiProtectedErrors()
  async create(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CreateCalendarEventDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.create(auth, dto));
  }

  @Patch(':id')
  @RequirePermission('calendar.update')
  @ApiParam({ name: 'id', example: '22222222-2222-2222-2222-222222222201' })
  @ApiOperation({ summary: 'Actualizar evento', description: 'Permiso: calendar.update' })
  @ApiEnvelopeOk(CalendarEventResponseDto, { example: CALENDAR_EVENT_EXAMPLE })
  @ApiNotFoundError('Evento no encontrado')
  @ApiProtectedErrors()
  async update(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ): Promise<ApiSuccess<CalendarEventResponseDto>> {
    return new ApiSuccess(await this.calendarService.update(auth, id, dto));
  }

  @Delete(':id')
  @RequirePermission('calendar.delete')
  @ApiParam({ name: 'id', example: '22222222-2222-2222-2222-222222222201' })
  @ApiOperation({ summary: 'Eliminar evento', description: 'Permiso: calendar.delete' })
  @ApiEnvelopeNullOk('Evento eliminado')
  @ApiNotFoundError('Evento no encontrado')
  @ApiProtectedErrors()
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.calendarService.remove(auth, id);
    return new ApiSuccess(null);
  }
}
