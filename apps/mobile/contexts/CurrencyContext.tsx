import React, { createContext, useContext, ReactNode } from 'react';
import { useDefaultCurrency } from '@/hooks/use-default-currency';

interface CurrencyContextValue {
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currencyData = useDefaultCurrency();

  return (
    <CurrencyContext.Provider value={currencyData}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Static fallback for utility functions that can't use hooks
export let staticDefaultCurrency = 'CHF';

// Function to update the static currency (called from the hook)
export function updateStaticDefaultCurrency(currency: string) {
  staticDefaultCurrency = currency;
}