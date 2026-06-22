import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(detail: string | null = null) {
    super(ErrorCode.FORBIDDEN, detail, HttpStatus.FORBIDDEN);
  }
}
