import React from 'react';
import { Platform } from 'react-native';

import { useVacations, useExpenseTotals } from '@/hooks/queries';
import { useBudgetSummaries } from '@/hooks/queries/use-budget-summary';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  APP_GROUP,
  SNAPSHOT_KEY,
  buildWidgetSnapshot,
} from '@/lib/widgets/widget-snapshot';
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

  React.useEffect(() => {
    // The shared container and WidgetKit are iOS-only; Android widgets read
    // their own state and are updated separately.
    if (Platform.OS !== 'ios') return;
    // Wait for the summaries, otherwise the first write reports a zero budget
    // and the widget flashes an empty bar before correcting itself.
    if (!budgetSummaries) return;

    const snapshot = buildWidgetSnapshot(
      vacations,
      budgetSummaries,
      defaultCurrency
    );

    // updatedAt changes on every build, so compare everything else.
    const { updatedAt, ...stable } = snapshot;
    const fingerprint = JSON.stringify(stable);
    if (fingerprint === lastWritten.current) return;

    try {
      // Required lazily: the module reaches for a native view that does not
      // exist on Android or in a bare JS test environment.
      const {
        ExtensionStorage,
      } = require('@bacons/apple-targets/build/ExtensionStorage');

      const storage = new ExtensionStorage(APP_GROUP);
      storage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
      ExtensionStorage.reloadWidget();

      lastWritten.current = fingerprint;
    } catch (error) {
      // A widget that cannot be updated must never take the app down with it.
      logger.warn('Failed to sync widget snapshot', { error });
    }
  }, [vacations, budgetSummaries, defaultCurrency]);
}
