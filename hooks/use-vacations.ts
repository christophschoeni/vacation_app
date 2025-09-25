import { useState, useEffect, useCallback } from 'react';
import { Vacation } from '@/types';
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';

export interface UseVacationsReturn {
  vacations: Vacation[];
  loading: boolean;
  error: string | null;
  loadVacations: () => Promise<void>;
  createVacation: (data: {
    destination: string;
    country: string;
    hotel: string;
    startDate: Date;
    endDate: Date;
    budget?: number;
    currency?: string;
    imageUrl?: string;
  }) => Promise<Vacation>;
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

      console.log('🏖️ Loading vacations from SQLite...');
      const loadedVacations = await vacationRepository.findAll();

      console.log(`📊 Loaded ${loadedVacations.length} vacations from SQLite`);
      setVacations(loadedVacations);

    } catch (err) {
      console.error('❌ Failed to load vacations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vacations');
      setVacations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createVacation = useCallback(async (data: {
    destination: string;
    country: string;
    hotel: string;
    startDate: Date;
    endDate: Date;
    budget?: number;
    currency?: string;
    imageUrl?: string;
  }): Promise<Vacation> => {
    try {
      setError(null);

      console.log('🏖️ Creating vacation in SQLite...', data);
      const newVacation = await vacationRepository.create(data);

      // Reload vacations to get fresh data
      await loadVacations();

      console.log('✅ Vacation created successfully:', newVacation);
      return newVacation;

    } catch (err) {
      console.error('❌ Failed to create vacation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vacation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadVacations]);

  const updateVacation = useCallback(async (id: string, data: Partial<Vacation>): Promise<Vacation | null> => {
    try {
      setError(null);

      console.log('🏖️ Updating vacation in SQLite...', { id, data });
      const updatedVacation = await vacationRepository.update(id, data);

      if (updatedVacation) {
        // Reload vacations to get fresh data
        await loadVacations();
        console.log('✅ Vacation updated successfully:', updatedVacation);
      }

      return updatedVacation;

    } catch (err) {
      console.error('❌ Failed to update vacation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vacation';
      setError(errorMessage);
      return null;
    }
  }, [loadVacations]);

  const deleteVacation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      console.log('🏖️ Deleting vacation from SQLite...', id);
      const success = await vacationRepository.delete(id);

      if (success) {
        // Reload vacations to get fresh data
        await loadVacations();
        console.log('✅ Vacation deleted successfully');
      }

      return success;

    } catch (err) {
      console.error('❌ Failed to delete vacation:', err);
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