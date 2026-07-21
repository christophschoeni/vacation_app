---
name: data-layer
description: How this app reads and writes data - TanStack Query hooks, query keys, repositories and SQLite. Use when adding or changing a screen that loads or mutates vacations, expenses, checklists, templates or categories, when data appears stale or missing after a save, or when adding a repository method or a new query hook.
---

# Data layer

Three layers, strictly one direction:

```
screens/components  ->  hooks/queries/  ->  lib/db/repositories/  ->  SQLite (Drizzle)
```

## Non-negotiable rules

**Screens never import a repository.** They use the hooks in `hooks/queries/`.
The single accepted exception is an imperative post-write read whose result is
not rendered (`checkBudgetAndNotify` reads `getTotalSpent` to decide on a
notification). Mark such a case with a comment saying why.

**Query keys come from `lib/query/keys.ts`** — always the factories, never an
inline array. A typo in an inline key silently breaks invalidation and the
screen keeps showing stale data.

**Pass `undefined`, not `''`, for an absent id.**
`useExpenses(vacationId || '')` produced the key `['expenses','list','']` — a
separate cache entry that held *all* expenses and that no invalidation targeted.
The factories now normalise `''` to `'all'`, but the call site should still pass
`undefined`.

## Adding a query

```ts
export function useThing(id: string | undefined) {
  return useQuery({
    queryKey: thingKeys.detail(id ?? ''),
    queryFn: () => thingRepository.findById(id!),
    enabled: Boolean(id),   // do not fire with a missing id
  });
}
```

## Adding a mutation

Invalidate every key the change can affect — including keys owned by other
entities. An expense changes expense lists, the aggregated totals, and the
budget figures on the vacation screens:

```ts
export function useCreateThing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateThingInput) => thingRepository.create(data),
    onSuccess: (thing) => {
      queryClient.invalidateQueries({ queryKey: thingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: otherKeys.detail(thing.parentId) });
    },
  });
}
```

Screens call `mutateAsync` and keep their existing `try/catch` + `Alert.alert`;
it still throws, so error handling is unchanged.

## Performance rules

- **One record → `findById`.** Never `findAll()` plus a client-side `.find()`.
  Five detail screens did that and loaded every vacation to show one.
- **Per-row aggregates → one grouped query.** `VacationCard` used to call
  `useExpenses(id)` per card (N+1). Use `getTotalsByVacation()` and pass the
  value down as a prop.
- **No manual refetch on focus.** Mutations invalidate; `useFocusEffect` +
  `refresh()` is redundant. Keep `refetch()` only behind a visible
  `RefreshControl`.

## Currency — the recurring trap

Two different currencies are stored:
- `vacation.budget` is in `vacation.budgetCurrency`
- expense totals accumulate in **CHF** (`expense.amountCHF`)

Never compare or display them without converting. Use `useBudgetSummaries`,
which converts both into the display currency. Rendering a raw value under a
`defaultCurrency` label is what made the card disagree with the detail screen.

When a form is labelled with the display currency, **save that currency** as
`budgetCurrency` and convert the stored value when prefilling — otherwise
entering "1500" persists the wrong amount.

## QueryClient defaults

`lib/query/client.ts` is tuned for a local database: no retries, no refetch on
focus or reconnect, finite `staleTime`. Do not copy network-oriented defaults
into it.
