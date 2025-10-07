// Run this with: node reset-db.js
// This will help reset the database by clearing the migration state

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vacation_assist.db');

console.log('Checking current schema...');
try {
  const result = db.getAllSync('PRAGMA table_info(vacations)');
  console.log('Current vacations table columns:', result);
} catch (e) {
  console.error('Error:', e);
}
