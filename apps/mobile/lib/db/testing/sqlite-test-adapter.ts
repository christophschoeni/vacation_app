import Database from 'better-sqlite3';

/**
 * Wraps a real better-sqlite3 database in the subset of the expo-sqlite async
 * API that our migrations use. This lets data-layer migrations run against a
 * genuine SQLite engine in jest (Node), instead of the empty stub — so the
 * risky UUID migration is verified for real, not mocked.
 */
interface ExpoLikeDb {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getAllAsync(sql: string, ...params: unknown[]): Promise<unknown[]>;
  getFirstAsync(sql: string, ...params: unknown[]): Promise<unknown>;
  withExclusiveTransactionAsync(fn: (txn: ExpoLikeDb) => Promise<void>): Promise<void>;
}

/**
 * Apply a drizzle `.sql.js` migration body EXACTLY like the expo-sqlite migrator
 * does: split on `--> statement-breakpoint` and run each piece as its own
 * statement. A migration missing those markers will therefore only apply its
 * first statement here too — which is how a test can catch that bug (the real
 * migrator silently records the migration as done regardless).
 */
export function applyMigrationLikeExpo(db: Database.Database, sqlBody: string): void {
  const statements = sqlBody
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    db.prepare(stmt.replace(/;$/, '')).run();
  }
}

export function createExpoLikeDb(db: Database.Database): ExpoLikeDb {
  const api: ExpoLikeDb = {
    async execAsync(sql: string): Promise<void> {
      db.exec(sql);
    },
    async runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
      const info = db.prepare(sql).run(...(params as never[]));
      return { changes: info.changes, lastInsertRowId: Number(info.lastInsertRowid) };
    },
    async getAllAsync(sql: string, ...params: unknown[]): Promise<unknown[]> {
      return db.prepare(sql).all(...(params as never[]));
    },
    async getFirstAsync(sql: string, ...params: unknown[]): Promise<unknown> {
      return db.prepare(sql).get(...(params as never[])) ?? null;
    },
    async withExclusiveTransactionAsync(
      fn: (txn: ExpoLikeDb) => Promise<void>,
    ): Promise<void> {
      // better-sqlite3 transactions are sync; emulate the async exclusive txn by
      // running the callback and committing, rolling back on throw. PRAGMA
      // foreign_keys can't change inside a transaction in SQLite, so the
      // migration's OFF/ON toggles are applied outside the BEGIN here.
      db.exec('BEGIN');
      try {
        await fn(api);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return api;
}
