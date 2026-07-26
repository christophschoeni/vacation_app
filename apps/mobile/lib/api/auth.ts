import { apiRequest } from './client';
import type { TokenPair } from './token-storage';

/** Shape of the user returned by /api/auth/me/ and register. */
export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  date_joined?: string;
}

export async function login(email: string, password: string): Promise<TokenPair> {
  return apiRequest<TokenPair>('/api/auth/login/', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/register/', {
    method: 'POST',
    body: { email, password, display_name: displayName ?? '' },
    auth: false,
  });
}

export async function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me/', { method: 'GET' });
}

export async function logout(refresh: string): Promise<void> {
  await apiRequest<void>('/api/auth/logout/', {
    method: 'POST',
    body: { refresh },
    auth: false,
  });
}
