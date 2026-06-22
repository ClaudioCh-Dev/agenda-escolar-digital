import { ApiError } from './api-error';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export function buildErrorResponse(
  code: string,
  message: string,
  detail: string | null = null,
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: new ApiError(code, message, detail),
  };
}
