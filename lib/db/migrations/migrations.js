// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_worried_warbound.sql.js';
import m0001 from './0001_safe_squirrel_girl.sql.js';
import m0002 from './0002_exchange_rates.sql.js';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002
  }
}
  