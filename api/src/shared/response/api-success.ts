import { ApiResponse } from './api-response';

export class ApiSuccess<T> implements ApiResponse<T> {
  readonly success = true;
  readonly error = null;

  constructor(readonly data: T) {}
}
