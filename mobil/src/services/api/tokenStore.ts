import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'api-tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

let cachedTokens: StoredTokens | null = null;

export async function getAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  return tokens?.accessToken ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const tokens = await loadTokens();
  return tokens?.refreshToken ?? null;
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  cachedTokens = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedTokens));
}

export async function clearTokens(): Promise<void> {
  cachedTokens = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
}

async function loadTokens(): Promise<StoredTokens | null> {
  if (cachedTokens) return cachedTokens;

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    cachedTokens = JSON.parse(raw) as StoredTokens;
    return cachedTokens;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
