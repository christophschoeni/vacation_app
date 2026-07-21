import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';

/**
 * QueryClient configured for a local-first app.
 *
 * The data source is an on-device SQLite database, not a remote API, so the
 * usual network-oriented defaults do not apply:
 * - Reads are cheap and never fail intermittently, so retries add latency
 *   without improving reliability.
 * - Data can only change through this app's own mutations, which invalidate
 *   the affected keys explicitly. Refetching on window focus would therefore
 *   only duplicate work.
 * - staleTime is nevertheless finite so that a missed invalidation
 *   self-corrects on the next remount instead of persisting indefinitely.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Central fallback so a mutation failure is never silent; screens can
        // still handle the error themselves for user-facing messages.
        logger.error('Mutation failed', error);
      },
    },
  },
});
