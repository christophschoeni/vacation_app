// Jest runs in Node, where expo-sqlite's native module does not exist. Any
// module that transitively imports lib/db/database (which calls
// openDatabaseSync at import time) would crash the whole test file on load.
// Stubbing the native SQLite database here lets pure logic (formatters,
// status maths, currency helpers) be unit-tested without a device.
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => ({ changes: 0, lastInsertRowId: 0 }),
    getAllSync: () => [],
    getFirstSync: () => null,
    prepareSync: () => ({
      executeSync: () => ({ getAllSync: () => [], getFirstSync: () => null }),
      finalizeSync: () => {},
    }),
    closeSync: () => {},
  }),
}));
