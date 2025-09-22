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
export function useExpenses(vacationId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalDatabase.getExpenses(vacationId);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
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