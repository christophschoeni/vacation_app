/**
 * SQLite Backend Implementation
 *
 * This implementation uses the existing SQLite repositories.
 * It serves as the default backend and reference implementation.
 */

import {
  IBackend,
  IVacationBackend,
  IExpenseBackend,
  IChecklistBackend,
  IAppSettingsBackend,
  BackendType,
} from '../interfaces/backend-interface';
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { expenseRepository } from '@/lib/db/repositories/expense-repository';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { appSettingsRepository } from '@/lib/db/repositories/app-settings-repository';

/**
 * SQLite implementation of IBackend
 */
export class SQLiteBackend implements IBackend {
  private _initialized = false;

  vacations: IVacationBackend;
  expenses: IExpenseBackend;
  checklists: IChecklistBackend;
  settings: IAppSettingsBackend;

  constructor() {
    // Wrap existing repositories to match interface
    this.vacations = vacationRepository as IVacationBackend;
    this.expenses = expenseRepository as IExpenseBackend;
    this.checklists = checklistRepository as IChecklistBackend;
    this.settings = appSettingsRepository as IAppSettingsBackend;
  }

  async initialize(): Promise<void> {
    // SQLite is already initialized via Drizzle migrations in app/_layout.tsx
    // This is just a formality to match the interface
    this._initialized = true;
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  // SQLite doesn't need sync - it's the local source of truth
  // These methods are optional per the interface
}
