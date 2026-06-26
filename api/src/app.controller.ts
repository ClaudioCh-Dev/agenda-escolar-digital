import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiSuccess } from './shared';
import { ApiEnvelopeDataOk } from './shared/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica que la API responde',
  })
  @ApiEnvelopeDataOk('API en línea', { message: 'Agenda Escolar Digital API' })
  getHello(): ApiSuccess<{ message: string }> {
    return new ApiSuccess({ message: this.appService.getHello() });
  }
}
