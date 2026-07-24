import React from 'react';
import { Platform } from 'react-native';

import { useVacations, useExpenseTotals } from '@/hooks/queries';
import { useBudgetSummaries } from '@/hooks/queries/use-budget-summary';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  APP_GROUP,
  SNAPSHOT_KEY,
  SNAPSHOT_KEY_V2,
  buildWidgetSnapshot,
  buildWidgetSnapshots,
} from '@/lib/widgets/widget-snapshot';
import { setItem, reloadAll, isAvailable } from '@/modules/widget-storage';
import { logger } from '@/lib/utils/logger';

/**
 * Mirrors the featured trip into the shared App Group so the home-screen
 * widgets can render it.
 *
 * Mounted once from the root layout. It rides on the queries the app already
 * runs, so a saved expense invalidates them, this recomputes, and the widget
 * timeline is reloaded - no polling and no separate refresh path that could
 * disagree with what the app shows.
 */
export function useWidgetSync() {
  const { data: vacations = [] } = useVacations();
  const { data: expenseTotals } = useExpenseTotals();
  const { data: budgetSummaries } = useBudgetSummaries(vacations, expenseTotals);
  const { defaultCurrency } = useCurrency();

  // Writing the same payload again would reload the widget timeline for no
  // reason, so the last one written is compared first.
  const lastWritten = React.useRef<string | null>(null);
  // isAvailable being false is worth surfacing, but only once - the effect runs
  // on every query invalidation and a warning per run would drown the log.
  const warnedUnavailable = React.useRef(false);

  React.useEffect(() => {
    // The shared container and WidgetKit are iOS-only; Android widgets read
    // their own state and are updated separately.
    if (Platform.OS !== 'ios') return;
    // Wait for the summaries, otherwise the first write reports a zero budget
    // and the widget flashes an empty bar before correcting itself.
    if (!budgetSummaries) return;

    // The featured trip drives the legacy single-snapshot key; the V2 list
    // carries every trip plus which one to feature by default.
    const snapshot = buildWidgetSnapshot(
      vacations,
      budgetSummaries,
      defaultCurrency
    );
    const snapshotV2 = buildWidgetSnapshots(
      vacations,
      budgetSummaries,
      defaultCurrency
    );

    // updatedAt changes on every build, so compare everything else - across
    // both payloads, so a change in any trip still triggers a write.
    const { updatedAt: _legacyAt, ...stable } = snapshot;
    const stableV2 = {
      featuredId: snapshotV2.featuredId,
      trips: snapshotV2.trips.map(({ updatedAt: _at, ...rest }) => rest),
    };
    const fingerprint = JSON.stringify({ stable, stableV2 });
    if (fingerprint === lastWritten.current) return;

    try {
      // A missing native module must be loud, not a silent no-op - the whole
      // point of the bridge is that the widget gets its data.
      if (!isAvailable) {
        if (!warnedUnavailable.current) {
          warnedUnavailable.current = true;
          logger.warn(
            'Widget storage native module unavailable; skipping widget sync'
          );
        }
        return;
      }

      setItem(SNAPSHOT_KEY, JSON.stringify(snapshot), APP_GROUP);
      setItem(SNAPSHOT_KEY_V2, JSON.stringify(snapshotV2), APP_GROUP);
      reloadAll();

      lastWritten.current = fingerprint;
    } catch (error) {
      // A widget that cannot be updated must never take the app down with it.
      logger.warn('Failed to sync widget snapshot', { error });
    }
  }, [vacations, budgetSummaries, defaultCurrency]);
}
