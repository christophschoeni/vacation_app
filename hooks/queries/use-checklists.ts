import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { checklistKeys } from '@/lib/query/keys';
import { Checklist, ChecklistCategory } from '@/types';

/**
 * Collapse checklists that share a title, keeping the richest one.
 *
 * This hides duplicates rather than preventing them; the root cause is that
 * seeding could historically insert the same default list twice. Removing the
 * filter would make those duplicates visible again, so it stays until the
 * seeding path is deduplicated at the database level.
 */
function dedupeByTitle(checklists: Checklist[]): Checklist[] {
  const byTitle = new Map<string, Checklist>();

  for (const checklist of checklists) {
    const existing = byTitle.get(checklist.title);
    if (!existing) {
      byTitle.set(checklist.title, checklist);
      continue;
    }

    const currentItems = checklist.items?.length ?? 0;
    const existingItems = existing.items?.length ?? 0;
    const isRicher =
      currentItems > existingItems ||
      (currentItems === existingItems &&
        new Date(checklist.createdAt) > new Date(existing.createdAt));

    if (isRicher) {
      byTitle.set(checklist.title, checklist);
    }
  }

  return Array.from(byTitle.values());
}

export function useChecklists(vacationId?: string) {
  return useQuery({
    queryKey: checklistKeys.list(vacationId),
    queryFn: async () => {
      const lists = vacationId
        ? await checklistRepository.findByVacationId(vacationId)
        : await checklistRepository.findAll();
      return dedupeByTitle(lists);
    },
  });
}

export function useChecklist(id: string | undefined) {
  return useQuery({
    queryKey: checklistKeys.detail(id ?? ''),
    queryFn: () => checklistRepository.findById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Checklist templates.
 *
 * If none exist the defaults are seeded once and the query re-reads. This
 * recovers installs where the initial seeding failed, without a screen having
 * to drive the repair itself.
 */
export function useTemplates() {
  return useQuery({
    queryKey: checklistKeys.templates(),
    queryFn: async () => {
      const templates = await checklistRepository.findTemplates();
      if (templates.length > 0) return templates;

      await ensureDefaultTemplates();
      return checklistRepository.findTemplates();
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistRepository.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.templates() });
      queryClient.removeQueries({ queryKey: checklistKeys.detail(id) });
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistRepository.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.templates() });
    },
  });
}

/**
 * Items live inside their checklist, so any item-level change has to
 * invalidate the containing list and detail entries as well.
 */
function useChecklistInvalidation() {
  const queryClient = useQueryClient();
  return (checklistId?: string) => {
    queryClient.invalidateQueries({ queryKey: checklistKeys.lists() });
    if (checklistId) {
      queryClient.invalidateQueries({ queryKey: checklistKeys.detail(checklistId) });
    }
  };
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      vacationId?: string;
      category: ChecklistCategory;
      icon: string;
      isTemplate?: boolean;
    }) =>
      checklistRepository.create({
        title: data.title,
        vacationId: data.vacationId,
        category: data.category,
        icon: data.icon,
        isTemplate: data.isTemplate ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all });
    },
  });
}

export function useCreateChecklistFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, vacationId }: { templateId: string; vacationId: string }) =>
      checklistRepository.createFromTemplate(templateId, vacationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() });
    },
  });
}

export function useUpdateChecklist() {
  const invalidate = useChecklistInvalidation();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      checklistRepository.update(id, { title }),
    onSuccess: (_result, { id }) => invalidate(id),
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistRepository.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() });
      queryClient.removeQueries({ queryKey: checklistKeys.detail(id) });
    },
  });
}

export function useAddChecklistItem() {
  const invalidate = useChecklistInvalidation();

  return useMutation({
    mutationFn: ({
      checklistId,
      text,
      priority = 'medium',
    }: {
      checklistId: string;
      text: string;
      priority?: 'low' | 'medium' | 'high';
    }) => checklistRepository.addItem({ checklistId, text, priority }),
    onSuccess: (_result, { checklistId }) => invalidate(checklistId),
  });
}

export function useToggleChecklistItem() {
  const invalidate = useChecklistInvalidation();

  return useMutation({
    mutationFn: ({ itemId }: { checklistId: string; itemId: string }) =>
      checklistRepository.toggleItem(itemId),
    onSuccess: (_result, { checklistId }) => invalidate(checklistId),
  });
}

export function useDeleteChecklistItem() {
  const invalidate = useChecklistInvalidation();

  return useMutation({
    mutationFn: ({ itemId }: { checklistId: string; itemId: string }) =>
      checklistRepository.deleteItem(itemId),
    onSuccess: (_result, { checklistId }) => invalidate(checklistId),
  });
}
