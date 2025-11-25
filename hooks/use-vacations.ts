import { useState, useEffect, useCallback, useRef } from 'react';
import { Vacation } from '@/types';
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { logger } from '@/lib/utils/logger';

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

// Module-level cache to share vacation data between hook instances
let cachedVacations: Vacation[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 500; // 500ms cache to prevent flicker

export function useVacations(): UseVacationsReturn {
  const [vacations, setVacations] = useState<Vacation[]>(cachedVacations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(cachedVacations.length === 0);

  const loadVacations = useCallback(async (forceRefresh = false) => {
    // Use cache if available and recent (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && cachedVacations.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      setVacations(cachedVacations);
      return;
    }

    try {
      // Only show loading indicator on first load when no cached data
      if (isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      logger.debug('🏖️ Loading vacations from SQLite...');
      const loadedVacations = await vacationRepository.findAll();

      logger.debug(`📊 Loaded ${loadedVacations.length} vacations from SQLite`);

      // Update cache
      cachedVacations = loadedVacations;
      lastFetchTime = Date.now();
      isFirstLoad.current = false;

      setVacations(loadedVacations);

    } catch (err) {
      logger.error('❌ Failed to load vacations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vacations');
      // Keep cached data on error instead of clearing
      if (cachedVacations.length === 0) {
        setVacations([]);
      }
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

      logger.debug('🏖️ Creating vacation in SQLite...', data);
      const newVacation = await vacationRepository.create(data);

      // Force reload vacations to get fresh data and update cache
      await loadVacations(true);

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
        // Force reload vacations to get fresh data and update cache
        await loadVacations(true);
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

      // Delete vacation from SQLite
      // CASCADE DELETE will automatically delete all associated expenses
      // via the foreign key constraint defined in the schema
      const success = await vacationRepository.delete(id);

      if (success) {
        // Force reload vacations to get fresh data and update cache
        await loadVacations(true);
        logger.debug('✅ Vacation deleted successfully (including all associated expenses via CASCADE DELETE)');
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
    // Force refresh to ensure fresh data
    await loadVacations(true);
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