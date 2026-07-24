import type { Vacation } from '@/types';
import { buildWidgetSnapshots } from '../widget-snapshot';

// A fixed evening "now" - the time-of-day is what the midnight-flooring day
// maths has to neutralise, so an evening clock is the meaningful case.
const NOW = new Date('2026-07-22T20:00:00');

const CURRENCY = 'CHF';

/**
 * Minimal Vacation fixture. Only the fields the builder touches carry meaning;
 * the rest exist to satisfy the type.
 */
function makeVacation(overrides: Partial<Vacation> & { id: string }): Vacation {
  return {
    country: '',
    hotel: '',
    budgetCurrency: 'CHF',
    currency: 'CHF',
    expenses: [],
    checklists: [],
    createdAt: NOW,
    updatedAt: NOW,
    destination: `Trip ${overrides.id}`,
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-10'),
    ...overrides,
  };
}

describe('buildWidgetSnapshots', () => {
  it('produces one entry per trip, each with its id', () => {
    const vacations = [
      makeVacation({ id: 'a', destination: 'Rome' }),
      makeVacation({ id: 'b', destination: 'Paris' }),
    ];

    const { trips } = buildWidgetSnapshots(vacations, undefined, CURRENCY, NOW);

    expect(trips).toHaveLength(2);
    expect(trips.map((t) => t.id)).toEqual(['a', 'b']);
    expect(trips.map((t) => t.destination)).toEqual(['Rome', 'Paris']);
    // Every entry is fully populated in the list form.
    for (const trip of trips) {
      expect(typeof trip.id).toBe('string');
      expect(typeof trip.destination).toBe('string');
      expect(typeof trip.targetDate).toBe('string');
      expect(trip.currency).toBe(CURRENCY);
    }
  });

  it('carries converted budget and spend from the summaries', () => {
    const vacations = [makeVacation({ id: 'a' })];
    const summaries = new Map([['a', { totalBudget: 1200, totalSpent: 340 }]]);

    const { trips } = buildWidgetSnapshots(vacations, summaries, CURRENCY, NOW);

    expect(trips[0].budget).toBe(1200);
    expect(trips[0].spent).toBe(340);
  });

  it('featuredId is the active trip, preferred over an upcoming one', () => {
    const vacations = [
      makeVacation({
        id: 'upcoming',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-10'),
      }),
      makeVacation({
        id: 'active',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-25'),
      }),
    ];

    const { featuredId } = buildWidgetSnapshots(
      vacations,
      undefined,
      CURRENCY,
      NOW
    );

    expect(featuredId).toBe('active');
  });

  it('counts a running trip down to its end date', () => {
    const vacations = [
      makeVacation({
        id: 'active',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-25'),
      }),
    ];

    const { trips } = buildWidgetSnapshots(vacations, undefined, CURRENCY, NOW);

    expect(trips[0].inProgress).toBe(true);
    // 22nd -> 25th is 3 whole days.
    expect(trips[0].daysRemaining).toBe(3);
  });

  it('returns empty trips and a null featuredId when there are no vacations', () => {
    const { featuredId, trips } = buildWidgetSnapshots(
      [],
      undefined,
      CURRENCY,
      NOW
    );

    expect(trips).toEqual([]);
    expect(featuredId).toBeNull();
  });
});
