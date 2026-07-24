import { useQuery } from '@tanstack/react-query';
import { currencyService } from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyKeys, expenseKeys } from '@/lib/query/keys';
import type { Vacation } from '@/types';

export interface BudgetSummary {
  /** Budget converted into the display currency. */
  totalBudget: number;
  /** Spend converted into the display currency. */
  totalSpent: number;
  remaining: number;
  isOverBudget: boolean;
  /**
   * Budget and spend also converted into the trip currency, shown as a small
   * secondary figure. `tripCurrency` is undefined when it equals the display
   * currency (no secondary figure needed) or when no rate was available.
   */
  totalBudgetTrip?: number;
  totalSpentTrip?: number;
  tripCurrency?: string;
}

/**
 * Budget and spend for a set of vacations, expressed in the display currency.
 *
 * Both inputs are stored in different currencies: `vacation.budget` is in the
 * vacation's `budgetCurrency`, while expense totals are accumulated in CHF
 * (`amountCHF`). Rendering either one directly under the user's display
 * currency label produces numbers that disagree with the detail screen, which
 * has always converted. Converting in one shared place keeps the vacation list
 * and the detail view consistent by construction.
 */
export function useBudgetSummaries(
  vacations: Vacation[],
  spentByVacationCHF: Map<string, number> | undefined
) {
  const { defaultCurrency } = useCurrency();

  // Keyed on the inputs that change the result: the target currency, the
  // vacations' budgets, their trip currency and the per-vacation CHF totals.
  const signature = vacations
    .map(v => `${v.id}:${v.budget ?? 0}:${v.budgetCurrency ?? 'CHF'}:${v.currency ?? 'CHF'}:${spentByVacationCHF?.get(v.id) ?? 0}`)
    .join('|');

  return useQuery({
    queryKey: [...currencyKeys.all, 'budget-summaries', defaultCurrency, signature, ...expenseKeys.totals()],
    queryFn: async () => {
      const summaries = new Map<string, BudgetSummary>();

      for (const vacation of vacations) {
        const totalBudget = await currencyService.convertCurrency(
          vacation.budget ?? 0,
          vacation.budgetCurrency || 'CHF',
          defaultCurrency
        );
        // spentByVacationCHF sums expense.amountCHF, which is captured in the
        // home currency (defaultCurrency). It is the single source of truth for
        // spend, so it is used directly - NOT re-converted from 'CHF', which
        // would drift from the expense list and corrupt a non-CHF home total.
        const totalSpent = spentByVacationCHF?.get(vacation.id) ?? 0;

        // Secondary figures in the trip currency, only when it differs from the
        // display currency. On a missing rate we simply omit them.
        const tripCurrency = vacation.currency || defaultCurrency;
        let totalBudgetTrip: number | undefined;
        let totalSpentTrip: number | undefined;
        if (tripCurrency !== defaultCurrency) {
          try {
            totalBudgetTrip = await currencyService.convertCurrency(totalBudget, defaultCurrency, tripCurrency);
            totalSpentTrip = await currencyService.convertCurrency(totalSpent, defaultCurrency, tripCurrency);
          } catch {
            totalBudgetTrip = undefined;
            totalSpentTrip = undefined;
          }
        }

        summaries.set(vacation.id, {
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          isOverBudget: totalSpent > totalBudget,
          totalBudgetTrip,
          totalSpentTrip,
          tripCurrency:
            tripCurrency !== defaultCurrency && totalBudgetTrip !== undefined
              ? tripCurrency
              : undefined,
        });
      }

      return summaries;
    },
    enabled: vacations.length > 0,
  });
}
