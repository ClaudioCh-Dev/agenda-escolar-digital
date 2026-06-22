import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class UnauthorizedAccessException extends BaseException {
  constructor(detail: string | null = null) {
    super(ErrorCode.UNAUTHORIZED, detail, HttpStatus.UNAUTHORIZED);
  }
}
