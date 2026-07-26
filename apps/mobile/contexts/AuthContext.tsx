import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as authApi from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import { setAuthExpiredHandler } from '@/lib/api/client';
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from '@/lib/api/token-storage';
import { logger } from '@/lib/utils/logger';

interface AuthContextValue {
  /** True while restoring the session from stored tokens on startup. */
  isLoading: boolean;
  /** The signed-in user, or null when signed out. */
  user: AuthUser | null;
  /** Convenience flag for the auth gate. */
  isAuthenticated: boolean;
  /** Sign in with email + password; throws ApiError on bad credentials. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Create an account, then sign in; throws ApiError on validation errors. */
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  /** Sign out: blacklist the refresh token and clear local state. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on startup: if we have a stored token, fetch the user.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const refresh = await getRefreshToken();
        if (!refresh) return;
        const me = await authApi.fetchMe();
        if (!cancelled) setUser(me);
      } catch (error) {
        // Token invalid/expired or the server is unreachable — start signed out.
        logger.info('No valid session to restore', { error });
        if (!cancelled) await clearTokens();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    await saveTokens(tokens);
    const me = await authApi.fetchMe();
    setUser(me);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      await authApi.register(email, password, displayName);
      // Registration doesn't return tokens; log in to obtain them.
      const tokens = await authApi.login(email, password);
      await saveTokens(tokens);
      const me = await authApi.fetchMe();
      setUser(me);
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) await authApi.logout(refresh);
    } catch (error) {
      logger.warn('Logout request failed; clearing local session anyway', { error });
    } finally {
      await clearTokens();
      setUser(null);
    }
  }, []);

  // When the API client can't refresh (hard 401), drop to signed-out.
  useEffect(() => {
    setAuthExpiredHandler(() => {
      setUser(null);
    });
    return () => setAuthExpiredHandler(null);
  }, []);

  const value: AuthContextValue = {
    isLoading,
    user,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
