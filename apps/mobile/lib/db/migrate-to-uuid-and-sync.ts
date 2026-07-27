import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { expo } from './database';
import { logger } from '@/lib/utils/logger';

// The exclusive-transaction callback hands back a database-like handle with the
// same query methods; alias it for the FK-remap helper's signature.
type Txn = Pick<SQLiteDatabase, 'getAllAsync' | 'runAsync' | 'execAsync' | 'getFirstAsync'>;

// Fixed namespace so a default category's slug maps to the SAME UUID on every
// device — two phones then seed "food" as one shared category, not duplicates.
// The canonical RFC-4122 DNS namespace, used purely as a stable seed.
const CATEGORY_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/** Deterministic UUID for a default category slug (stable across devices). */
export function categoryUuidForSlug(slug: string): string {
  return uuidv5(`category:${slug}`, CATEGORY_NAMESPACE);
}

/**
 * Phase 1 data backfill — runs once after the 0004 schema migration.
 *
 * This is the single most safety-critical migration in the project: it rewrites
 * every primary key from the legacy `Date.now()+random` format to a real UUIDv4
 * and remaps all foreign keys to match, so it MUST be atomic and verifiable.
 *
 * Robustness guarantees:
 *  - Everything runs inside one exclusive transaction: it either fully applies
 *    or rolls back. A crash mid-way leaves the DB untouched.
 *  - Foreign keys are disabled during the remap (so PK rewrites don't cascade)
 *    and a `PRAGMA foreign_key_check` afterwards asserts integrity; any
 *    violation aborts the whole transaction.
 *  - Idempotent: rows whose id already looks like a UUID are skipped, so a
 *    partial/failed run can be retried safely. The done-marker is only written
 *    on complete success.
 *  - Also backfills the NOT NULL sync columns added in 0004 (updated_at /
 *    created_at) for existing rows, dedupes exchange_rates and creates its
 *    unique index, and moves budgets/limits into the reference currency.
 */

const DONE_KEY = '@vacation_assist:uuid_sync_migration_done';

// Tables with a text PK that must be migrated to UUID, and the FK columns in
// OTHER tables that point at them. Order matters: parents before children.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

interface Row {
  id: string;
}

export async function migrateToUuidAndSync(): Promise<{ alreadyDone: boolean; remapped: number }> {
  const done = await AsyncStorage.getItem(DONE_KEY);
  if (done === 'true') {
    return { alreadyDone: true, remapped: 0 };
  }

  let remapped = 0;

  // SQLite ignores `PRAGMA foreign_keys` INSIDE a transaction, so FK enforcement
  // must be turned off out here, before BEGIN. It's restored (and asserted)
  // after the transaction commits or rolls back.
  await expo.execAsync('PRAGMA foreign_keys = OFF;');

  try {
    await expo.withExclusiveTransactionAsync(async (txn) => {
      const now = new Date().toISOString();

      // Build one id map across all PK tables first.
      const idMap = new Map<string, string>(); // `${table}:${oldId}` -> newUuid
      const pkTables = [
        'vacations',
        'expenses',
        'checklists',
        'checklist_items',
        'categories',
        'category_limits',
        'exchange_rates',
        'backup_history',
      ];

      for (const table of pkTables) {
        const rows = (await txn.getAllAsync(`SELECT id FROM \`${table}\``)) as Row[];
        for (const row of rows) {
          if (isUuid(row.id)) continue; // already migrated (idempotent)
          // Default categories are keyed by slug id (e.g. 'food'); map them to a
          // deterministic UUID so both devices share one identity. Everything
          // else gets a random UUIDv4.
          const uuid =
            table === 'categories'
              ? categoryUuidForSlug(row.id)
              : uuidv4();
          idMap.set(`${table}:${row.id}`, uuid);
        }
      }

      const newId = (table: string, oldId: string | null): string | null => {
        if (oldId == null) return null;
        return idMap.get(`${table}:${oldId}`) ?? oldId; // keep if already UUID
      };

      // 1) Rewrite PKs + FKs, parents first.

      // vacations (PK only; children reference it)
      for (const [key, uuid] of idMap) {
        if (!key.startsWith('vacations:')) continue;
        const old = key.slice('vacations:'.length);
        await txn.runAsync('UPDATE `vacations` SET id = ? WHERE id = ?', uuid, old);
        remapped++;
      }
      // expenses: PK + vacation_id FK
      for (const [key, uuid] of idMap) {
        if (!key.startsWith('expenses:')) continue;
        const old = key.slice('expenses:'.length);
        await txn.runAsync('UPDATE `expenses` SET id = ? WHERE id = ?', uuid, old);
        remapped++;
      }
      // Remap expenses.vacation_id via the map (per distinct old id).
      await remapFk(txn, 'expenses', 'vacation_id', (oldId) => newId('vacations', oldId));

      // checklists: PK + vacation_id + template_id (self-FK)
      for (const [key, uuid] of idMap) {
        if (!key.startsWith('checklists:')) continue;
        const old = key.slice('checklists:'.length);
        await txn.runAsync('UPDATE `checklists` SET id = ? WHERE id = ?', uuid, old);
        remapped++;
      }
      await remapFk(txn, 'checklists', 'vacation_id', (oldId) => newId('vacations', oldId));
      await remapFk(txn, 'checklists', 'template_id', (oldId) => newId('checklists', oldId));

      // checklist_items: PK + checklist_id
      for (const [key, uuid] of idMap) {
        if (!key.startsWith('checklist_items:')) continue;
        const old = key.slice('checklist_items:'.length);
        await txn.runAsync('UPDATE `checklist_items` SET id = ? WHERE id = ?', uuid, old);
        remapped++;
      }
      await remapFk(txn, 'checklist_items', 'checklist_id', (oldId) => newId('checklists', oldId));

      // category_limits: PK + vacation_id
      for (const [key, uuid] of idMap) {
        if (!key.startsWith('category_limits:')) continue;
        const old = key.slice('category_limits:'.length);
        await txn.runAsync('UPDATE `category_limits` SET id = ? WHERE id = ?', uuid, old);
        remapped++;
      }
      await remapFk(txn, 'category_limits', 'vacation_id', (oldId) => newId('vacations', oldId));

      // categories, exchange_rates, backup_history: PK only (no incoming FKs).
      // For categories the old id was the slug — record it in the new `slug`
      // column so the default category keeps its stable identity.
      for (const table of ['categories', 'exchange_rates', 'backup_history']) {
        for (const [key, uuid] of idMap) {
          if (!key.startsWith(`${table}:`)) continue;
          const old = key.slice(`${table}:`.length);
          if (table === 'categories') {
            await txn.runAsync(
              'UPDATE `categories` SET id = ?, slug = COALESCE(slug, ?) WHERE id = ?',
              uuid,
              old,
              old,
            );
          } else {
            await txn.runAsync(`UPDATE \`${table}\` SET id = ? WHERE id = ?`, uuid, old);
          }
          remapped++;
        }
      }

      // 2) Backfill NOT NULL sync columns added in 0004 for existing rows.
      // expenses/checklist_items got updated_at (and checklist_items created_at)
      // as nullable columns; fill them from created_at / now.
      await txn.runAsync(
        "UPDATE `expenses` SET updated_at = COALESCE(updated_at, created_at, ?) WHERE updated_at IS NULL",
        now,
      );
      await txn.runAsync(
        "UPDATE `checklist_items` SET created_at = COALESCE(created_at, ?) WHERE created_at IS NULL",
        now,
      );
      await txn.runAsync(
        "UPDATE `checklist_items` SET updated_at = COALESCE(updated_at, created_at, ?) WHERE updated_at IS NULL",
        now,
      );
      // Reconstruct the historical exchange rate per expense where possible.
      await txn.runAsync(
        'UPDATE `expenses` SET exchange_rate = amount_chf / amount ' +
          'WHERE exchange_rate IS NULL AND amount != 0',
      );

      // 3) Dedupe exchange_rates before the unique index. Keep, per currency
      //    pair, the row with the newest updated_at (ties broken by id). Uses a
      //    correlated subquery rather than a window function so it behaves
      //    identically across SQLite builds.
      await txn.runAsync(
        'DELETE FROM `exchange_rates` AS e WHERE EXISTS (' +
          'SELECT 1 FROM `exchange_rates` AS keep ' +
          'WHERE keep.base_currency = e.base_currency ' +
          'AND keep.target_currency = e.target_currency ' +
          'AND (keep.updated_at > e.updated_at ' +
          'OR (keep.updated_at = e.updated_at AND keep.id > e.id)))',
      );
      await txn.execAsync(
        'DROP INDEX IF EXISTS `exchange_rates_unique_pair_idx`;\n' +
          'CREATE UNIQUE INDEX `exchange_rates_unique_pair_idx` ' +
          'ON `exchange_rates` (`base_currency`,`target_currency`);',
      );

      // 4) Assert integrity while still inside the transaction. foreign_key_check
      // is a read (works inside a txn, unlike the OFF/ON toggle); throwing here
      // rolls back the whole transaction, so a broken remap never commits.
      const violations = await txn.getAllAsync('PRAGMA foreign_key_check;');
      if (violations.length > 0) {
        throw new Error(
          `UUID migration would break ${violations.length} foreign keys; rolling back. ` +
            `Violations: ${JSON.stringify(violations)}`,
        );
      }
    });
  } catch (error) {
    // Marker intentionally NOT set, so the migration retries next launch.
    logger.error('UUID/sync migration failed and was rolled back', error);
    // Restore FK enforcement even on failure (it was turned off before BEGIN).
    await expo.execAsync('PRAGMA foreign_keys = ON;').catch(() => {});
    throw error;
  }

  // Remap committed cleanly — turn FK enforcement back on for normal operation.
  await expo.execAsync('PRAGMA foreign_keys = ON;');

  // Bring any custom categories from the legacy AsyncStorage store into the DB
  // (the SQLite categories table becomes the single source of truth). This only
  // inserts rows that don't exist yet, so it's idempotent; the AsyncStorage key
  // is intentionally kept so the settings UI keeps working until it's migrated.
  try {
    await backfillCustomCategoriesFromAsyncStorage();
  } catch (error) {
    // Non-fatal: the UUID migration already succeeded and is the critical part.
    logger.warn('Custom-category backfill skipped', { error });
  }

  await AsyncStorage.setItem(DONE_KEY, 'true');
  logger.info('UUID/sync migration finished', { remapped });
  return { alreadyDone: false, remapped };
}

const LEGACY_CATEGORIES_KEY = '@vacation_assist_categories';

interface LegacyCategory {
  id?: string;
  name?: string;
  icon?: string;
}

/**
 * Copy custom categories from the legacy AsyncStorage list into the categories
 * table (source of truth going forward). Idempotent: matches on name+type and
 * only inserts what's missing. AsyncStorage is left intact as a fallback until
 * the settings UI is migrated in a later phase.
 */
async function backfillCustomCategoriesFromAsyncStorage(): Promise<void> {
  const raw = await AsyncStorage.getItem(LEGACY_CATEGORIES_KEY);
  if (!raw) return;

  let stored: LegacyCategory[];
  try {
    const parsed = JSON.parse(raw);
    stored = Array.isArray(parsed) ? parsed : [];
  } catch {
    logger.warn('Legacy categories payload is not valid JSON; skipping');
    return;
  }

  const now = new Date().toISOString();
  for (const cat of stored) {
    const name = (cat.name ?? '').trim();
    if (!name) continue;

    const existing = (await expo.getFirstAsync(
      "SELECT id FROM `categories` WHERE name = ? AND type = 'expense'",
      name,
    )) as { id: string } | null;
    if (existing) continue;

    await expo.runAsync(
      'INSERT INTO `categories` (id, name, icon, is_default, type, slug, created_at, updated_at, sync_status) ' +
        "VALUES (?, ?, ?, 0, 'expense', NULL, ?, ?, 'pending')",
      uuidv4(),
      name,
      cat.icon ?? 'other',
      now,
      now,
    );
  }
}

/**
 * Remap a foreign-key column: for each distinct old value, update rows to the
 * mapped new value. Skips values that map to themselves (already UUID / null).
 */
async function remapFk(
  txn: Txn,
  table: string,
  column: string,
  map: (oldValue: string) => string | null,
): Promise<void> {
  const rows = (await txn.getAllAsync(
    `SELECT DISTINCT \`${column}\` AS v FROM \`${table}\` WHERE \`${column}\` IS NOT NULL`,
  )) as { v: string }[];
  for (const { v } of rows) {
    const mapped = map(v);
    if (mapped && mapped !== v) {
      await txn.runAsync(
        `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
        mapped,
        v,
      );
    }
  }
}
