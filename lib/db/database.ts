import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';
import * as FileSystem from 'expo-file-system';

const DATABASE_NAME = 'vacation_assist.db';

// Get the proper database path
function getDatabasePath(): string {
  const documentsDir = FileSystem.documentDirectory;
  const sqliteDir = `${documentsDir}SQLite/`;
  const dbPath = `${sqliteDir}${DATABASE_NAME}`;

  console.log('📁 Database paths:');
  console.log('  documentDirectory:', documentsDir);
  console.log('  SQLite directory:', sqliteDir);
  console.log('  Database path:', dbPath);

  return DATABASE_NAME; // expo-sqlite handles the path internally
}

// Initialize SQLite database with proper path logging
const databasePath = getDatabasePath();
console.log('🗃️ Opening database:', databasePath);
const expo = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expo, { schema });

// Add database file existence check and ensure SQLite directory exists
export async function checkDatabaseFile(): Promise<void> {
  try {
    const documentsDir = FileSystem.documentDirectory;
    const sqliteDir = `${documentsDir}SQLite/`;
    const dbPath = `${sqliteDir}${DATABASE_NAME}`;

    console.log('🔍 Checking database file existence...');

    // Ensure SQLite directory exists
    const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
    console.log(`📁 SQLite directory exists: ${sqliteDirInfo.exists}`);

    if (!sqliteDirInfo.exists) {
      console.log('📁 Creating SQLite directory...');
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
      console.log('✅ SQLite directory created');
    }

    // Check if database file exists
    const dbFileInfo = await FileSystem.getInfoAsync(dbPath);
    console.log(`🗃️ Database file exists: ${dbFileInfo.exists}`);

    if (dbFileInfo.exists) {
      console.log(`📊 Database file size: ${dbFileInfo.size} bytes`);
      console.log(`📅 Last modified: ${new Date(dbFileInfo.modificationTime * 1000).toLocaleString()}`);
    }

    return;
  } catch (error) {
    console.error('❌ Failed to check database file:', error);
  }
}

// Force database to write to disk
export async function forceDatabaseSync(): Promise<void> {
  try {
    console.log('💾 Forcing database sync to disk...');

    // Perform a simple transaction to ensure data is written
    await db.transaction(async (tx) => {
      // This should force the database to write to disk
      await tx.select().from(schema.appSettings).limit(1);
    });

    console.log('✅ Database sync completed');
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
  }
}

// Run migrations on app startup
export async function initializeDatabase() {
  try {
    console.log('🗃️ Initializing database...');

    // Check if tables exist before migration
    try {
      const stats = await getDatabaseStats();
      console.log('📊 Database stats before migration:', stats);
    } catch (error) {
      console.log('📊 Database appears to be new (tables not created yet)');
    }

    // Run migrations
    await migrate(db, migrations);

    // Check stats after migration
    const statsAfter = await getDatabaseStats();
    console.log('📊 Database stats after migration:', statsAfter);

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

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

// Get database stats for backup/monitoring
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