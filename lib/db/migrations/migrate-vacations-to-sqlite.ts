import AsyncStorage from '@react-native-async-storage/async-storage';
import { vacationRepository } from '../repositories/vacation-repository';
import { logger } from '@/lib/utils/logger';

interface RawVacationData {
  id: string;
  destination: string;
  country: string;
  hotel: string;
  startDate: string;
  endDate: string;
  budget?: number;
  budgetCurrency?: string;
  currency: string;
  expenses: string[];
  checklists: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  VACATIONS: '@vacation_assist:vacations',
  MIGRATION_FLAG: '@vacation_assist:vacations_migrated_to_sqlite',
} as const;

export class VacationMigrationService {
  /**
   * Check if vacations have already been migrated
   */
  async isMigrationCompleted(): Promise<boolean> {
    try {
      const migrated = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATION_FLAG);
      return migrated === 'true';
    } catch (error) {
      logger.error('Failed to check vacation migration status:', error);
      return false;
    }
  }

  /**
   * Migrate vacations from AsyncStorage to SQLite
   */
  async migrateVacationsToSQLite(): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
      logger.info('🏖️  Starting vacation migration from AsyncStorage to SQLite...');

      // Check if already migrated
      if (await this.isMigrationCompleted()) {
        logger.info('✅ Vacation migration already completed, skipping...');
        return { success: true, migratedCount: 0, errors: [] };
      }

      // Get vacations from AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VACATIONS);
      if (!stored) {
        logger.info('📭 No vacations found in AsyncStorage');
        await this.markMigrationCompleted();
        return { success: true, migratedCount: 0, errors: [] };
      }

      const asyncVacations = JSON.parse(stored) as RawVacationData[];
      logger.info(`📊 Found ${asyncVacations.length} vacations in AsyncStorage`);

      // Check if vacations already exist in SQLite
      const existingVacations = await vacationRepository.findAll();
      if (existingVacations.length > 0) {
        logger.warn(`⚠️  SQLite already contains ${existingVacations.length} vacations. Skipping migration to avoid duplicates.`);
        await this.markMigrationCompleted();
        return { success: true, migratedCount: 0, errors: ['SQLite already contains vacations'] };
      }

      // Migrate each vacation
      for (const asyncVacation of asyncVacations) {
        try {
          logger.debug(`📝 Migrating vacation: ${asyncVacation.destination}`);

          await vacationRepository.create({
            id: asyncVacation.id,
            destination: asyncVacation.destination,
            country: asyncVacation.country,
            hotel: asyncVacation.hotel,
            startDate: new Date(asyncVacation.startDate),
            endDate: new Date(asyncVacation.endDate),
            budget: asyncVacation.budget,
            budgetCurrency: asyncVacation.budgetCurrency || 'CHF',
            currency: asyncVacation.currency || 'CHF',
            imageUrl: asyncVacation.imageUrl,
          });

          migratedCount++;
          logger.debug(`✅ Migrated: ${asyncVacation.destination}`);
        } catch (error) {
          const errorMsg = `Failed to migrate vacation "${asyncVacation.destination}": ${error}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Mark migration as completed
      await this.markMigrationCompleted();

      logger.info(`✅ Vacation migration completed: ${migratedCount}/${asyncVacations.length} vacations migrated`);

      if (errors.length > 0) {
        logger.warn(`⚠️  Migration completed with ${errors.length} errors`);
      }

      return {
        success: errors.length < asyncVacations.length,
        migratedCount,
        errors,
      };
    } catch (error) {
      const errorMsg = `Vacation migration failed: ${error}`;
      logger.error(errorMsg);
      errors.push(errorMsg);

      return {
        success: false,
        migratedCount,
        errors,
      };
    }
  }

  /**
   * Mark migration as completed
   */
  private async markMigrationCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MIGRATION_FLAG, 'true');
      logger.info('✅ Marked vacation migration as completed');
    } catch (error) {
      logger.error('Failed to mark vacation migration as completed:', error);
    }
  }

  /**
   * Clean up AsyncStorage after successful migration
   */
  async cleanupAsyncStorage(): Promise<void> {
    try {
      logger.info('🧹 Cleaning up vacation data from AsyncStorage...');

      // Keep the migration flag, only remove the actual vacation data
      await AsyncStorage.removeItem(STORAGE_KEYS.VACATIONS);

      logger.info('✅ AsyncStorage vacation cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup vacation AsyncStorage:', error);
    }
  }

  /**
   * Verify migration success
   */
  async verifyMigration(): Promise<{
    sqliteCount: number;
    asyncStorageCount: number;
    migrationCompleted: boolean;
  }> {
    try {
      const sqliteVacations = await vacationRepository.findAll();

      let asyncStorageCount = 0;
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VACATIONS);
      if (stored) {
        const asyncVacations = JSON.parse(stored);
        asyncStorageCount = asyncVacations.length;
      }

      const migrationCompleted = await this.isMigrationCompleted();

      logger.info('📊 Migration Verification:', {
        sqliteCount: sqliteVacations.length,
        asyncStorageCount,
        migrationCompleted,
      });

      return {
        sqliteCount: sqliteVacations.length,
        asyncStorageCount,
        migrationCompleted,
      };
    } catch (error) {
      logger.error('Failed to verify migration:', error);
      return {
        sqliteCount: 0,
        asyncStorageCount: 0,
        migrationCompleted: false,
      };
    }
  }
}

// Export singleton instance
export const vacationMigrationService = new VacationMigrationService();
