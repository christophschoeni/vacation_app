import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VacationContextType {
  currentVacationId: string | null;
  setCurrentVacationId: (id: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export function VacationProvider({ children }: { children: ReactNode }) {
  const [currentVacationId, setCurrentVacationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <VacationContext.Provider value={{ currentVacationId, setCurrentVacationId, refreshTrigger, triggerRefresh }}>
      {children}
    </VacationContext.Provider>
  );
}

export function useVacationContext() {
  const context = useContext(VacationContext);
  if (context === undefined) {
    throw new Error('useVacationContext must be used within a VacationProvider');
  }
  return context;
}

// Optional hook with fallback for components that might be used outside the provider
export function useVacationId(): string | null {
  try {
    const { currentVacationId } = useVacationContext();
    return currentVacationId;
  } catch {
    return null;
  }
}
