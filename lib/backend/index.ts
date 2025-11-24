/**
 * Backend Abstraction Layer
 *
 * Export all backend-related interfaces and implementations.
 */

// Interfaces
export type {
  IBackend,
  IVacationBackend,
  IExpenseBackend,
  IChecklistBackend,
  IAppSettingsBackend,
} from './interfaces/backend-interface';

export { BackendType } from './interfaces/backend-interface';

// Factory
export { BackendFactory, getBackend } from './backend-factory';

// Implementations
export { SQLiteBackend } from './implementations/sqlite-backend';
