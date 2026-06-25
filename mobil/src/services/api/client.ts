import { API_BASE_URL } from '@/constants/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStore';
import type { ApiEnvelope, AuthTokensResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function buildQuery(params?: object): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value !== '') {
      qs.set(key, value);
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const envelope = (await response.json()) as ApiEnvelope<AuthTokensResponse>;
      if (!response.ok || !envelope.success || !envelope.data) {
        await clearTokens();
        return false;
      }

      await setTokens(
        envelope.data.accessToken,
        envelope.data.refreshToken,
        envelope.data.expiresIn,
      );
      return true;
    } catch {
      await clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function rawFetch(path: string, options?: RequestInit): Promise<Response> {
  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  retried = false,
): Promise<T> {
  const response = await rawFetch(path, options);
  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
    throw new ApiError('Sesión expirada', 401);
  }

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.error?.message ?? `Request failed: ${response.status}`,
      response.status,
      envelope.error?.code,
    );
  }

  return envelope.data as T;
}

export interface ApiUploadOptions {
  onProgress?: (percent: number) => void;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options?: ApiUploadOptions,
  retried = false,
): Promise<T> {
  const accessToken = await getAccessToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${path}`);

    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }

    if (options?.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          options.onProgress!(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      void (async () => {
        let envelope: ApiEnvelope<T>;
        try {
          envelope = JSON.parse(xhr.responseText) as ApiEnvelope<T>;
        } catch {
          reject(new ApiError('Invalid response', xhr.status));
          return;
        }

        if (xhr.status === 401 && !retried && !path.startsWith('/auth/')) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            try {
              resolve(await apiUpload<T>(path, formData, options, true));
            } catch (error) {
              reject(error);
            }
            return;
          }
          reject(new ApiError('Sesión expirada', 401));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300 || !envelope.success) {
          reject(
            new ApiError(
              envelope.error?.message ?? `Request failed: ${xhr.status}`,
              xhr.status,
              envelope.error?.code,
            ),
          );
          return;
        }

        resolve(envelope.data as T);
      })();
    };

    xhr.onerror = () => reject(new ApiError('Network error'));
    xhr.send(formData);
  });
}

export function notImplemented(endpoint: string): never {
  throw new Error(`API not implemented: ${endpoint}`);
}
