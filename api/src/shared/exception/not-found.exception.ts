import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(detail: string | null = null) {
    super(ErrorCode.NOT_FOUND, detail, HttpStatus.NOT_FOUND);
  }
}
