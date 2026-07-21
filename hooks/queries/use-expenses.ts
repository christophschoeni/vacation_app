import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  expenseRepository,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '@/lib/db/repositories/expense-repository';
import { expenseKeys, vacationKeys } from '@/lib/query/keys';

/** Expenses of one vacation, or all expenses when no id is given. */
export function useExpenses(vacationId?: string) {
  return useQuery({
    queryKey: expenseKeys.list(vacationId),
    queryFn: () =>
      vacationId
        ? expenseRepository.findByVacation(vacationId)
        : expenseRepository.findAll(),
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.detail(id ?? ''),
    queryFn: () => expenseRepository.findById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Spend total per vacation, aggregated in one grouped query.
 *
 * The vacation list renders one total per card. Calling useExpenses per card
 * would issue one query per vacation and load rows only to sum them.
 */
export function useExpenseTotals() {
  return useQuery({
    queryKey: expenseKeys.totals(),
    queryFn: () => expenseRepository.getTotalsByVacation(),
  });
}

/** Invalidate everything a changed expense can affect. */
function invalidateForExpense(
  queryClient: ReturnType<typeof useQueryClient>,
  vacationId?: string
) {
  queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
  queryClient.invalidateQueries({ queryKey: expenseKeys.totals() });
  // Budget figures on the vacation screens derive from expenses.
  if (vacationId) {
    queryClient.invalidateQueries({ queryKey: vacationKeys.detail(vacationId) });
  }
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseRepository.create(data),
    onSuccess: (expense) => invalidateForExpense(queryClient, expense.vacationId),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expenseRepository.update(id, data),
    onSuccess: (expense, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      invalidateForExpense(queryClient, expense?.vacationId);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Read before delete so the vacation's caches can be invalidated too.
      const existing = await expenseRepository.findById(id);
      await expenseRepository.delete(id);
      return existing;
    },
    onSuccess: (existing, id) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      invalidateForExpense(queryClient, existing?.vacationId);
    },
  });
}
