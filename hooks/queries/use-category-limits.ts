import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { categoryLimitKeys } from '@/lib/query/keys';
import {
  categoryLimitRepository,
  type CategoryLimit,
} from '@/lib/db/repositories/category-limit-repository';

/**
 * Per-category spending caps for one vacation, keyed by category id.
 *
 * A Map keeps the lookup in the report O(1) per row; categories without a cap
 * are simply absent rather than present with a zero, which would be
 * indistinguishable from a real limit of zero.
 */
export function useCategoryLimits(vacationId: string | undefined) {
  return useQuery({
    queryKey: categoryLimitKeys.list(vacationId),
    queryFn: async () => {
      const limits = await categoryLimitRepository.findByVacation(vacationId!);
      return new Map(limits.map((l) => [l.category, l] as const));
    },
    enabled: Boolean(vacationId),
  });
}

export function useSetCategoryLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vacationId,
      category,
      limitAmount,
    }: {
      vacationId: string;
      category: string;
      limitAmount: number;
    }): Promise<CategoryLimit> =>
      categoryLimitRepository.setLimit(vacationId, category, limitAmount),
    onSuccess: (limit) => {
      queryClient.invalidateQueries({
        queryKey: categoryLimitKeys.list(limit.vacationId),
      });
    },
  });
}

export function useClearCategoryLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vacationId,
      category,
    }: {
      vacationId: string;
      category: string;
    }) => categoryLimitRepository.clearLimit(vacationId, category),
    onSuccess: (_result, { vacationId }) => {
      queryClient.invalidateQueries({
        queryKey: categoryLimitKeys.list(vacationId),
      });
    },
  });
}
