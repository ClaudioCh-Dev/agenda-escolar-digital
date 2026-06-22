export class ErrorCodeEntry {
  constructor(
    readonly code: string,
    readonly message: string,
  ) {}
}

export const ErrorCode = {
  USER_NOT_FOUND: new ErrorCodeEntry('USER_NOT_FOUND', 'User not found'),
  INVALID_REQUEST: new ErrorCodeEntry('INVALID_REQUEST', 'Invalid request'),
  INVALID_CREDENTIALS: new ErrorCodeEntry(
    'INVALID_CREDENTIALS',
    'Invalid credentials',
  ),
  USER_INACTIVE: new ErrorCodeEntry(
    'USER_INACTIVE',
    'User account is inactive',
  ),
  INVALID_REFRESH_TOKEN: new ErrorCodeEntry(
    'INVALID_REFRESH_TOKEN',
    'Invalid refresh token',
  ),
  UNAUTHORIZED: new ErrorCodeEntry('UNAUTHORIZED', 'Unauthorized'),
  FORBIDDEN: new ErrorCodeEntry('FORBIDDEN', 'Forbidden'),
  NOT_FOUND: new ErrorCodeEntry('NOT_FOUND', 'Resource not found'),
  ORDER_NOT_FOUND: new ErrorCodeEntry('ORDER_NOT_FOUND', 'Order not found'),
  INTERNAL_ERROR: new ErrorCodeEntry('INTERNAL_ERROR', 'Internal server error'),
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;
