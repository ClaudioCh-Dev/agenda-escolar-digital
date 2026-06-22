process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/agenda_escolar_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-key';
process.env.JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
process.env.JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '30d';
