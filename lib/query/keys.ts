/**
 * Central query key registry.
 *
 * Every cache entry is addressed through these factories rather than through
 * inline string arrays, so an invalidation can never miss a key because of a
 * typo. Keys are hierarchical: invalidating `vacationKeys.all` also invalidates
 * every list and detail entry beneath it.
 */

export const vacationKeys = {
  all: ['vacations'] as const,
  lists: () => [...vacationKeys.all, 'list'] as const,
  list: () => [...vacationKeys.lists()] as const,
  details: () => [...vacationKeys.all, 'detail'] as const,
  detail: (id: string) => [...vacationKeys.details(), id] as const,
};

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  /**
   * Expenses of one vacation; omit the id for the global list.
   *
   * An empty string is normalised to 'all' as well: callers that pass
   * `id || ''` would otherwise produce a third, unrelated cache entry that no
   * invalidation targets, so the screen kept showing stale data.
   */
  list: (vacationId?: string) => [...expenseKeys.lists(), vacationId || 'all'] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  /** Aggregated totals per vacation, used by the vacation list. */
  totals: () => [...expenseKeys.all, 'totals'] as const,
};

export const checklistKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (vacationId?: string) => [...checklistKeys.lists(), vacationId || 'all'] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
  templates: () => [...checklistKeys.all, 'templates'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: (type?: 'expense' | 'checklist') => [...categoryKeys.all, type ?? 'all'] as const,
};

export const currencyKeys = {
  all: ['currency'] as const,
  defaultCurrency: () => [...currencyKeys.all, 'default'] as const,
  rates: (base: string) => [...currencyKeys.all, 'rates', base] as const,
};
