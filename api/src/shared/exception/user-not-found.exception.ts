import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class UserNotFoundException extends BaseException {
  constructor(userId: string) {
    super(
      ErrorCode.USER_NOT_FOUND,
      `User id: ${userId} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
