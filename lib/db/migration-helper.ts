import { expo } from './database';
import { logger } from '../utils/logger';

/**
 * Manual migration helper to add currency column to vacations table
 * This should only be run once
 */
export function addCurrencyColumnIfNeeded() {
  try {
    logger.info('🔧 [Migration] Checking if currency column needs to be added...');

    // Check if currency column exists
    const tableInfo = expo.getAllSync('PRAGMA table_info(vacations)') as any[];
    logger.debug('[Migration] Vacations table columns:', tableInfo.map((c: any) => c.name));

    const hasCurrency = tableInfo.some((col: any) => col.name === 'currency');

    if (!hasCurrency) {
      logger.info('🔧 [Migration] Adding currency column to vacations table...');
      expo.execSync('ALTER TABLE vacations ADD COLUMN currency text DEFAULT "CHF"');
      logger.info('✅ [Migration] Currency column added successfully');
      return true;
    } else {
      logger.info('✅ [Migration] Currency column already exists');
      return false;
    }
  } catch (error) {
    logger.error('❌ [Migration] Failed to add currency column:', error);
    // Don't throw, just log - we don't want to block app initialization
    return false;
  }
}
