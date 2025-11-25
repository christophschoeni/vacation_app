import { useState, useEffect, useCallback } from 'react';
import { LocalDatabase } from './storage';
import { Vacation, Expense, Checklist } from '@/types';
import { useOperationErrorHandler } from '@/hooks/useErrorHandler';

// Custom hook for vacations
export function useVacations() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleLoadError, handleSaveError, handleDeleteError } = useOperationErrorHandler();

  const loadVacations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalDatabase.getVacations();
      setVacations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vacations';
      setError(errorMessage);
      await handleLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [handleLoadError]);

  const saveVacation = useCallback(async (vacation: Vacation) => {
    try {
      await LocalDatabase.saveVacation(vacation);
      await loadVacations(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vacation';
      setError(errorMessage);
      await handleSaveError(err);
      throw err;
    }
  }, [loadVacations, handleSaveError]);

  const deleteVacation = useCallback(async (id: string) => {
    try {
      await LocalDatabase.deleteVacation(id);
      await loadVacations(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vacation';
      setError(errorMessage);
      await handleDeleteError(err);
      throw err;
    }
  }, [loadVacations, handleDeleteError]);

  useEffect(() => {
    loadVacations();
  }, [loadVacations]);

  return {
    vacations,
    loading,
    error,
    saveVacation,
    deleteVacation,
    refresh: loadVacations,
  };
}

// Custom hook for expenses
// IMPORTANT: vacationId is REQUIRED to prevent loading expenses from other vacations
export function useExpenses(vacationId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    // Validate vacationId before loading - never load without a valid ID
    if (!vacationId || vacationId.trim() === '') {
      console.warn('useExpenses: No valid vacationId provided - skipping load');
      setExpenses([]);
      setLoading(false);
      return;
    }

    // Capture current vacationId to prevent race conditions
    const currentVacationId = vacationId;

    try {
      setLoading(true);
      setError(null);
      const data = await LocalDatabase.getExpenses(currentVacationId);

      // Only update state if vacationId hasn't changed during the async operation
      // This prevents stale data from overwriting fresh data
      if (currentVacationId === vacationId) {
        // Double-check: filter expenses to ensure they belong to this vacation
        const filteredData = data.filter(expense => expense.vacationId === currentVacationId);
        if (filteredData.length !== data.length) {
          console.warn(`useExpenses: Filtered out ${data.length - filteredData.length} expenses with wrong vacationId`);
        }
        setExpenses(filteredData);
      }
    } catch (err) {
      if (currentVacationId === vacationId) {
        setError(err instanceof Error ? err.message : 'Failed to load expenses');
      }
    } finally {
      if (currentVacationId === vacationId) {
        setLoading(false);
      }
    }
  }, [vacationId]);

  const saveExpense = useCallback(async (expense: Expense) => {
    try {
      await LocalDatabase.saveExpense(expense);
      await loadExpenses(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
      throw err;
    }
  }, [loadExpenses]);

  const updateExpense = useCallback(async (id: string, updatedData: Partial<Expense>) => {
    try {
      const existing = expenses.find(e => e.id === id);
      if (!existing) {
        throw new Error('Expense not found');
      }

      const updated: Expense = {
        ...existing,
        ...updatedData,
      };

      await LocalDatabase.saveExpense(updated);
      await loadExpenses(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, [expenses, loadExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await LocalDatabase.deleteExpense(id);
      await loadExpenses(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, [loadExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    loading,
    error,
    saveExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
  };
}

// Custom hook for checklists
export function useChecklists(vacationId?: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChecklists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalDatabase.getChecklists(vacationId);
      setChecklists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }, [vacationId]);

  const saveChecklist = useCallback(async (checklist: Checklist) => {
    try {
      await LocalDatabase.saveChecklist(checklist);
      await loadChecklists(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save checklist');
      throw err;
    }
  }, [loadChecklists]);

  const deleteChecklist = useCallback(async (id: string) => {
    try {
      await LocalDatabase.deleteChecklist(id);
      await loadChecklists(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete checklist');
      throw err;
    }
  }, [loadChecklists]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  return {
    checklists,
    loading,
    error,
    saveChecklist,
    deleteChecklist,
    refresh: loadChecklists,
  };
}