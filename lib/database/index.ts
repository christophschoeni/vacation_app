// Database abstraction layer
// This allows easy migration to other databases later

export { LocalDatabase } from './storage';
export { useVacations, useExpenses, useChecklists } from './hooks';

// Migration interfaces for future database changes
export interface DatabaseInterface {
  getVacations(): Promise<any[]>;
  saveVacation(vacation: any): Promise<void>;
  deleteVacation(id: string): Promise<void>;

  getExpenses(vacationId?: string): Promise<any[]>;
  saveExpense(expense: any): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  getChecklists(vacationId?: string): Promise<any[]>;
  saveChecklist(checklist: any): Promise<void>;
  deleteChecklist(id: string): Promise<void>;
}

// Database factory for easy switching between implementations
export class DatabaseFactory {
  // Current implementation using AsyncStorage
  static getInstance(): DatabaseInterface {
    const { LocalDatabase } = require('./storage');
    return LocalDatabase;
  }

  // Future implementations can be added here
  // static getFirebaseInstance(): DatabaseInterface { ... }
  // static getSupabaseInstance(): DatabaseInterface { ... }
  // static getSQLiteInstance(): DatabaseInterface { ... }
}