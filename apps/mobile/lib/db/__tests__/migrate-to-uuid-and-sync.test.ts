/**
 * Real-SQLite test for the UUID + sync-foundation backfill — the riskiest
 * migration in the project. Runs against better-sqlite3 (a genuine engine),
 * not the jest stub, so it actually verifies data integrity.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- require() after
   jest.resetModules() is the idiomatic way to re-import the module-under-test
   with fresh mocks between cases. */
import Database from 'better-sqlite3';

import { createExpoLikeDb } from '../testing/sqlite-test-adapter';

// The migration module imports `expo` from ../database and AsyncStorage. We
// mock both so the module talks to our in-memory better-sqlite3 instead.
//
// jest.mock factories are hoisted above the file's variables and may not close
// over out-of-scope names, so the shared state lives on globalThis and the
// factories read it lazily at call time.
declare global {
   
  var __asyncStore: Record<string, string>;
   
  var __testExpo: ReturnType<typeof createExpoLikeDb> | undefined;
}
globalThis.__asyncStore = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => globalThis.__asyncStore[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    globalThis.__asyncStore[k] = v;
  }),
}));

jest.mock('../database', () => ({
  get expo() {
    return globalThis.__testExpo;
  },
}));

// expo-crypto's native randomUUID returns undefined under jest (no native
// module). Back it with Node's real crypto so the migration gets real UUIDs —
// otherwise the id map fills with undefined and nothing is a fair test.
jest.mock('expo-crypto', () => ({
  randomUUID: () => require('crypto').randomUUID(),
}));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Minimal schema mirroring the state AFTER migration 0004 has run: legacy tables
// plus the new sync columns (nullable, as the ALTER TABLE adds them).
function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE vacations (
      id TEXT PRIMARY KEY, destination TEXT NOT NULL, country TEXT NOT NULL,
      hotel TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      budget REAL, budget_currency TEXT NOT NULL DEFAULT 'CHF',
      currency TEXT NOT NULL DEFAULT 'CHF', reference_currency TEXT NOT NULL DEFAULT 'CHF',
      image_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT
    );
    CREATE TABLE expenses (
      id TEXT PRIMARY KEY, vacation_id TEXT NOT NULL, amount REAL NOT NULL,
      currency TEXT NOT NULL, amount_chf REAL NOT NULL, exchange_rate REAL,
      category TEXT NOT NULL, description TEXT NOT NULL, date TEXT NOT NULL,
      image_url TEXT, created_at TEXT NOT NULL, updated_at TEXT,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT,
      FOREIGN KEY (vacation_id) REFERENCES vacations(id) ON DELETE CASCADE
    );
    CREATE TABLE checklists (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      is_template INTEGER NOT NULL DEFAULT 0, vacation_id TEXT, template_id TEXT,
      category TEXT NOT NULL, icon TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT,
      FOREIGN KEY (vacation_id) REFERENCES vacations(id) ON DELETE CASCADE,
      FOREIGN KEY (template_id) REFERENCES checklists(id) ON DELETE SET NULL
    );
    CREATE TABLE checklist_items (
      id TEXT PRIMARY KEY, checklist_id TEXT NOT NULL, text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0, notes TEXT,
      priority TEXT NOT NULL DEFAULT 'medium', due_date TEXT, quantity INTEGER,
      "order" INTEGER NOT NULL DEFAULT 0, created_at TEXT, updated_at TEXT,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT,
      FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
    );
    CREATE TABLE categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL, slug TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT
    );
    CREATE TABLE category_limits (
      id TEXT PRIMARY KEY, vacation_id TEXT NOT NULL, category TEXT NOT NULL,
      limit_amount REAL NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      server_updated_at TEXT, created_by TEXT,
      FOREIGN KEY (vacation_id) REFERENCES vacations(id) ON DELETE CASCADE
    );
    CREATE TABLE exchange_rates (
      id TEXT PRIMARY KEY, base_currency TEXT NOT NULL, target_currency TEXT NOT NULL,
      rate REAL NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE backup_history (
      id TEXT PRIMARY KEY, file_name TEXT NOT NULL, file_size INTEGER NOT NULL,
      record_count INTEGER NOT NULL, backup_type TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
}

describe('migrateToUuidAndSync', () => {
  let db: Database.Database;

  beforeEach(() => {
    jest.resetModules();
    globalThis.__asyncStore = {};
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    createSchema(db);
    globalThis.__testExpo = createExpoLikeDb(db);
  });

  afterEach(() => db.close());

  function seedLegacy() {
    // Legacy ids: Date.now()+random style (NOT uuids).
    db.exec(`
      INSERT INTO vacations (id, destination, country, hotel, start_date, end_date, budget, created_at, updated_at)
      VALUES ('1758659421412abc', 'Lisbon', 'PT', 'Hotel', '2026-08-01', '2026-08-10', 2000, '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z');
      INSERT INTO expenses (id, vacation_id, amount, currency, amount_chf, category, description, date, created_at)
      VALUES ('1758659500000xyz', '1758659421412abc', 50, 'EUR', 47.5, 'food', 'Dinner', '2026-08-02', '2026-08-02T00:00:00Z');
      INSERT INTO checklists (id, title, category, icon, created_at, updated_at)
      VALUES ('1758659600000t01', 'Packing', 'packing', 'bag', '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z');
      INSERT INTO checklists (id, title, vacation_id, template_id, category, icon, created_at, updated_at)
      VALUES ('1758659600001t02', 'Trip list', '1758659421412abc', '1758659600000t01', 'packing', 'bag', '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z');
      INSERT INTO checklist_items (id, checklist_id, text)
      VALUES ('1758659700000i01', '1758659600001t02', 'Passport');
      INSERT INTO categories (id, name, icon, is_default, type, created_at, updated_at)
      VALUES ('food', 'Food', 'restaurant', 1, 'expense', '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z');
      INSERT INTO exchange_rates (id, base_currency, target_currency, rate, source, created_at, updated_at)
      VALUES ('r1', 'CHF', 'EUR', 0.95, 'api', '2026-07-01', '2026-07-01T00:00:00Z');
      INSERT INTO exchange_rates (id, base_currency, target_currency, rate, source, created_at, updated_at)
      VALUES ('r2', 'CHF', 'EUR', 0.96, 'api', '2026-07-01', '2026-07-02T00:00:00Z');
    `);
  }

  it('migrates all ids to UUID and keeps foreign keys intact', async () => {
    seedLegacy();
    const { migrateToUuidAndSync } = require('../migrate-to-uuid-and-sync');
    const result = await migrateToUuidAndSync();

    expect(result.alreadyDone).toBe(false);
    expect(result.remapped).toBeGreaterThan(0);

    // Every PK is now a UUID.
    for (const table of ['vacations', 'expenses', 'checklists', 'checklist_items', 'categories']) {
      const rows = db.prepare(`SELECT id FROM ${table}`).all() as { id: string }[];
      for (const r of rows) expect(r.id).toMatch(UUID_RE);
    }

    // FKs still resolve: the expense points at the (now-UUID) vacation.
    const expense = db.prepare('SELECT vacation_id FROM expenses').get() as { vacation_id: string };
    const vacation = db.prepare('SELECT id FROM vacations').get() as { id: string };
    expect(expense.vacation_id).toBe(vacation.id);

    // Self-FK (checklist.template_id) remapped to the template's new UUID.
    const tpl = db.prepare("SELECT id FROM checklists WHERE title = 'Packing'").get() as { id: string };
    const trip = db.prepare("SELECT template_id FROM checklists WHERE title = 'Trip list'").get() as { template_id: string };
    expect(trip.template_id).toBe(tpl.id);

    // No FK violations after migration.
    expect(db.pragma('foreign_key_check')).toHaveLength(0);
  });

  it('backfills updated_at on expenses and created_at/updated_at on checklist_items', async () => {
    seedLegacy();
    const { migrateToUuidAndSync } = require('../migrate-to-uuid-and-sync');
    await migrateToUuidAndSync();

    const exp = db.prepare('SELECT updated_at, exchange_rate FROM expenses').get() as {
      updated_at: string; exchange_rate: number;
    };
    expect(exp.updated_at).toBeTruthy();
    // exchange_rate reconstructed from amount_chf / amount = 47.5 / 50
    expect(exp.exchange_rate).toBeCloseTo(0.95);

    const item = db.prepare('SELECT created_at, updated_at FROM checklist_items').get() as {
      created_at: string; updated_at: string;
    };
    expect(item.created_at).toBeTruthy();
    expect(item.updated_at).toBeTruthy();
  });

  it('gives default categories a stable slug + deterministic UUID', async () => {
    seedLegacy();
    const mod = require('../migrate-to-uuid-and-sync');
    await mod.migrateToUuidAndSync();

    const cat = db.prepare("SELECT id, slug FROM categories WHERE name = 'Food'").get() as {
      id: string; slug: string;
    };
    expect(cat.slug).toBe('food');
    expect(cat.id).toBe(mod.categoryUuidForSlug('food'));
  });

  it('dedupes exchange_rates and enforces the unique pair index', async () => {
    seedLegacy();
    const { migrateToUuidAndSync } = require('../migrate-to-uuid-and-sync');
    await migrateToUuidAndSync();

    // The two CHF->EUR rows collapse to the newest (rate 0.96).
    const rows = db.prepare("SELECT rate FROM exchange_rates WHERE base_currency='CHF' AND target_currency='EUR'").all() as { rate: number }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].rate).toBeCloseTo(0.96);

    // Inserting a duplicate pair now fails.
    expect(() =>
      db.exec("INSERT INTO exchange_rates (id, base_currency, target_currency, rate, source, created_at, updated_at) VALUES ('r3','CHF','EUR',1.0,'api','x','y')"),
    ).toThrow();
  });

  it('is idempotent — a second run changes nothing and reports alreadyDone', async () => {
    seedLegacy();
    const { migrateToUuidAndSync } = require('../migrate-to-uuid-and-sync');
    await migrateToUuidAndSync();
    const idsAfterFirst = db.prepare('SELECT id FROM vacations').all();

    const second = await migrateToUuidAndSync();
    expect(second.alreadyDone).toBe(true);
    expect(db.prepare('SELECT id FROM vacations').all()).toEqual(idsAfterFirst);
  });
});
