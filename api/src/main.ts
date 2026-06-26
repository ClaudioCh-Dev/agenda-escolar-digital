import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { isApiDocsEnabled, setupApiDocs } from './config/setup-api-docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: true });

  const port = process.env.PORT ?? 3000;

  if (isApiDocsEnabled()) {
    setupApiDocs(app);
    new Logger('Bootstrap').log(
      `API docs (Scalar): http://localhost:${port}/api`,
    );
  }

  await app.listen(port);
}
void bootstrap();
