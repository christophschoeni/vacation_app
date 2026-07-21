import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types';
import {
  expenseRepository,
  type CreateExpenseInput,
} from '@/lib/db/repositories/expense-repository';
import { logger } from '@/lib/utils/logger';

/**
 * Expenses backed by SQLite.
 *
 * Replaces the former AsyncStorage-based hook. Because SQLite writes are
 * transactional per statement, the read-modify-write races that the old store
 * needed a write queue for cannot occur here.
 */
export function useExpenses(vacationId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = vacationId
        ? await expenseRepository.findByVacation(vacationId)
        : await expenseRepository.findAll();
      setExpenses(data);
    } catch (err) {
      logger.error('Failed to load expenses', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [vacationId]);

  const saveExpense = useCallback(
    async (expense: Expense) => {
      try {
        const input: CreateExpenseInput = {
          id: expense.id,
          vacationId: expense.vacationId,
          amount: expense.amount,
          currency: expense.currency,
          amountCHF: expense.amountCHF,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          imageUrl: expense.imageUrl,
          createdAt: expense.createdAt,
        };

        // Callers use this for both create and update, matching the previous
        // AsyncStorage behaviour.
        const existing = await expenseRepository.findById(expense.id);
        if (existing) {
          await expenseRepository.update(expense.id, input);
        } else {
          await expenseRepository.create(input);
        }

        await loadExpenses();
      } catch (err) {
        logger.error('Failed to save expense', err);
        setError(err instanceof Error ? err.message : 'Failed to save expense');
        throw err;
      }
    },
    [loadExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, updatedData: Partial<Expense>) => {
      try {
        const updated = await expenseRepository.update(id, updatedData);
        if (!updated) {
          throw new Error('Expense not found');
        }
        await loadExpenses();
      } catch (err) {
        logger.error('Failed to update expense', err);
        setError(err instanceof Error ? err.message : 'Failed to update expense');
        throw err;
      }
    },
    [loadExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        await expenseRepository.delete(id);
        await loadExpenses();
      } catch (err) {
        logger.error('Failed to delete expense', err);
        setError(err instanceof Error ? err.message : 'Failed to delete expense');
        throw err;
      }
    },
    [loadExpenses]
  );

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
