import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiSuccess } from './shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): ApiSuccess<{ message: string }> {
    return new ApiSuccess({ message: this.appService.getHello() });
  }
}
