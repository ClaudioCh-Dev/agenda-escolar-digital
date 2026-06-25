import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

type EnvelopeOptions = {
  description?: string;
  isArray?: boolean;
  example?: unknown;
};

function envelopeSchema(
  dataModel: Type<unknown> | null,
  options?: EnvelopeOptions,
) {
  const dataProperty =
    dataModel === null
      ? { type: 'object', nullable: true, example: null }
      : options?.isArray
        ? { type: 'array', items: { $ref: getSchemaPath(dataModel) } }
        : { $ref: getSchemaPath(dataModel) };

  return {
    type: 'object',
    required: ['success', 'data', 'error'],
    properties: {
      success: { type: 'boolean', example: true },
      data: dataProperty,
      error: { type: 'object', nullable: true, example: null },
    },
    ...(options?.example !== undefined
      ? { example: { success: true, data: options.example, error: null } }
      : {}),
  };
}

export function ApiEnvelopeOk(
  dataModel: Type<unknown>,
  options?: EnvelopeOptions,
) {
  const decorators = [ApiExtraModels(dataModel)];
  if (options?.isArray) {
    decorators.push(ApiExtraModels(dataModel));
  }
  return applyDecorators(
    ...decorators,
    ApiOkResponse({
      description: options?.description ?? 'Operación exitosa',
      schema: envelopeSchema(dataModel, options),
    }),
  );
}

export function ApiEnvelopeCreated(
  dataModel: Type<unknown>,
  options?: EnvelopeOptions,
) {
  return applyDecorators(
    ApiExtraModels(dataModel),
    ApiCreatedResponse({
      description: options?.description ?? 'Recurso creado',
      schema: envelopeSchema(dataModel, options),
    }),
  );
}

export function ApiEnvelopeNullOk(description?: string) {
  return ApiOkResponse({
    description: description ?? 'Operación exitosa sin payload',
    schema: {
      example: { success: true, data: null, error: null },
    },
  });
}

export function ApiEnvelopeDataOk(
  description: string,
  example: Record<string, unknown>,
) {
  return ApiOkResponse({
    description,
    schema: {
      example: { success: true, data: example, error: null },
    },
  });
}
