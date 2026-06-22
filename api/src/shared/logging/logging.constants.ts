/** Campos estándar en logs de dominio (objeto estructurado). */
export const LOG_CONTEXT = {
  ACTION: 'action',
  USER_ID: 'userId',
  CODE: 'code',
  REASON: 'reason',
  MODULE: 'module',
} as const;

export const SENSITIVE_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'authorization',
  'cookie',
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'refreshToken',
  'accessToken',
  'JWT_SECRET',
] as const;
