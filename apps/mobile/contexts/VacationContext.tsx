import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VacationContextType {
  currentVacationId: string | null;
  setCurrentVacationId: (id: string | null) => void;
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export function VacationProvider({ children }: { children: ReactNode }) {
  const [currentVacationId, setCurrentVacationId] = useState<string | null>(null);

  return (
    <VacationContext.Provider value={{ currentVacationId, setCurrentVacationId }}>
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
    // Intentional: this optional accessor probes for the provider and falls
    // back to null when used outside it. The try/catch makes the hook look
    // conditional to the linter, but the call itself is unconditional.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { currentVacationId } = useVacationContext();
    return currentVacationId;
  } catch {
    return null;
  }
}
