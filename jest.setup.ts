// Jest runs in Node, where expo-sqlite's native module does not exist. Any
// module that transitively imports lib/db/database (which calls
// openDatabaseSync at import time) would crash the whole test file on load.
// Stubbing the native SQLite database here lets pure logic (formatters,
// status maths, currency helpers) be unit-tested without a device.
// AsyncStorage has no native backing in Node; use the library's official mock.
// jest.mock factories run before imports are hoisted, so require() is the
// idiomatic (and only) way to reference the mock here.
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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
