import { apiUrl } from './config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from './token-storage';

/**
 * Thin fetch wrapper for the backend API.
 *
 * - Injects the bearer access token.
 * - On a 401, transparently refreshes the access token once (using the refresh
 *   token) and retries the request. Concurrent 401s share a single in-flight
 *   refresh so we never fire N refreshes at once.
 * - When refresh fails, tokens are cleared; onAuthExpired lets the AuthContext
 *   react (sign the user out).
 */

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type AuthExpiredHandler = () => void;
let onAuthExpired: AuthExpiredHandler | null = null;

/** Registered by AuthContext so the client can force a sign-out on hard 401. */
export function setAuthExpiredHandler(handler: AuthExpiredHandler | null): void {
  onAuthExpired = handler;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Collapse concurrent refreshes into one.
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = await getRefreshToken();
    if (!refresh) return null;

    const response = await fetch(apiUrl('/api/auth/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      await clearTokens();
      return null;
    }

    const data = (await response.json()) as { access: string };
    await saveAccessToken(data.access);
    return data.access;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip auth header + refresh (login, register, refresh itself). */
  auth?: boolean;
  signal?: AbortSignal;
}

async function rawRequest(
  path: string,
  { method = 'GET', body, auth = true, signal }: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(apiUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const useAuth = options.auth ?? true;
  let accessToken = useAuth ? await getAccessToken() : null;

  let response = await rawRequest(path, options, accessToken);

  // Transparent refresh-and-retry on a single 401.
  if (response.status === 401 && useAuth) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      response = await rawRequest(path, options, accessToken);
    } else {
      onAuthExpired?.();
    }
  }

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // non-JSON error body
    }
    throw new ApiError(response.status, data);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
