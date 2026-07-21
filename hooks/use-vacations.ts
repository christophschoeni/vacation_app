import { useState, useEffect, useCallback } from 'react';
import { Vacation } from '@/types';
import { vacationRepository, type CreateVacationInput } from '@/lib/db/repositories/vacation-repository';
import { expenseRepository } from '@/lib/db/repositories/expense-repository';
import { logger } from '@/lib/utils/logger';

export interface UseVacationsReturn {
  vacations: Vacation[];
  loading: boolean;
  error: string | null;
  loadVacations: () => Promise<void>;
  createVacation: (data: CreateVacationInput) => Promise<Vacation>;
  updateVacation: (id: string, data: Partial<Vacation>) => Promise<Vacation | null>;
  deleteVacation: (id: string) => Promise<boolean>;
  refreshVacations: () => Promise<void>;
}

export function useVacations(): UseVacationsReturn {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVacations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.debug('🏖️ Loading vacations from SQLite...');
      const loadedVacations = await vacationRepository.findAll();

      logger.debug(`📊 Loaded ${loadedVacations.length} vacations from SQLite`);
      setVacations(loadedVacations);

    } catch (err) {
      logger.error('❌ Failed to load vacations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vacations');
      setVacations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createVacation = useCallback(async (data: CreateVacationInput): Promise<Vacation> => {
    try {
      setError(null);

      logger.debug('🏖️ Creating vacation in SQLite...', data);
      const newVacation = await vacationRepository.create(data);

      // Reload vacations to get fresh data
      await loadVacations();

      logger.debug('✅ Vacation created successfully:', newVacation);
      return newVacation;

    } catch (err) {
      logger.error('❌ Failed to create vacation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vacation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadVacations]);

  const updateVacation = useCallback(async (id: string, data: Partial<Vacation>): Promise<Vacation | null> => {
    try {
      setError(null);

      logger.debug('🏖️ Updating vacation in SQLite...', { id, data });
      const updatedVacation = await vacationRepository.update(id, data);

      if (updatedVacation) {
        // Reload vacations to get fresh data
        await loadVacations();
        logger.debug('✅ Vacation updated successfully:', updatedVacation);
      }

      return updatedVacation;

    } catch (err) {
      logger.error('❌ Failed to update vacation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vacation';
      setError(errorMessage);
      return null;
    }
  }, [loadVacations]);

  const deleteVacation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      logger.debug('🏖️ Deleting vacation from SQLite...', id);

      // Cascade delete the vacation's expenses. Both live in SQLite now, so
      // this no longer has to reconcile two separate stores.
      const deletedExpenses = await expenseRepository.deleteByVacation(id);
      logger.debug(`Deleted ${deletedExpenses} associated expenses`);

      // Delete vacation from SQLite
      const success = await vacationRepository.delete(id);

      if (success) {
        // Reload vacations to get fresh data
        await loadVacations();
        logger.debug('✅ Vacation deleted successfully');
      }

      return success;

    } catch (err) {
      logger.error('❌ Failed to delete vacation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vacation';
      setError(errorMessage);
      return false;
    }
  }, [loadVacations]);

  const refreshVacations = useCallback(async () => {
    await loadVacations();
  }, [loadVacations]);

  // Load vacations on mount
  useEffect(() => {
    loadVacations();
  }, [loadVacations]);

  return {
    vacations,
    loading,
    error,
    loadVacations,
    createVacation,
    updateVacation,
    deleteVacation,
    refreshVacations,
  };
}