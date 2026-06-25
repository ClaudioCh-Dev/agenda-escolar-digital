import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { apiErrorExample } from './api-error.dto';

export function ApiAuthErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'No autenticado o credenciales inválidas',
      schema: {
        example: apiErrorExample('UNAUTHORIZED', 'Unauthorized'),
      },
    }),
    ApiForbiddenResponse({
      description: 'Cuenta inactiva o sin permiso',
      schema: {
        examples: {
          inactive: {
            summary: 'Usuario inactivo',
            value: apiErrorExample('USER_INACTIVE', 'User account is inactive'),
          },
          forbidden: {
            summary: 'Sin permiso RBAC',
            value: apiErrorExample('FORBIDDEN', 'Forbidden'),
          },
        },
      },
    }),
  );
}

export function ApiValidationError() {
  return ApiBadRequestResponse({
    description: 'Body o query inválido',
    schema: {
      example: apiErrorExample(
        'INVALID_REQUEST',
        'Invalid request',
        'code must start with e, t or p followed by digits',
      ),
    },
  });
}

export function ApiNotFoundError(description = 'Recurso no encontrado') {
  return ApiNotFoundResponse({
    description,
    schema: {
      example: apiErrorExample('NOT_FOUND', 'Resource not found'),
    },
  });
}

export function ApiProtectedErrors() {
  return applyDecorators(ApiAuthErrors(), ApiValidationError());
}
