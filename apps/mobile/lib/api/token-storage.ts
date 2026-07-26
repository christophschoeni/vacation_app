import * as SecureStore from 'expo-secure-store';

import { logger } from '@/lib/utils/logger';

/**
 * JWT storage backed by the device keychain/keystore (expo-secure-store).
 * Access and refresh tokens are secrets, so they never touch AsyncStorage.
 */

const ACCESS_KEY = 'auth.access_token';
const REFRESH_KEY = 'auth.refresh_token';

export interface TokenPair {
  access: string;
  refresh: string;
}

export async function saveTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.access),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh),
  ]);
}

export async function saveAccessToken(access: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  } catch (error) {
    logger.warn('Failed to clear auth tokens', { error });
  }
}
