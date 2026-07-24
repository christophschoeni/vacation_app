import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vacationRepository,
  type CreateVacationInput,
  type UpdateVacationInput,
} from '@/lib/db/repositories/vacation-repository';
import { expenseRepository } from '@/lib/db/repositories/expense-repository';
import { expenseKeys, vacationKeys } from '@/lib/query/keys';

/** All vacations, for the list screen. */
export function useVacations() {
  return useQuery({
    queryKey: vacationKeys.list(),
    queryFn: () => vacationRepository.findAll(),
  });
}

/**
 * A single vacation.
 *
 * Detail screens previously loaded every vacation and filtered client-side,
 * which meant each screen paid for rows it discarded.
 */
export function useVacation(id: string | undefined) {
  return useQuery({
    queryKey: vacationKeys.detail(id ?? ''),
    queryFn: () => vacationRepository.findById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVacationInput) => vacationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vacationKeys.lists() });
    },
  });
}

export function useUpdateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacationInput }) =>
      vacationRepository.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: vacationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vacationKeys.detail(id) });
    },
  });
}

export function useDeleteVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Expenses are removed explicitly rather than relying on the schema's
      // ON DELETE CASCADE alone, so the deleted count can be reported and the
      // behaviour does not depend on the foreign-key pragma being active.
      await expenseRepository.deleteByVacation(id);
      return vacationRepository.delete(id);
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: vacationKeys.all });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.removeQueries({ queryKey: vacationKeys.detail(id) });
    },
  });
}
