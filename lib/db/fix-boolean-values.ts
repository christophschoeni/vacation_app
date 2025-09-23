import { db } from './database';
import { checklistItems, checklists, categories, appSettings } from './schema';
import { sql } from 'drizzle-orm';

// Fix boolean values that might be stored incorrectly in the database
export async function fixBooleanValues(): Promise<void> {
  try {
    console.log('🔧 Fixing boolean values in database...');

    // For Drizzle with expo-sqlite, use direct SQL execution
    const database = db.$client;

    // Update checklist_items.completed: ensure 0/1 values
    await database.execAsync(`UPDATE checklist_items SET completed = CASE WHEN completed = 'true' OR completed = 1 THEN 1 ELSE 0 END`);

    // Update checklists.is_template: ensure 0/1 values
    await database.execAsync(`UPDATE checklists SET is_template = CASE WHEN is_template = 'true' OR is_template = 1 THEN 1 ELSE 0 END`);

    // Update categories.is_default: ensure 0/1 values
    await database.execAsync(`UPDATE categories SET is_default = CASE WHEN is_default = 'true' OR is_default = 1 THEN 1 ELSE 0 END`);

    // Update app_settings.notifications: ensure 0/1 values
    await database.execAsync(`UPDATE app_settings SET notifications = CASE WHEN notifications = 'true' OR notifications = 1 THEN 1 ELSE 0 END`);

    console.log('✅ Boolean values fixed successfully');
  } catch (error) {
    console.error('❌ Failed to fix boolean values:', error);
    throw error;
  }
}