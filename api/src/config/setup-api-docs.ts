import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export function isApiDocsEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function setupApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Agenda Escolar Digital API')
    .setDescription(
      'API REST para agenda escolar, calendario, adjuntos y auth JWT',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerUiEnabled: false,
    jsonDocumentUrl: '/api/openapi.json',
  });

  app.use(
    '/api',
    apiReference({
      pageTitle: 'Agenda Escolar Digital API',
      theme: 'purple',
      content: document,
    }),
  );
}
