import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeEntry } from '../error/error-code';

export class BaseException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCodeEntry,
    public readonly detail: string | null = null,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(errorCode.message, status);
  }
}
