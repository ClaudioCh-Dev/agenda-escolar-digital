import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, null, HttpStatus.UNAUTHORIZED);
  }
}
