/**
 * Guards EVERY migration against the missing-breakpoint bug, not just the one
 * that happened to hit it.
 *
 * The expo-sqlite drizzle migrator splits a migration body on
 * `--> statement-breakpoint` and runs each piece separately. A file containing
 * several statements but no markers therefore applies only its FIRST statement
 * — and is still recorded as done, so it never retries. That is unrecoverable
 * without manual surgery, which is exactly what happened to 0003 and 0004.
 *
 * Rather than trusting each new migration to remember the marker, this test
 * derives the statement count from the SQL itself and fails when the two
 * disagree.
 */
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function migrationFiles(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql.js'))
    .sort();
}

/**
 * Counts top-level SQL statements by walking the body and honouring the two
 * places a `;` does NOT end a statement: inside a string literal, and inside a
 * CREATE TABLE (...) column list.
 */
function countStatements(sql: string): number {
  let statements = 0;
  let depth = 0;
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") inString = true;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) statements++;
  }
  return statements;
}

describe('migration statement breakpoints', () => {
  const files = migrationFiles();

  it('finds the migration files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s separates every statement with a breakpoint', (file) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const body = require(path.join(MIGRATIONS_DIR, file)).default as string;

    const statements = countStatements(body);
    const markers = (body.match(/--> statement-breakpoint/g) ?? []).length;

    // N statements need N-1 separators. A single-statement migration needs none.
    expect(markers).toBe(Math.max(0, statements - 1));
  });
});
