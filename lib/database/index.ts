// Database abstraction layer
// This allows easy migration to other databases later

import { Vacation, Expense, Checklist } from '@/types';

export { LocalDatabase } from './storage';
export { useVacations, useExpenses, useChecklists } from './hooks';

// Migration interfaces for future database changes
export interface DatabaseInterface {
  getVacations(): Promise<Vacation[]>;
  saveVacation(vacation: Vacation): Promise<void>;
  deleteVacation(id: string): Promise<void>;

  getExpenses(vacationId?: string): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  getChecklists(vacationId?: string): Promise<Checklist[]>;
  saveChecklist(checklist: Checklist): Promise<void>;
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