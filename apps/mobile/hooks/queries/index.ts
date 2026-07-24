/**
 * Data access for the app.
 *
 * Screens read and mutate exclusively through these hooks; repositories are an
 * implementation detail and should not be imported from components.
 */

export {
  useVacations,
  useVacation,
  useCreateVacation,
  useUpdateVacation,
  useDeleteVacation,
} from './use-vacations';

export {
  useExpenses,
  useExpense,
  useExpenseTotals,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from './use-expenses';

export {
  useCategoryLimits,
  useSetCategoryLimit,
  useClearCategoryLimit,
} from './use-category-limits';

export {
  useChecklists,
  useChecklist,
  useTemplates,
  useDeleteTemplate,
  useDuplicateTemplate,
  useCreateChecklist,
  useCreateChecklistFromTemplate,
  useUpdateChecklist,
  useDeleteChecklist,
  useAddChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
} from './use-checklists';
