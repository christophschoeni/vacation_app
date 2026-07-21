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
  // vacations' budgets and the per-vacation CHF totals.
  const signature = vacations
    .map(v => `${v.id}:${v.budget ?? 0}:${v.budgetCurrency ?? 'CHF'}:${spentByVacationCHF?.get(v.id) ?? 0}`)
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
        const totalSpent = await currencyService.convertCurrency(
          spentByVacationCHF?.get(vacation.id) ?? 0,
          'CHF',
          defaultCurrency
        );

        summaries.set(vacation.id, {
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          isOverBudget: totalSpent > totalBudget,
        });
      }

      return summaries;
    },
    enabled: vacations.length > 0,
  });
}
