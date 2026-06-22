import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class InvalidRefreshTokenException extends BaseException {
  constructor(detail: string | null = null) {
    super(ErrorCode.INVALID_REFRESH_TOKEN, detail, HttpStatus.UNAUTHORIZED);
  }
}
