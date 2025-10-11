/**
 * Cleanup Script: Remove orphaned expenses from AsyncStorage
 *
 * This script removes expenses that belong to deleted vacations.
 * Run this once to clean up existing orphaned data.
 *
 * Usage:
 * 1. Import this in your app temporarily
 * 2. Call cleanupOrphanedExpenses() once
 * 3. Remove the import
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { LocalDatabase } from '@/lib/database/storage';
import { logger } from '@/lib/utils/logger';

export async function cleanupOrphanedExpenses(): Promise<{
  totalExpenses: number;
  orphanedCount: number;
  cleanedExpenses: number;
}> {
  try {
    logger.info('🧹 Starting cleanup of orphaned expenses...');

    // Get all vacations from SQLite
    const vacations = await vacationRepository.findAll();
    const validVacationIds = new Set(vacations.map(v => String(v.id)));

    logger.info(`📊 Found ${vacations.length} vacations in SQLite`);
    logger.info(`✅ Valid vacation IDs: ${Array.from(validVacationIds).join(', ')}`);

    // Get all expenses from AsyncStorage
    const allExpenses = await LocalDatabase.getExpenses();
    logger.info(`📊 Found ${allExpenses.length} total expenses in AsyncStorage`);

    // Filter out orphaned expenses
    const validExpenses = allExpenses.filter(expense => {
      const expenseVacationId = String(expense.vacationId || '');
      const isValid = validVacationIds.has(expenseVacationId);

      if (!isValid) {
        logger.warn(`🗑️ Orphaned expense found:`, {
          id: expense.id,
          category: expense.category,
          amount: expense.amount,
          vacationId: expense.vacationId,
          description: expense.description
        });
      }

      return isValid;
    });

    const orphanedCount = allExpenses.length - validExpenses.length;

    if (orphanedCount === 0) {
      logger.info('✅ No orphaned expenses found. Database is clean!');
      return {
        totalExpenses: allExpenses.length,
        orphanedCount: 0,
        cleanedExpenses: 0
      };
    }

    // Save cleaned expenses back to AsyncStorage
    await AsyncStorage.setItem('expenses', JSON.stringify(validExpenses));

    logger.info(`✅ Cleanup complete!`);
    logger.info(`   Total expenses before: ${allExpenses.length}`);
    logger.info(`   Orphaned expenses removed: ${orphanedCount}`);
    logger.info(`   Remaining expenses: ${validExpenses.length}`);

    return {
      totalExpenses: allExpenses.length,
      orphanedCount,
      cleanedExpenses: orphanedCount
    };

  } catch (error) {
    logger.error('❌ Failed to cleanup orphaned expenses:', error);
    throw error;
  }
}

/**
 * Alternative: Clear ALL expenses (DANGER!)
 * Use only if you want to start fresh
 */
export async function clearAllExpenses(): Promise<void> {
  logger.warn('⚠️ DANGER: Clearing ALL expenses from AsyncStorage');
  await AsyncStorage.setItem('expenses', JSON.stringify([]));
  logger.info('✅ All expenses cleared');
}

/**
 * Debug: Show all expenses with their vacation IDs
 */
export async function debugExpenses(): Promise<void> {
  const allExpenses = await LocalDatabase.getExpenses();
  const vacations = await vacationRepository.findAll();
  const validVacationIds = new Set(vacations.map(v => String(v.id)));

  console.log('=== EXPENSE DEBUG ===');
  console.log('Valid Vacation IDs:', Array.from(validVacationIds));
  console.log('\nAll Expenses:');

  allExpenses.forEach((expense, idx) => {
    const isValid = validVacationIds.has(String(expense.vacationId || ''));
    console.log(`\n${idx + 1}. ${isValid ? '✅' : '❌'} ${expense.category} - ${expense.amount}`);
    console.log(`   Vacation ID: ${expense.vacationId}`);
    console.log(`   Description: ${expense.description}`);
    console.log(`   Date: ${expense.date}`);
  });

  console.log('\n===================');
}
