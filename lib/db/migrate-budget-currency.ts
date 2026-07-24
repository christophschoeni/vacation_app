import AsyncStorage from '@react-native-async-storage/async-storage';
import { vacationRepository } from './repositories/vacation-repository';
import { categoryLimitRepository } from './repositories/category-limit-repository';
import { appSettingsRepository } from './repositories/app-settings-repository';
import { currencyService } from '@/lib/currency';
import { logger } from '@/lib/utils/logger';

const MIGRATION_DONE_KEY = '@vacation_assist:budget_currency_migrated';

/**
 * Move each vacation's budget into the user's home currency.
 *
 * Background: the budget used to be entered in the trip currency, so older
 * records store `budget` in `vacation.currency` with `budgetCurrency` set to
 * that same trip currency. The app now treats `budgetCurrency` as the home
 * currency (defaultCurrency): budget is entered in the home currency and the
 * conversion pipeline assumes `budgetCurrency` is the home currency. Without
 * this migration, an old TRY budget would be re-read as if it were CHF.
 *
 * For every vacation whose `budgetCurrency` differs from the home currency we
 * convert `budget` into the home currency and set `budgetCurrency` accordingly.
 * Category limits are stored in `budgetCurrency` too, so they are converted
 * with the same rate.
 *
 * Offline-safe: conversion needs exchange rates. `currencyService.convertCurrency`
 * silently falls back to a factor of 1 when a rate is missing, which would
 * corrupt the budget. So we fetch the rate table once, and if any vacation that
 * needs converting lacks a real rate for its currency, we abort WITHOUT setting
 * the done marker — the migration is retried on the next launch (e.g. once
 * online). Records that can be converted are still migrated in that same run.
 */
export async function migrateBudgetCurrency(): Promise<{
  migrated: number;
  deferred: number;
  alreadyDone: boolean;
}> {
  const done = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
  if (done === 'true') {
    return { migrated: 0, deferred: 0, alreadyDone: true };
  }

  const vacations = await vacationRepository.findAll();
  const homeCurrency = await appSettingsRepository.getDefaultCurrency();

  // Nothing stored in a foreign currency → mark done and never look again.
  const needsWork = vacations.filter(
    (v) => (v.budgetCurrency || 'CHF') !== homeCurrency
  );
  if (needsWork.length === 0) {
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');
    return { migrated: 0, deferred: 0, alreadyDone: false };
  }

  // Fetch the rate table once so we can tell a real rate from the 1.0 fallback.
  // Rates are CHF-based; a currency with no entry has no real rate.
  const rates = await currencyService.getExchangeRates('CHF');
  const hasRealRate = (currency: string) =>
    currency === 'CHF' || typeof rates[currency] === 'number';

  let migrated = 0;
  let deferred = 0;

  for (const vacation of needsWork) {
    const stored = vacation.budgetCurrency || 'CHF';

    // Defer if we cannot convert this one accurately (missing rate).
    if (!hasRealRate(stored) || !hasRealRate(homeCurrency)) {
      deferred++;
      continue;
    }

    try {
      const newBudget =
        vacation.budget != null
          ? await currencyService.convertCurrency(vacation.budget, stored, homeCurrency)
          : vacation.budget;

      await vacationRepository.update(vacation.id, {
        budget: newBudget ?? undefined,
        budgetCurrency: homeCurrency,
      });

      // Category limits are stored in the same (old) budgetCurrency.
      const limits = await categoryLimitRepository.findByVacation(vacation.id);
      for (const limit of limits) {
        const converted = await currencyService.convertCurrency(
          limit.limitAmount,
          stored,
          homeCurrency
        );
        await categoryLimitRepository.setLimit(vacation.id, limit.category, converted);
      }

      migrated++;
    } catch (error) {
      logger.warn('Budget-currency migration: failed for one vacation, deferring', {
        vacationId: vacation.id,
        error,
      });
      deferred++;
    }
  }

  // Only mark done when everything that needed converting was converted.
  // Otherwise leave the marker unset so a later launch (online) retries the rest.
  if (deferred === 0) {
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');
  } else {
    logger.warn('Budget-currency migration deferred some records (missing rates)', {
      migrated,
      deferred,
    });
  }

  return { migrated, deferred, alreadyDone: false };
}
