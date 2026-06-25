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
import { ENTRY_RESPONSE_EXAMPLE } from '../shared/swagger/examples';
import {
  CreateEntryDto,
  ListEntriesQueryDto,
  UpdateEntryDto,
} from './dto/entry.dto';
import { EntryResponseDto } from './dto/entry-response.dto';
import { EntriesService } from './entries.service';

@ApiTags('Entries')
@ApiBearerAuth()
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @RequirePermission('entries.read')
  @ApiOperation({ summary: 'Listar anotaciones', description: 'Permiso: entries.read. Filtros: section, date, from, to, childId' })
  @ApiEnvelopeOk(EntryResponseDto, {
    isArray: true,
    example: [ENTRY_RESPONSE_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListEntriesQueryDto,
  ): Promise<ApiSuccess<EntryResponseDto[]>> {
    return new ApiSuccess(await this.entriesService.list(auth, query));
  }

  @Get(':id')
  @RequirePermission('entries.read')
  @ApiParam({ name: 'id', example: '11111111-1111-1111-1111-111111111101' })
  @ApiOperation({ summary: 'Detalle de anotación' })
  @ApiEnvelopeOk(EntryResponseDto, { example: ENTRY_RESPONSE_EXAMPLE })
  @ApiNotFoundError('Anotación no encontrada')
  @ApiProtectedErrors()
  async getById(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.getById(auth, id));
  }

  @Post()
  @RequirePermission('entries.create')
  @ApiOperation({ summary: 'Crear anotación', description: 'Permiso: entries.create' })
  @ApiEnvelopeCreated(EntryResponseDto, { example: ENTRY_RESPONSE_EXAMPLE })
  @ApiProtectedErrors()
  async create(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CreateEntryDto,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.create(auth, dto));
  }

  @Patch(':id')
  @RequirePermission('entries.update')
  @ApiParam({ name: 'id', example: '11111111-1111-1111-1111-111111111101' })
  @ApiOperation({ summary: 'Actualizar anotación', description: 'Permiso: entries.update' })
  @ApiEnvelopeOk(EntryResponseDto, { example: ENTRY_RESPONSE_EXAMPLE })
  @ApiNotFoundError('Anotación no encontrada')
  @ApiProtectedErrors()
  async update(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.update(auth, id, dto));
  }

  @Delete(':id')
  @RequirePermission('entries.delete')
  @ApiParam({ name: 'id', example: '11111111-1111-1111-1111-111111111101' })
  @ApiOperation({ summary: 'Eliminar anotación', description: 'Permiso: entries.delete' })
  @ApiEnvelopeNullOk('Anotación eliminada')
  @ApiNotFoundError('Anotación no encontrada')
  @ApiProtectedErrors()
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.entriesService.remove(auth, id);
    return new ApiSuccess(null);
  }

  @Post(':id/read')
  @RequirePermission('entries.ack')
  @ApiParam({ name: 'id', example: '11111111-1111-1111-1111-111111111101' })
  @ApiOperation({ summary: 'Confirmar lectura', description: 'Padre confirma comunicado. Permiso: entries.ack' })
  @ApiEnvelopeNullOk('Lectura confirmada')
  @ApiNotFoundError('Anotación no encontrada')
  @ApiProtectedErrors()
  async acknowledgeRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.entriesService.acknowledgeRead(auth, id);
    return new ApiSuccess(null);
  }
}
