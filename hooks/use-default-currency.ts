import { useState, useEffect, useCallback } from 'react';
import { appSettingsRepository } from '@/lib/db/repositories/app-settings-repository';
import { updateStaticDefaultCurrency } from '@/contexts/CurrencyContext';

interface UseDefaultCurrencyResult {
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook to manage the user's default currency setting systemwide
 * Provides the current default currency and a method to update it
 */
export function useDefaultCurrency(): UseDefaultCurrencyResult {
  const [defaultCurrency, setDefaultCurrencyState] = useState<string>('CHF');
  const [isLoading, setIsLoading] = useState(true);

  // Load the default currency from database
  const loadDefaultCurrency = useCallback(async () => {
    try {
      const currency = await appSettingsRepository.getDefaultCurrency();
      setDefaultCurrencyState(currency);
      updateStaticDefaultCurrency(currency);
    } catch (error) {
      console.warn('Failed to load default currency, using CHF:', error);
      setDefaultCurrencyState('CHF');
      updateStaticDefaultCurrency('CHF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update the default currency in database
  const setDefaultCurrency = useCallback(async (currency: string) => {
    try {
      await appSettingsRepository.setDefaultCurrency(currency);
      setDefaultCurrencyState(currency);
      updateStaticDefaultCurrency(currency);
    } catch (error) {
      console.error('Failed to save default currency:', error);
      throw error;
    }
  }, []);

  // Load currency on mount
  useEffect(() => {
    loadDefaultCurrency();
  }, [loadDefaultCurrency]);

  return {
    defaultCurrency,
    setDefaultCurrency,
    isLoading,
  };
}