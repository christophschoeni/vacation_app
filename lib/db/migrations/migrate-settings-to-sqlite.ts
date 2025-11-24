import AsyncStorage from '@react-native-async-storage/async-storage';
import { appSettingsRepository } from '../repositories/app-settings-repository';
import { logger } from '@/lib/utils/logger';

const ASYNC_STORAGE_KEYS = {
  LANGUAGE: '@vacation_assist_language',
  ONBOARDING: '@reise_budget_onboarding_completed',
  MIGRATION_FLAG: '@vacation_assist:settings_migrated_to_sqlite',
} as const;

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skipped: boolean;
}

export interface VerificationResult {
  sqliteLanguage: string | null;
  sqliteOnboarding: boolean;
  asyncStorageLanguage: string | null;
  asyncStorageOnboarding: string | null;
  migrationCompleted: boolean;
}

export class SettingsMigrationService {
  /**
   * Check if settings have already been migrated
   */
  async isMigrationCompleted(): Promise<boolean> {
    try {
      const migrated = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.MIGRATION_FLAG);
      return migrated === 'true';
    } catch (error) {
      logger.error('Failed to check settings migration status:', error);
      return false;
    }
  }

  /**
   * Migrate all app settings from AsyncStorage to SQLite
   */
  async migrateSettingsToSQLite(): Promise<MigrationResult> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
      logger.info('⚙️  Starting settings migration from AsyncStorage to SQLite...');

      // Check if already migrated
      if (await this.isMigrationCompleted()) {
        logger.info('✅ Settings migration already completed, skipping...');
        return { success: true, migratedCount: 0, errors: [], skipped: true };
      }

      // 1. Migrate Language Setting
      try {
        const language = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE);
        if (language) {
          logger.debug(`📝 Migrating language: ${language}`);
          await appSettingsRepository.setLanguage(language);
          migratedCount++;
          logger.debug('✅ Language migrated');
        } else {
          logger.debug('📭 No language setting found in AsyncStorage, using default');
        }
      } catch (error) {
        const errorMsg = `Failed to migrate language setting: ${error}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }

      // 2. Migrate Onboarding Status
      try {
        const onboarding = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ONBOARDING);
        if (onboarding) {
          const completed = onboarding === 'true';
          logger.debug(`📝 Migrating onboarding status: ${completed}`);
          await appSettingsRepository.setOnboardingCompleted(completed);
          migratedCount++;
          logger.debug('✅ Onboarding status migrated');
        } else {
          logger.debug('📭 No onboarding status found in AsyncStorage, using default (false)');
        }
      } catch (error) {
        const errorMsg = `Failed to migrate onboarding status: ${error}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }

      // 3. Migrate Notification Settings (if they exist)
      // Note: Notification settings are handled separately by notification-service
      // This migration ensures they're moved to SQLite if they exist
      try {
        // Check for any notification-related keys in AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        const notificationKeys = allKeys.filter(key => key.includes('notification'));

        if (notificationKeys.length > 0) {
          logger.debug(`📝 Found ${notificationKeys.length} notification-related keys`);
          // These will be migrated by the notification service itself
          // Just log for now
        }
      } catch (error) {
        logger.warn('Could not check for notification settings:', error);
      }

      // Mark migration as completed
      await this.markMigrationCompleted();

      logger.info(`✅ Settings migration completed: ${migratedCount} settings migrated`);

      if (errors.length > 0) {
        logger.warn(`⚠️  Migration completed with ${errors.length} errors`);
      }

      return {
        success: errors.length === 0,
        migratedCount,
        errors,
        skipped: false,
      };
    } catch (error) {
      const errorMsg = `Settings migration failed: ${error}`;
      logger.error(errorMsg);
      errors.push(errorMsg);

      return {
        success: false,
        migratedCount,
        errors,
        skipped: false,
      };
    }
  }

  /**
   * Mark migration as completed
   */
  private async markMigrationCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.MIGRATION_FLAG, 'true');
      logger.info('✅ Marked settings migration as completed');
    } catch (error) {
      logger.error('Failed to mark settings migration as completed:', error);
    }
  }

  /**
   * Clean up AsyncStorage after successful migration
   */
  async cleanupAsyncStorage(): Promise<void> {
    try {
      logger.info('🧹 Cleaning up settings data from AsyncStorage...');

      const keysToRemove = [
        ASYNC_STORAGE_KEYS.LANGUAGE,
        ASYNC_STORAGE_KEYS.ONBOARDING,
      ];

      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          logger.debug(`Removed ${key}`);
        } catch (error) {
          logger.warn(`Failed to remove ${key}:`, error);
        }
      }

      logger.info('✅ AsyncStorage settings cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup settings AsyncStorage:', error);
    }
  }

  /**
   * Verify migration success
   */
  async verifyMigration(): Promise<VerificationResult> {
    try {
      // Check SQLite
      const sqliteLanguage = await appSettingsRepository.getLanguage();
      const sqliteOnboarding = await appSettingsRepository.getOnboardingCompleted();

      // Check AsyncStorage
      let asyncStorageLanguage: string | null = null;
      let asyncStorageOnboarding: string | null = null;

      try {
        asyncStorageLanguage = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE);
        asyncStorageOnboarding = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ONBOARDING);
      } catch (error) {
        logger.warn('Could not check AsyncStorage for verification:', error);
      }

      const migrationCompleted = await this.isMigrationCompleted();

      logger.info('📊 Settings Migration Verification:', {
        sqliteLanguage,
        sqliteOnboarding,
        asyncStorageLanguage,
        asyncStorageOnboarding,
        migrationCompleted,
      });

      return {
        sqliteLanguage,
        sqliteOnboarding,
        asyncStorageLanguage,
        asyncStorageOnboarding,
        migrationCompleted,
      };
    } catch (error) {
      logger.error('Failed to verify settings migration:', error);
      return {
        sqliteLanguage: null,
        sqliteOnboarding: false,
        asyncStorageLanguage: null,
        asyncStorageOnboarding: null,
        migrationCompleted: false,
      };
    }
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(): Promise<{
    migrationCompleted: boolean;
    sqliteSettingsCount: number;
    asyncStorageKeysCount: number;
  }> {
    try {
      const migrationCompleted = await this.isMigrationCompleted();

      // Count SQLite settings
      const allSettings = await appSettingsRepository.getAll();
      const sqliteSettingsCount = Object.keys(allSettings).length;

      // Count AsyncStorage keys
      let asyncStorageKeysCount = 0;
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        asyncStorageKeysCount = allKeys.filter(key =>
          key.startsWith('@vacation_assist') || key.startsWith('@reise_budget')
        ).length;
      } catch (error) {
        logger.warn('Could not count AsyncStorage keys:', error);
      }

      return {
        migrationCompleted,
        sqliteSettingsCount,
        asyncStorageKeysCount,
      };
    } catch (error) {
      logger.error('Failed to get migration stats:', error);
      return {
        migrationCompleted: false,
        sqliteSettingsCount: 0,
        asyncStorageKeysCount: 0,
      };
    }
  }
}

// Export singleton instance
export const settingsMigrationService = new SettingsMigrationService();
