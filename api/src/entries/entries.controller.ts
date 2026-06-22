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
import {
  CreateEntryDto,
  ListEntriesQueryDto,
  UpdateEntryDto,
} from './dto/entry.dto';
import { EntryResponseDto } from './dto/entry-response.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @RequirePermission('entries.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
    @Query() query: ListEntriesQueryDto,
  ): Promise<ApiSuccess<EntryResponseDto[]>> {
    return new ApiSuccess(await this.entriesService.list(auth, query));
  }

  @Get(':id')
  @RequirePermission('entries.read')
  async getById(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.getById(auth, id));
  }

  @Post()
  @RequirePermission('entries.create')
  async create(
    @CurrentUser() auth: AuthenticatedUser,
    @Body() dto: CreateEntryDto,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.create(auth, dto));
  }

  @Patch(':id')
  @RequirePermission('entries.update')
  async update(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
  ): Promise<ApiSuccess<EntryResponseDto>> {
    return new ApiSuccess(await this.entriesService.update(auth, id, dto));
  }

  @Delete(':id')
  @RequirePermission('entries.delete')
  async remove(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.entriesService.remove(auth, id);
    return new ApiSuccess(null);
  }

  @Post(':id/read')
  @RequirePermission('entries.ack')
  async acknowledgeRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.entriesService.acknowledgeRead(auth, id);
    return new ApiSuccess(null);
  }
}
