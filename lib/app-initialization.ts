import { categoryRepository } from './db/repositories/category-repository';
import { appSettingsRepository } from './db/repositories/app-settings-repository';
import { DEFAULT_CATEGORIES, DEFAULT_APP_SETTINGS } from './data/default-categories';
import { seedTemplates } from './seed-data';

export interface InitializationResult {
  success: boolean;
  error?: string;
}

class AppInitialization {
  private isInitialized = false;

  // Install default data after migrations are complete
  async installDefaultData(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return {
        success: true,
      };
    }

    try {
      console.log('📦 Installing default data...');

      // Check if data migration has already been completed
      const migrationCompleted = await appSettingsRepository.isMigrationCompleted();

      if (migrationCompleted) {
        console.log('ℹ️ Data migration already completed, skipping default data installation');
        this.isInitialized = true;
        return { success: true };
      }

      // Install default categories
      console.log('📁 Installing default categories...');
      await categoryRepository.installDefaultCategories(DEFAULT_CATEGORIES);

      // Install default app settings
      console.log('⚙️ Installing default app settings...');
      await appSettingsRepository.installDefaultSettings(DEFAULT_APP_SETTINGS);

      // Install templates (checklist templates, etc.)
      console.log('📋 Installing templates...');
      await seedTemplates();

      // Mark migration as completed
      await appSettingsRepository.setMigrationCompleted(true);

      this.isInitialized = true;

      console.log('✅ Default data installation completed');

      return {
        success: true,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to install default data:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Development helper to reset app state
  async reset(): Promise<void> {
    console.log('🔄 Resetting application state...');
    this.isInitialized = false;
  }

  // Force re-initialization even if already completed
  async forceReinitialization(): Promise<InitializationResult> {
    console.log('🔄 Forcing app re-initialization...');

    try {
      // Reset the migration completed flag
      await appSettingsRepository.setMigrationCompleted(false);

      // Reset initialization state
      this.isInitialized = false;

      // Run installation
      return await this.installDefaultData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to force re-initialization:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const appInitialization = new AppInitialization();