import { eq } from 'drizzle-orm';
import { BaseRepository } from './base-repository';
import * as schema from '../schema';

export interface AppSettings {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database row interface
interface AppSettingsRow {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export class AppSettingsRepository extends BaseRepository {

  private toDomainObject(row: AppSettingsRow): AppSettings {
    return {
      key: row.key,
      value: row.value,
      createdAt: this.stringToDate(row.createdAt),
      updatedAt: this.stringToDate(row.updatedAt),
    };
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.db
      .select()
      .from(schema.appSettings)
      .where(eq(schema.appSettings.key, key))
      .limit(1);

    if (setting.length === 0) return null;

    return setting[0].value;
  }

  async set(key: string, value: string): Promise<void> {
    const now = this.getTimestamp();

    // Try to update first
    const existing = await this.get(key);

    if (existing !== null) {
      // Update existing
      await this.db
        .update(schema.appSettings)
        .set({
          value,
          updatedAt: now,
        })
        .where(eq(schema.appSettings.key, key));
    } else {
      // Insert new
      await this.db.insert(schema.appSettings).values({
        key,
        value,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.db
      .select()
      .from(schema.appSettings);

    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }

  async setMultiple(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.appSettings)
      .where(eq(schema.appSettings.key, key));

    return true;
  }

  async clear(): Promise<void> {
    await this.db.delete(schema.appSettings);
  }

  // Helper methods for common settings
  async isMigrationCompleted(): Promise<boolean> {
    const value = await this.get('migrationCompleted');
    return value === 'true';
  }

  async setMigrationCompleted(completed: boolean): Promise<void> {
    await this.set('migrationCompleted', completed.toString());
  }

  async getDefaultCurrency(): Promise<string> {
    const value = await this.get('defaultCurrency');
    return value || 'EUR';
  }

  async setDefaultCurrency(currency: string): Promise<void> {
    await this.set('defaultCurrency', currency);
  }

  async getTheme(): Promise<string> {
    const value = await this.get('theme');
    return value || 'system';
  }

  async setTheme(theme: string): Promise<void> {
    await this.set('theme', theme);
  }

  async installDefaultSettings(defaults: Record<string, any>): Promise<void> {
    console.log('📦 Installing default app settings...');

    for (const [key, value] of Object.entries(defaults)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.set(key, stringValue);
      console.log(`✅ Set ${key}: ${stringValue}`);
    }

    console.log('📦 Default app settings installed');
  }
}

export const appSettingsRepository = new AppSettingsRepository();