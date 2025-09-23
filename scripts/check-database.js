const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Try to find the database file
const dbPaths = [
  './vacation_assist.db',
  './lib/db/vacation_assist.db',
  path.join(process.env.HOME, 'Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Documents/SQLite/vacation_assist.db')
];

async function checkDatabase() {
  console.log('🔍 Searching for database...');

  for (const dbPath of dbPaths) {
    try {
      const db = new sqlite3.Database(dbPath);

      console.log(`📂 Found database at: ${dbPath}`);

      // Get checklist count by title
      db.all(`
        SELECT
          title,
          vacationId,
          COUNT(*) as count,
          GROUP_CONCAT(id) as ids
        FROM checklists
        GROUP BY title, COALESCE(vacationId, 'template')
        ORDER BY title
      `, [], (err, rows) => {
        if (err) {
          console.error('❌ Query error:', err);
          return;
        }

        console.log('\n📊 Checklists grouped by title:');
        for (const row of rows) {
          if (row.count > 1) {
            console.log(`🔴 DUPLICATE: "${row.title}" (vacation: ${row.vacationId || 'template'}) - ${row.count} copies`);
            console.log(`   IDs: ${row.ids}`);
          } else {
            console.log(`✅ "${row.title}" (vacation: ${row.vacationId || 'template'}) - 1 copy`);
          }
        }

        // Get item counts for each checklist
        db.all(`
          SELECT
            c.id,
            c.title,
            c.vacationId,
            COUNT(ci.id) as itemCount,
            SUM(CASE WHEN ci.completed = 1 THEN 1 ELSE 0 END) as completedCount
          FROM checklists c
          LEFT JOIN checklist_items ci ON c.id = ci.checklistId
          GROUP BY c.id, c.title, c.vacationId
          ORDER BY c.title, c.createdAt
        `, [], (err, rows) => {
          if (err) {
            console.error('❌ Query error:', err);
            return;
          }

          console.log('\n📋 All checklists with item counts:');
          for (const row of rows) {
            const completed = row.completedCount || 0;
            const total = row.itemCount || 0;
            console.log(`  "${row.title}" (${row.id.substring(0, 8)}...): ${completed}/${total} items`);
          }

          db.close();
        });
      });

      return; // Found database, stop searching
    } catch (error) {
      // Database not found at this path, continue searching
    }
  }

  console.log('❌ No database found at any of the expected locations');
}

checkDatabase();