import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'vacation_assist_v2.db'; // Changed database name to force fresh start

// Initialize SQLite database with Drizzle
export const expo = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expo, { schema });

// Get database instance (for direct queries if needed)
export function getDatabase() {
  return db;
}

// Database health check
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    // Simple query to check if database is accessible
    await db.select().from(schema.appSettings).limit(1);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Get database stats for debugging
export async function getDatabaseStats() {
  try {
    const [
      vacationCount,
      expenseCount,
      checklistCount,
      checklistItemCount,
    ] = await Promise.all([
      db.select().from(schema.vacations).then(rows => rows.length),
      db.select().from(schema.expenses).then(rows => rows.length),
      db.select().from(schema.checklists).then(rows => rows.length),
      db.select().from(schema.checklistItems).then(rows => rows.length),
    ]);

    return {
      vacations: vacationCount,
      expenses: expenseCount,
      checklists: checklistCount,
      checklistItems: checklistItemCount,
      totalRecords: vacationCount + expenseCount + checklistCount + checklistItemCount,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}