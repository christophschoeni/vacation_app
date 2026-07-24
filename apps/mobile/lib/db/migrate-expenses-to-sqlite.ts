import AsyncStorage from '@react-native-async-storage/async-storage';
import { expenseRepository } from './repositories/expense-repository';
import { vacationRepository } from './repositories/vacation-repository';
import { logger } from '@/lib/utils/logger';

const LEGACY_EXPENSES_KEY = '@vacation_assist:expenses';
const MIGRATION_DONE_KEY = '@vacation_assist:expenses_migrated_to_sqlite';

interface LegacyExpense {
  id?: string;
  vacationId?: string;
  amount?: number;
  currency?: string;
  amountCHF?: number;
  category?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  createdAt?: string;
}

/**
 * Move expenses from the legacy AsyncStorage store into SQLite.
 *
 * Expenses were the last entity still living in AsyncStorage while everything
 * else had moved to SQLite. That split was the root cause of several bugs
 * (orphan cleanup comparing across two stores, lost updates from unsynchronised
 * read-modify-write). This runs once and is idempotent.
 *
 * The legacy key is intentionally NOT deleted: keeping it costs little and
 * means a failed migration can be retried or inspected.
 */
export async function migrateExpensesToSQLite(): Promise<{
  migrated: number;
  skipped: number;
  alreadyDone: boolean;
}> {
  const done = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
  if (done === 'true') {
    return { migrated: 0, skipped: 0, alreadyDone: true };
  }

  const raw = await AsyncStorage.getItem(LEGACY_EXPENSES_KEY);
  if (!raw) {
    // Nothing to migrate (fresh install). Mark done so we never look again.
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');
    return { migrated: 0, skipped: 0, alreadyDone: false };
  }

  let legacyExpenses: LegacyExpense[];
  try {
    const parsed = JSON.parse(raw);
    legacyExpenses = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // Corrupt payload: do not mark as done, so a later fix can still migrate.
    logger.error('Could not parse legacy expenses, skipping migration', error);
    return { migrated: 0, skipped: 0, alreadyDone: false };
  }

  // Only migrate expenses whose vacation still exists, otherwise the foreign
  // key would be violated.
  const vacations = await vacationRepository.findAll();
  const validVacationIds = new Set(vacations.map(v => String(v.id)));

  let migrated = 0;
  let skipped = 0;

  for (const legacy of legacyExpenses) {
    const vacationId = legacy.vacationId ? String(legacy.vacationId) : '';

    // Drop records that are unusable rather than writing broken rows.
    // Note: Number(null) is 0, so require an actual number rather than
    // coercing - otherwise a null amount would silently migrate as 0.
    const amount = legacy.amount;
    const amountCHF = legacy.amountCHF;
    if (
      !legacy.id ||
      !validVacationIds.has(vacationId) ||
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      typeof amountCHF !== 'number' ||
      !Number.isFinite(amountCHF)
    ) {
      skipped++;
      continue;
    }

    try {
      // Skip records already present, so a partial run can be repeated.
      const existing = await expenseRepository.findById(String(legacy.id));
      if (existing) {
        skipped++;
        continue;
      }

      await expenseRepository.create({
        id: String(legacy.id),
        vacationId,
        amount,
        currency: legacy.currency || 'CHF',
        amountCHF,
        category: (legacy.category as never) ?? 'other',
        description: legacy.description || '',
        date: legacy.date ? new Date(legacy.date) : new Date(),
        imageUrl: legacy.imageUrl,
        createdAt: legacy.createdAt ? new Date(legacy.createdAt) : undefined,
      });
      migrated++;
    } catch (error) {
      logger.error('Failed to migrate expense', { id: legacy.id, error });
      skipped++;
    }
  }

  await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');
  logger.info('Expense migration finished', { migrated, skipped });

  return { migrated, skipped, alreadyDone: false };
}
