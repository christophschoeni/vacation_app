import AsyncStorage from '@react-native-async-storage/async-storage';
import { expenseRepository } from '../repositories/expense-repository';
import { logger } from '@/lib/utils/logger';

const STORAGE_KEY = '@vacation_assist:expenses';
const MIGRATION_FLAG_KEY = '@vacation_assist:expenses_migrated';

interface RawExpenseData {
  id: string;
  vacationId: string;
  amount: number;
  currency: string;
  amountCHF: number;
  category: string;
  description: string;
  date: string;
  imageUrl?: string;
  createdAt: string;
}

/**
 * Migration script to move all expenses from AsyncStorage to SQLite
 * This is a one-time migration that should be run on app startup
 */
export class ExpensesMigration {

  /**
   * Check if migration has already been completed
   */
  static async isMigrationCompleted(): Promise<boolean> {
    try {
      const flag = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
      return flag === 'true';
    } catch (error) {
      logger.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as completed
   */
  private static async markMigrationCompleted(): Promise<void> {
    await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  }

  /**
   * Get all expenses from AsyncStorage
   */
  private static async getExpensesFromAsyncStorage(): Promise<RawExpenseData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const expenses = JSON.parse(data) as RawExpenseData[];
      logger.info(`Found ${expenses.length} expenses in AsyncStorage`);
      return expenses;
    } catch (error) {
      logger.error('Error reading expenses from AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Migrate a single expense to SQLite
   */
  private static async migrateExpense(expense: RawExpenseData): Promise<boolean> {
    try {
      await expenseRepository.create({
        id: expense.id,
        vacationId: expense.vacationId,
        amount: expense.amount,
        currency: expense.currency,
        amountCHF: expense.amountCHF,
        category: expense.category,
        description: expense.description,
        date: new Date(expense.date),
        imageUrl: expense.imageUrl,
      });
      return true;
    } catch (error) {
      logger.error(`Error migrating expense ${expense.id}:`, error);
      return false;
    }
  }

  /**
   * Main migration function
   * Migrates all expenses from AsyncStorage to SQLite
   * @returns Object with migration statistics
   */
  static async migrate(): Promise<{
    total: number;
    migrated: number;
    failed: number;
    skipped: boolean;
  }> {
    try {
      // Check if migration already completed
      const alreadyMigrated = await this.isMigrationCompleted();
      if (alreadyMigrated) {
        logger.info('Expenses migration already completed, skipping');
        return { total: 0, migrated: 0, failed: 0, skipped: true };
      }

      logger.info('Starting expenses migration from AsyncStorage to SQLite');

      // Get all expenses from AsyncStorage
      const expenses = await this.getExpensesFromAsyncStorage();

      if (expenses.length === 0) {
        logger.info('No expenses to migrate');
        await this.markMigrationCompleted();
        return { total: 0, migrated: 0, failed: 0, skipped: false };
      }

      // Migrate each expense
      let migrated = 0;
      let failed = 0;

      for (const expense of expenses) {
        const success = await this.migrateExpense(expense);
        if (success) {
          migrated++;
        } else {
          failed++;
        }
      }

      // Mark migration as completed
      await this.markMigrationCompleted();

      logger.info(`Migration completed: ${migrated}/${expenses.length} expenses migrated successfully, ${failed} failed`);

      return {
        total: expenses.length,
        migrated,
        failed,
        skipped: false,
      };
    } catch (error) {
      logger.error('Error during expenses migration:', error);
      throw error;
    }
  }

  /**
   * Cleanup AsyncStorage after successful migration
   * This should only be called after verifying the migration was successful
   * and you've tested that expenses work correctly in SQLite
   */
  static async cleanupAsyncStorage(): Promise<void> {
    try {
      logger.info('Cleaning up expenses from AsyncStorage');
      await AsyncStorage.removeItem(STORAGE_KEY);
      logger.info('AsyncStorage cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Verify migration by comparing counts
   * @returns true if counts match, false otherwise
   */
  static async verifyMigration(): Promise<{
    asyncStorageCount: number;
    sqliteCount: number;
    matches: boolean;
  }> {
    try {
      const asyncStorageExpenses = await this.getExpensesFromAsyncStorage();
      const sqliteExpenses = await expenseRepository.findAll();

      const asyncStorageCount = asyncStorageExpenses.length;
      const sqliteCount = sqliteExpenses.length;
      const matches = asyncStorageCount === sqliteCount;

      logger.info(`Migration verification: AsyncStorage: ${asyncStorageCount}, SQLite: ${sqliteCount}, Matches: ${matches}`);

      return {
        asyncStorageCount,
        sqliteCount,
        matches,
      };
    } catch (error) {
      logger.error('Error verifying migration:', error);
      throw error;
    }
  }

  /**
   * Reset migration flag (for testing purposes)
   * WARNING: This will cause the migration to run again on next app startup
   */
  static async resetMigrationFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MIGRATION_FLAG_KEY);
      logger.info('Migration flag reset');
    } catch (error) {
      logger.error('Error resetting migration flag:', error);
      throw error;
    }
  }
}
