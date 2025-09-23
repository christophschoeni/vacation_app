import { initializeDatabase, checkDatabaseFile, forceDatabaseSync } from './db/database';
import { migrationService } from './migration-service';
import { seedTestData, seedTemplates } from './seed-data';

export interface InitializationResult {
  success: boolean;
  databaseInitialized: boolean;
  migrationCompleted: boolean;
  error?: string;
}

class AppInitialization {
  private isInitialized = false;

  // Main initialization function called on app startup
  async initialize(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return {
        success: true,
        databaseInitialized: true,
        migrationCompleted: true,
      };
    }

    try {
      console.log('🚀 Initializing Vacation Assist...');

      // Step 1: Check database file before initialization
      console.log('🔍 Checking database file status...');
      await checkDatabaseFile();

      // Step 2: Initialize SQLite database and run migrations
      console.log('🗃️ Initializing database...');
      const databaseInitialized = await initializeDatabase();

      if (!databaseInitialized) {
        throw new Error('Database initialization failed');
      }

      // Step 3: Check database file after initialization
      console.log('🔍 Verifying database file after initialization...');
      await checkDatabaseFile();

      // Step 2: Migrate data from AsyncStorage if needed
      console.log('📦 Checking for data migration...');
      const migrationCompleted = await migrationService.migrateAsyncStorageToSQLite();

      if (!migrationCompleted) {
        console.warn('⚠️ Data migration failed, but continuing...');
      }

      // Step 3: Cleanup old AsyncStorage data (optional, after successful migration)
      if (migrationCompleted && await migrationService.isMigrationCompleted()) {
        console.log('🧹 Cleaning up old data...');
        await migrationService.cleanupAsyncStorage();
      }

      // Step 4: Seed test data if in development or if database is empty
      console.log('🌱 Seeding data...');
      await seedTemplates();
      await seedTestData();

      // Step 5: Force database sync to ensure persistence
      console.log('💾 Syncing database to disk...');
      await forceDatabaseSync();

      // Step 6: Final verification of database file
      console.log('🔍 Final database file verification...');
      await checkDatabaseFile();

      this.isInitialized = true;

      console.log('✅ App initialization completed successfully');

      return {
        success: true,
        databaseInitialized,
        migrationCompleted,
      };
    } catch (error) {
      console.error('❌ App initialization failed:', error);

      return {
        success: false,
        databaseInitialized: false,
        migrationCompleted: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get initialization status
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  // Force re-initialization (for development/testing)
  async forceReinitialization(): Promise<InitializationResult> {
    this.isInitialized = false;
    return await this.initialize();
  }

  // Get detailed status for debugging
  async getDetailedStatus(): Promise<{
    isInitialized: boolean;
    migrationStats: any;
    databaseHealth: boolean;
  }> {
    try {
      const [migrationStats, databaseHealth] = await Promise.all([
        migrationService.getMigrationStats(),
        this.checkDatabaseHealth(),
      ]);

      return {
        isInitialized: this.isInitialized,
        migrationStats,
        databaseHealth,
      };
    } catch (error) {
      console.error('Failed to get detailed status:', error);
      return {
        isInitialized: this.isInitialized,
        migrationStats: {},
        databaseHealth: false,
      };
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Import here to avoid circular dependencies
      const { isDatabaseHealthy } = await import('./db/database');
      return await isDatabaseHealthy();
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const appInitialization = new AppInitialization();