function readEnvFlag(
  value: string | boolean | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value === '') return defaultValue;
  if (value === false || value === true) return value;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }

  return defaultValue;
}

export const TODAY = '2026-06-13';

/** Mock activo salvo EXPO_PUBLIC_USE_MOCK=false (string o boolean) en mobil/.env */
export const USE_MOCK = readEnvFlag(
  process.env.EXPO_PUBLIC_USE_MOCK as string | boolean | undefined,
  true,
);

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com';
