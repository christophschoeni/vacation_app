# Database Migrations

## Overview

This app uses **Drizzle ORM** with **expo-sqlite** for local database management. Migrations are tracked and executed automatically on app startup.

## Migration File Format

**IMPORTANT:** All migration files **MUST** use the `.sql.js` extension, not `.sql`.

### Why .sql.js?

React Native/Expo requires JavaScript modules for imports. Raw `.sql` files cannot be imported in React Native bundles.

**Correct Format:**
```javascript
// lib/db/migrations/0001_example.sql.js
export default `CREATE TABLE \`users\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`name\` text NOT NULL
);`;
```

**Wrong Format (will cause bundling errors):**
```sql
-- lib/db/migrations/0001_example.sql
CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL
);
```

## Generating New Migrations

### Step 1: Modify Schema

Edit [lib/db/schema.ts](../schema.ts) to add/modify tables:

```typescript
export const newTable = sqliteTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});
```

### Step 2: Generate Migration

Run the Drizzle Kit generate command:

```bash
npx drizzle-kit generate
```

### Step 3: Convert to .sql.js Format

Drizzle Kit may generate a `.sql` file. **You MUST convert it:**

1. **Find the generated file:**
   ```bash
   lib/db/migrations/0004_some_name.sql
   ```

2. **Read the SQL content:**
   ```sql
   CREATE TABLE `new_table` (
     `id` text PRIMARY KEY NOT NULL,
     `name` text NOT NULL,
     `created_at` text NOT NULL
   );
   ```

3. **Create a `.sql.js` file with the same name:**
   ```javascript
   // lib/db/migrations/0004_some_name.sql.js
   export default `CREATE TABLE \`new_table\` (
     \`id\` text PRIMARY KEY NOT NULL,
     \`name\` text NOT NULL,
     \`created_at\` text NOT NULL
   );`;
   ```

   **Note:** Escape all backticks (\`) with backslashes (\\`)

4. **Delete the `.sql` file:**
   ```bash
   rm lib/db/migrations/0004_some_name.sql
   ```

### Step 4: Update migrations.js

Add the new migration import to [lib/db/migrations/migrations.js](./migrations.js):

```javascript
import m0004 from './0004_some_name.sql.js';  // Add this line

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004  // Add this line
  }
}
```

### Step 5: Test

```bash
# Clear Expo cache and rebuild
npx expo start --clear

# Verify no bundling errors
# The migration will run automatically on next app start
```

## Common Issues

### "Unable to resolve ./0000_migration_name.sql"

**Problem:** Migration file is `.sql` instead of `.sql.js`

**Solution:**
1. Convert the `.sql` file to `.sql.js` format (see Step 3 above)
2. Update `migrations.js` to use `.sql.js` extension
3. Delete the old `.sql` file

### "Migration already applied"

**Problem:** Migration ID already exists in database

**Solution:**
- If testing locally, delete the app and reinstall
- If in production, create a new migration with different changes

### "Syntax error in SQL"

**Problem:** Backticks not properly escaped

**Solution:**
- Make sure all backticks in SQL are escaped: \`table_name\`
- Use template literals correctly: \`CREATE TABLE ...\`

## Migration History

| ID | Name | Date | Description |
|----|------|------|-------------|
| 0000 | worried_warbound | 2024-06-24 | Initial schema |
| 0001 | safe_squirrel_girl | 2024-07-05 | Added checklists |
| 0002 | exchange_rates | 2024-07-10 | Added exchange rates |
| 0003 | nervous_deathbird | 2024-12-22 | Group sharing features |

## Supabase Cloud Sync (Phase 3)

For cloud synchronization, we use Supabase with a separate schema.

### Setup Supabase Tables

1. Go to Supabase Dashboard → SQL Editor
2. Run [lib/db/supabase-schema.sql](../supabase-schema.sql)
3. Verify tables are created under "Table Editor"

The Supabase schema includes:
- `shared_vacations` - Synced vacations
- `shared_participants` - Group members
- `shared_expenses` - Synced expenses
- `shared_expense_splits` - Expense splits
- `access_codes` - Invitation codes

**Row Level Security (RLS)** is enabled to ensure users can only access their own data.

## Best Practices

1. **Always test migrations locally first**
2. **Never edit old migration files** - create new ones instead
3. **Use descriptive names** in schema changes
4. **Backup database** before running migrations in production
5. **Check `.sql.js` extension** before committing
6. **Commit migration + schema.ts together**
7. **Update this README** when adding significant schema changes

## Rollback Strategy

If a migration causes issues:

1. **Development:** Delete app and reinstall
2. **Production:** Create a reverse migration

Example reverse migration:
```javascript
export default `DROP TABLE IF EXISTS \`problematic_table\`;`;
```

## Automation (Future)

To automate the conversion process, create a post-generate script:

```json
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate && node scripts/convert-migrations.js"
  }
}
```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
