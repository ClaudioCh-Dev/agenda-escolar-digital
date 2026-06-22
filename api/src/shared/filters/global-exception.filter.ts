import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../error/error-code';
import { BaseException } from '../exception/base.exception';
import { buildErrorResponse } from '../response/api-response';

type RequestWithId = Request & { id?: string };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();
    const httpMeta = this.buildHttpMeta(request);

    if (exception instanceof BaseException) {
      this.logger.warn({
        ...httpMeta,
        errorCode: exception.errorCode.code,
        detail: exception.detail,
        status: exception.getStatus(),
      });

      response
        .status(exception.getStatus())
        .json(
          buildErrorResponse(
            exception.errorCode.code,
            exception.errorCode.message,
            exception.detail,
          ),
        );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const detail = this.extractDetail(body);

      this.logger.warn({
        ...httpMeta,
        errorCode: ErrorCode.INVALID_REQUEST.code,
        detail,
        status,
      });

      response
        .status(status)
        .json(
          buildErrorResponse(
            ErrorCode.INVALID_REQUEST.code,
            ErrorCode.INVALID_REQUEST.message,
            detail,
          ),
        );
      return;
    }

    this.logger.error({
      ...httpMeta,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        buildErrorResponse(
          ErrorCode.INTERNAL_ERROR.code,
          ErrorCode.INTERNAL_ERROR.message,
          exception instanceof Error ? exception.message : null,
        ),
      );
  }

  private buildHttpMeta(request: RequestWithId) {
    return {
      method: request.method,
      url: request.url,
      requestId: request.id,
    };
  }

  private extractDetail(body: string | object): string | null {
    if (typeof body === 'string') {
      return body;
    }

    const message = (body as { message?: string | string[] }).message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    return null;
  }
}
