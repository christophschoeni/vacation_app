import {
  daysUntil,
  vacationStatus,
  nextUpcomingVacation,
  featuredVacation,
} from '../vacation-status';

// A fixed "now" in the evening — the time-of-day is what the midnight-flooring
// logic has to neutralise, so an evening clock is the meaningful case.
const NOW = new Date('2026-07-22T20:00:00');

const trip = (startDate: string, endDate: string) => ({
  startDate: new Date(startDate),
  endDate: new Date(endDate),
});

describe('daysUntil', () => {
  it('floors both sides to midnight so evening clock time does not skew days', () => {
    // Tomorrow morning must read as 1 day, not 0, despite "now" being 20:00.
    expect(daysUntil(new Date('2026-07-23T06:00:00'), NOW)).toBe(1);
  });

  it('is negative once the date has passed', () => {
    expect(daysUntil(new Date('2026-07-20T06:00:00'), NOW)).toBe(-2);
  });

  it('is 0 for later today', () => {
    expect(daysUntil(new Date('2026-07-22T23:00:00'), NOW)).toBe(0);
  });
});

describe('vacationStatus', () => {
  it('treats the end date as inclusive (active on the final day)', () => {
    expect(vacationStatus(trip('2026-07-20', '2026-07-22'), NOW)).toBe('active');
  });

  it('classifies future and past trips', () => {
    expect(vacationStatus(trip('2026-08-01', '2026-08-10'), NOW)).toBe('planned');
    expect(vacationStatus(trip('2026-07-01', '2026-07-10'), NOW)).toBe('past');
  });
});

describe('nextUpcomingVacation', () => {
  it('returns the earliest planned trip, ignoring active/past', () => {
    const trips = [
      trip('2026-07-01', '2026-07-10'), // past
      trip('2026-09-01', '2026-09-10'), // later
      trip('2026-08-01', '2026-08-10'), // next
    ];
    expect(nextUpcomingVacation(trips, NOW)).toEqual(trip('2026-08-01', '2026-08-10'));
  });

  it('returns undefined when nothing is planned', () => {
    expect(nextUpcomingVacation([trip('2026-07-01', '2026-07-10')], NOW)).toBeUndefined();
  });
});

describe('featuredVacation', () => {
  it('prefers an active trip over an upcoming one', () => {
    const trips = [trip('2026-08-01', '2026-08-10'), trip('2026-07-20', '2026-07-25')];
    expect(featuredVacation(trips, NOW)).toEqual(trip('2026-07-20', '2026-07-25'));
  });

  it('falls back to the next upcoming trip when none are active', () => {
    const trips = [trip('2026-08-01', '2026-08-10')];
    expect(featuredVacation(trips, NOW)).toEqual(trip('2026-08-01', '2026-08-10'));
  });
});
