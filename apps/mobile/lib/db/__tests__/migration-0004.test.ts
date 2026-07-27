/**
 * Verifies the 0004 schema migration applies COMPLETELY when run the way the
 * expo-sqlite drizzle migrator runs it (split on `--> statement-breakpoint`).
 *
 * This guards the bug where a migration without breakpoint markers only applied
 * its first statement while still being recorded as done — leaving tables
 * missing columns like `checklists.deleted_at`.
 */
import Database from 'better-sqlite3';

import { applyMigrationLikeExpo } from '../testing/sqlite-test-adapter';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const migration0004 = require('../migrations/0004_sync_foundation.sql.js').default as string;

// Schema as it exists BEFORE 0004 (the state after 0000–0003).
function createPre0004Schema(db: Database.Database) {
  db.exec(`
    CREATE TABLE vacations (id TEXT PRIMARY KEY, updated_at TEXT NOT NULL);
    CREATE TABLE expenses (id TEXT PRIMARY KEY, amount_chf REAL);
    CREATE TABLE checklists (id TEXT PRIMARY KEY, updated_at TEXT NOT NULL);
    CREATE TABLE checklist_items (id TEXT PRIMARY KEY);
    CREATE TABLE categories (id TEXT PRIMARY KEY, updated_at TEXT NOT NULL);
    CREATE TABLE category_limits (id TEXT PRIMARY KEY, updated_at TEXT NOT NULL);
  `);
}

function columns(db: Database.Database, table: string): string[] {
  return (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
}

describe('migration 0004_sync_foundation', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    createPre0004Schema(db);
  });

  afterEach(() => db.close());

  it('has a statement-breakpoint between every statement', () => {
    const statements = migration0004
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);
    // 45 statements => 44 breakpoints. If someone adds a statement without a
    // marker, this count check and the column checks below both fail.
    expect(statements.length).toBeGreaterThanOrEqual(45);
    expect((migration0004.match(/--> statement-breakpoint/g) ?? []).length).toBe(
      statements.length - 1,
    );
  });

  it('applies fully and adds all sync columns to every table', () => {
    applyMigrationLikeExpo(db, migration0004);

    for (const table of [
      'vacations',
      'expenses',
      'checklists',
      'checklist_items',
      'categories',
      'category_limits',
    ]) {
      const cols = columns(db, table);
      expect(cols).toContain('deleted_at');
      expect(cols).toContain('sync_status');
      expect(cols).toContain('server_updated_at');
      expect(cols).toContain('created_by');
    }

    // Table-specific additions.
    expect(columns(db, 'vacations')).toContain('reference_currency');
    expect(columns(db, 'expenses')).toEqual(expect.arrayContaining(['exchange_rate', 'updated_at']));
    expect(columns(db, 'checklist_items')).toEqual(
      expect.arrayContaining(['created_at', 'updated_at']),
    );
    expect(columns(db, 'categories')).toContain('slug');

    // The outbox table exists.
    const outbox = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sync_outbox'")
      .get();
    expect(outbox).toBeTruthy();
  });
});
