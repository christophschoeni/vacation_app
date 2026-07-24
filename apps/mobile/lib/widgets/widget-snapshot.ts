import type { Vacation } from '@/types';
import { daysUntil, featuredVacation, vacationStatus } from '@/lib/utils/vacation-status';

/**
 * The App Group both the app and the widget extension belong to.
 *
 * Must stay identical to the value in app.json's ios.entitlements and in each
 * targets/*\/expo-target.config.js - the shared container is addressed by this
 * string, and a mismatch fails silently as an empty widget.
 */
export const APP_GROUP = 'group.com.vomschoeni.ferien-budget';

/** Key the widget reads its payload from inside the shared defaults. */
export const SNAPSHOT_KEY = 'widgetSnapshot';

/**
 * Key the V2 widget reads from: the full trip list plus which one is featured.
 *
 * Written alongside SNAPSHOT_KEY, never in place of it - an older widget build
 * still reading the single snapshot must keep working after the app updates.
 */
export const SNAPSHOT_KEY_V2 = 'widgetSnapshotV2';

/**
 * What a home-screen widget renders.
 *
 * Deliberately flat and pre-formatted where the widget cannot easily compute a
 * value itself: the extension gets a few hundred milliseconds to draw and has
 * no access to the app's SQLite database or its currency conversion, so
 * everything it needs is resolved here and mirrored across.
 */
export interface WidgetSnapshot {
  /** Absent when there is no trip to show; the widget renders its empty state. */
  destination: string | null;
  /** Whole days until departure, or until the end date once under way. */
  daysRemaining: number;
  /** True while the trip is running. */
  inProgress: boolean;
  /** ISO 8601, so the widget can recompute the day count between refreshes. */
  targetDate: string | null;

  budget: number;
  spent: number;
  /** Currency code the two amounts above are expressed in. */
  currency: string;

  /**
   * Budget and spend also in the trip currency, shown small alongside the home
   * currency. Absent (undefined) when the trip currency equals the display
   * currency or no rate was available.
   */
  budgetTrip?: number;
  spentTrip?: number;
  tripCurrency?: string;

  /** When this snapshot was produced, ISO 8601. */
  updatedAt: string;
}

export const EMPTY_SNAPSHOT: WidgetSnapshot = {
  destination: null,
  daysRemaining: 0,
  inProgress: false,
  targetDate: null,
  budget: 0,
  spent: 0,
  currency: 'CHF',
  updatedAt: new Date(0).toISOString(),
};

/**
 * Build the payload for the featured trip.
 *
 * `summaries` carries budget and spend already converted into the display
 * currency - the same figures the vacation list shows. Passing raw values here
 * would let the widget disagree with the app, which is the currency trap the
 * cards already fell into once.
 */
type WidgetBudgetSummary = {
  totalBudget: number;
  totalSpent: number;
  totalBudgetTrip?: number;
  totalSpentTrip?: number;
  tripCurrency?: string;
};

export function buildWidgetSnapshot(
  vacations: Vacation[],
  summaries: Map<string, WidgetBudgetSummary> | undefined,
  currency: string,
  now: Date = new Date()
): WidgetSnapshot {
  const vacation = featuredVacation(vacations, now);

  if (!vacation) {
    return { ...EMPTY_SNAPSHOT, currency, updatedAt: now.toISOString() };
  }

  const status = vacationStatus(vacation, now);
  const inProgress = status === 'active';

  // A running trip counts down to its end, matching the timer tab.
  const target = new Date(inProgress ? vacation.endDate : vacation.startDate);
  const summary = summaries?.get(vacation.id);

  return {
    destination: vacation.destination,
    daysRemaining: Math.max(0, daysUntil(target, now)),
    inProgress,
    targetDate: target.toISOString(),
    budget: summary?.totalBudget ?? 0,
    spent: summary?.totalSpent ?? 0,
    currency,
    budgetTrip: summary?.totalBudgetTrip,
    spentTrip: summary?.totalSpentTrip,
    tripCurrency: summary?.tripCurrency,
    updatedAt: now.toISOString(),
  };
}

/**
 * One trip in the V2 payload.
 *
 * Unlike the single {@link WidgetSnapshot}, every field is always present: the
 * list form carries a real trip per entry, so `destination` is never null and
 * `id` - the key the widget's configuration intent selects a trip by - is
 * required. Otherwise the day and budget maths mirror the single snapshot.
 */
export interface WidgetSnapshotV2 {
  /** Vacation id; the selection key the widget's intent picks a trip by. */
  id: string;
  /** Always a real destination in the list form. */
  destination: string;
  /** Whole days until departure, or until the end date once under way. */
  daysRemaining: number;
  /** True while the trip is running. */
  inProgress: boolean;
  /** ISO 8601, so the widget can recompute the day count between refreshes. */
  targetDate: string;

  budget: number;
  spent: number;
  /** Currency code the two amounts above are expressed in. */
  currency: string;

  /** Budget and spend also in the trip currency (small secondary figure). */
  budgetTrip?: number;
  spentTrip?: number;
  tripCurrency?: string;

  /** When this entry was produced, ISO 8601. */
  updatedAt: string;
}

/**
 * Build the V2 payload: one entry per trip plus the id of the featured one.
 *
 * The widget renders whichever trip the user selected in its configuration
 * intent, falling back to `featuredId` when none is chosen. Each entry uses the
 * same day and budget maths as {@link buildWidgetSnapshot}, applied per trip.
 *
 * `summaries` carries budget and spend already converted into the display
 * currency - the same figures the vacation list shows - so the widget cannot
 * disagree with the app.
 */
export function buildWidgetSnapshots(
  vacations: Vacation[],
  summaries: Map<string, WidgetBudgetSummary> | undefined,
  currency: string,
  now: Date = new Date()
): { featuredId: string | null; trips: WidgetSnapshotV2[] } {
  const updatedAt = now.toISOString();

  const trips = vacations.map((vacation) => {
    const inProgress = vacationStatus(vacation, now) === 'active';

    // A running trip counts down to its end, matching the timer tab.
    const target = new Date(inProgress ? vacation.endDate : vacation.startDate);
    const summary = summaries?.get(vacation.id);

    return {
      id: vacation.id,
      destination: vacation.destination,
      daysRemaining: Math.max(0, daysUntil(target, now)),
      inProgress,
      targetDate: target.toISOString(),
      budget: summary?.totalBudget ?? 0,
      spent: summary?.totalSpent ?? 0,
      currency,
      budgetTrip: summary?.totalBudgetTrip,
      spentTrip: summary?.totalSpentTrip,
      tripCurrency: summary?.tripCurrency,
      updatedAt,
    };
  });

  return {
    featuredId: featuredVacation(vacations, now)?.id ?? null,
    trips,
  };
}
