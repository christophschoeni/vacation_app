import AsyncStorage from '@react-native-async-storage/async-storage';
import { checklistRepository } from './db/repositories/checklist-repository';
import { DEFAULT_TEMPLATES } from './checklist-service';
import { db } from './db/database';
import * as schema from './db/schema';

class MigrationService {
  private readonly MIGRATION_FLAG = '@vacation_assist_migrated_to_sqlite';

  // Check if migration has already been completed
  async isMigrationCompleted(): Promise<boolean> {
    try {
      const migrated = await AsyncStorage.getItem(this.MIGRATION_FLAG);
      return migrated === 'true';
    } catch (error) {
      console.error('Failed to check migration status:', error);
      return false;
    }
  }

  // Mark migration as completed
  private async markMigrationCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.MIGRATION_FLAG, 'true');
    } catch (error) {
      console.error('Failed to mark migration as completed:', error);
    }
  }

  // Main migration function
  async migrateAsyncStorageToSQLite(): Promise<boolean> {
    try {
      console.log('🔄 Starting AsyncStorage to SQLite migration...');

      // Check if migration already completed
      if (await this.isMigrationCompleted()) {
        console.log('✅ Migration already completed, skipping...');
        return true;
      }

      // Migrate checklists and templates
      await this.migrateChecklists();

      // Initialize default templates if none exist
      await this.initializeDefaultTemplates();

      // Initialize default app settings
      await this.initializeAppSettings();

      // Mark migration as completed
      await this.markMigrationCompleted();

      console.log('✅ Migration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  }

  // Migrate checklists from AsyncStorage
  private async migrateChecklists(): Promise<void> {
    try {
      console.log('📋 Migrating checklists...');

      const stored = await AsyncStorage.getItem('@vacation_assist_checklists');
      if (!stored) {
        console.log('No checklists found in AsyncStorage');
        return;
      }

      const asyncChecklists = JSON.parse(stored);
      let migratedCount = 0;

      for (const asyncChecklist of asyncChecklists) {
        try {
          // Create checklist in SQLite
          const checklist = await checklistRepository.create({
            title: asyncChecklist.title || 'Untitled',
            description: asyncChecklist.description,
            isTemplate: asyncChecklist.isTemplate || false,
            vacationId: asyncChecklist.vacationId,
            templateId: asyncChecklist.templateId,
            category: asyncChecklist.category || 'general',
            icon: asyncChecklist.icon || 'check',
          });

          // Migrate checklist items
          if (asyncChecklist.items && Array.isArray(asyncChecklist.items)) {
            for (const item of asyncChecklist.items) {
              await checklistRepository.addItem({
                checklistId: checklist.id,
                text: item.text || '',
                notes: item.notes,
                priority: item.priority || 'medium',
                dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
                quantity: item.quantity,
                order: item.order || 0,
              });

              // If item was completed, update it
              if (item.completed) {
                await checklistRepository.updateItem(item.id, {
                  completed: true,
                });
              }
            }
          }

          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate checklist "${asyncChecklist.title}":`, error);
        }
      }

      console.log(`✅ Migrated ${migratedCount} checklists`);
    } catch (error) {
      console.error('Failed to migrate checklists:', error);
      throw error;
    }
  }

  // Initialize default templates if none exist
  private async initializeDefaultTemplates(): Promise<void> {
    try {
      console.log('📚 Checking for default templates...');

      const existingTemplates = await checklistRepository.findTemplates();
      if (existingTemplates.length > 0) {
        console.log(`Found ${existingTemplates.length} existing templates, skipping initialization`);
        return;
      }

      console.log('📚 Initializing default templates...');

      for (const template of DEFAULT_TEMPLATES) {
        try {
          const createdTemplate = await checklistRepository.create({
            title: template.title,
            description: template.description,
            isTemplate: true,
            category: template.category,
            icon: template.icon,
          });

          // Add template items
          for (const item of template.items) {
            await checklistRepository.addItem({
              checklistId: createdTemplate.id,
              text: item.text,
              priority: item.priority,
              order: item.order,
            });
          }
        } catch (error) {
          console.error(`Failed to create template "${template.title}":`, error);
        }
      }

      console.log(`✅ Initialized ${DEFAULT_TEMPLATES.length} default templates`);
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
      throw error;
    }
  }

  // Initialize default app settings
  private async initializeAppSettings(): Promise<void> {
    try {
      console.log('⚙️ Initializing app settings...');

      const existingSettings = await db
        .select()
        .from(schema.appSettings)
        .limit(1);

      if (existingSettings.length > 0) {
        console.log('Settings already exist, skipping initialization');
        return;
      }

      await db.insert(schema.appSettings).values({
        id: 'default',
        defaultCurrency: 'CHF',
        language: 'de',
        notifications: true,
        theme: 'auto',
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Initialized default app settings');
    } catch (error) {
      console.error('Failed to initialize app settings:', error);
      throw error;
    }
  }

  // Clean up AsyncStorage after successful migration (optional)
  async cleanupAsyncStorage(): Promise<void> {
    try {
      console.log('🧹 Cleaning up AsyncStorage...');

      const keysToRemove = [
        '@vacation_assist_checklists',
        '@vacation_assist_checklist_templates',
      ];

      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`Removed ${key}`);
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error);
        }
      }

      console.log('✅ AsyncStorage cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup AsyncStorage:', error);
    }
  }

  // Get migration statistics
  async getMigrationStats(): Promise<{
    isMigrated: boolean;
    sqliteRecords: any;
    asyncStorageKeys: string[];
  }> {
    try {
      const [isMigrated, sqliteRecords] = await Promise.all([
        this.isMigrationCompleted(),
        this.getSQLiteRecordCounts(),
      ]);

      const asyncStorageKeys = await this.getAsyncStorageKeys();

      return {
        isMigrated,
        sqliteRecords,
        asyncStorageKeys,
      };
    } catch (error) {
      console.error('Failed to get migration stats:', error);
      return {
        isMigrated: false,
        sqliteRecords: {},
        asyncStorageKeys: [],
      };
    }
  }

  private async getSQLiteRecordCounts(): Promise<any> {
    try {
      const [
        checklists,
        checklistItems,
        appSettings,
      ] = await Promise.all([
        db.select().from(schema.checklists),
        db.select().from(schema.checklistItems),
        db.select().from(schema.appSettings),
      ]);

      return {
        checklists: checklists.length,
        checklistItems: checklistItems.length,
        appSettings: appSettings.length,
        templates: checklists.filter(c => c.isTemplate).length,
      };
    } catch (error) {
      console.error('Failed to get SQLite record counts:', error);
      return {};
    }
  }

  private async getAsyncStorageKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.startsWith('@vacation_assist'));
    } catch (error) {
      console.error('Failed to get AsyncStorage keys:', error);
      return [];
    }
  }
}

export const migrationService = new MigrationService();