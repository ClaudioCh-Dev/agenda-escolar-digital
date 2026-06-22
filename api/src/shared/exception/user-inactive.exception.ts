import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error/error-code';
import { BaseException } from './base.exception';

export class UserInactiveException extends BaseException {
  constructor(userId: string) {
    super(
      ErrorCode.USER_INACTIVE,
      `User id: ${userId} is inactive`,
      HttpStatus.FORBIDDEN,
    );
  }
}
