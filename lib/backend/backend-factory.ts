/**
 * Backend Factory
 *
 * Creates and manages backend instances.
 * This allows easy switching between SQLite, Supabase, or hybrid backends.
 */

import { IBackend, BackendType } from './interfaces/backend-interface';
import { SQLiteBackend } from './implementations/sqlite-backend';

/**
 * Singleton Backend Factory
 */
class BackendFactory {
  private static instance: IBackend | null = null;
  private static currentType: BackendType = BackendType.SQLITE;

  /**
   * Get the current backend instance
   */
  static getInstance(): IBackend {
    if (!this.instance) {
      this.instance = this.createBackend(this.currentType);
    }
    return this.instance;
  }

  /**
   * Create a backend of the specified type
   */
  private static createBackend(type: BackendType): IBackend {
    switch (type) {
      case BackendType.SQLITE:
        return new SQLiteBackend();

      case BackendType.SUPABASE:
        // Future implementation
        throw new Error('Supabase backend not yet implemented');

      case BackendType.HYBRID:
        // Future implementation
        throw new Error('Hybrid backend not yet implemented');

      default:
        throw new Error(`Unknown backend type: ${type}`);
    }
  }

  /**
   * Switch to a different backend type
   * Warning: This will reset the backend instance!
   */
  static async switchBackend(type: BackendType): Promise<void> {
    this.currentType = type;
    this.instance = this.createBackend(type);
    await this.instance.initialize();
  }

  /**
   * Get the current backend type
   */
  static getCurrentType(): BackendType {
    return this.currentType;
  }

  /**
   * Reset the factory (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.currentType = BackendType.SQLITE;
  }
}

/**
 * Convenience function to get the current backend
 */
export function getBackend(): IBackend {
  return BackendFactory.getInstance();
}

export { BackendFactory, BackendType };
