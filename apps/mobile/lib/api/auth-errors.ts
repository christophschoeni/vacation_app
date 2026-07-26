import { ApiError } from './client';
import type { TranslationKey } from '@/lib/i18n/generated-keys';

/**
 * Map an ApiError from the auth endpoints to a translation key. Keeps the raw
 * DRF error shapes in one place instead of scattered across screens.
 */
export function authErrorKey(error: unknown): TranslationKey {
  if (error instanceof ApiError) {
    // Login: bad credentials -> 401.
    if (error.status === 401) return 'auth.errors.invalid_credentials';

    // Register: DRF field validation -> 400 with {field: [messages]}.
    if (error.status === 400 && error.data && typeof error.data === 'object') {
      const data = error.data as Record<string, unknown>;
      if ('email' in data) return 'auth.errors.email_taken';
      if ('password' in data) return 'auth.errors.weak_password';
    }
  }
  // No status (fetch threw) or anything unexpected -> network/general.
  return 'auth.errors.network';
}
