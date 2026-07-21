import type { Vacation } from '@/types';

export type VacationStatus = 'active' | 'planned' | 'past';

/** Midnight local time, so day maths is not skewed by the current clock time. */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days from today to `date`. Negative once the date has passed.
 *
 * Both sides are floored to midnight first: comparing raw timestamps makes a
 * trip that starts tomorrow morning read as "in 0 days" when it is evening.
 */
export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / MS_PER_DAY
  );
}

/**
 * Where a vacation sits relative to today. The end date is inclusive - a trip
 * is still active on its final day.
 */
export function vacationStatus(
  vacation: Pick<Vacation, 'startDate' | 'endDate'>,
  now: Date = new Date()
): VacationStatus {
  const today = startOfDay(now).getTime();
  const start = startOfDay(new Date(vacation.startDate)).getTime();
  const end = startOfDay(new Date(vacation.endDate)).getTime();

  if (today < start) return 'planned';
  if (today > end) return 'past';
  return 'active';
}

/**
 * The trip the countdown should show: the next one that has not started yet,
 * earliest first. Returns undefined when every trip is active or past.
 */
export function nextUpcomingVacation<T extends Pick<Vacation, 'startDate' | 'endDate'>>(
  vacations: T[],
  now: Date = new Date()
): T | undefined {
  return vacations
    .filter((v) => vacationStatus(v, now) === 'planned')
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];
}

/**
 * The trip a widget or timer should feature: an in-progress trip takes
 * precedence over an upcoming one, since that is what the user is living.
 */
export function featuredVacation<T extends Pick<Vacation, 'startDate' | 'endDate'>>(
  vacations: T[],
  now: Date = new Date()
): T | undefined {
  const active = vacations
    .filter((v) => vacationStatus(v, now) === 'active')
    .sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )[0];

  return active ?? nextUpcomingVacation(vacations, now);
}
