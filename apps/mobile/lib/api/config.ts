import { Platform } from 'react-native';

/**
 * Base URL of the backend API (apps/api).
 *
 * Set EXPO_PUBLIC_API_BASE_URL in .env.dev / .env.prod (inlined at build time,
 * same mechanism as the RevenueCat key). When unset we fall back to a local dev
 * server so the app works out of the box against `manage.py runserver`:
 * the iOS simulator reaches the host Mac via localhost; Android emulators use
 * the 10.0.2.2 alias.
 */
const DEV_FALLBACK =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEV_FALLBACK
).replace(/\/$/, '');

/** Fully-qualified URL for an API path like "/api/auth/login/". */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
