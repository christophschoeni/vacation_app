const { db } = require('../lib/db/database');
const { eq } = require('drizzle-orm');

// Mock schema for cleanup script
const checklists = {
  id: 'id',
  title: 'title',
  vacationId: 'vacationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

const checklistItems = {
  id: 'id',
  checklistId: 'checklistId',
  completed: 'completed'
};

async function cleanupDuplicateChecklists() {
  console.log('🧹 Starting cleanup of duplicate checklists...');

  try {
    // Get all checklists
    const allChecklists = await db.execute(`
      SELECT
        c.id,
        c.title,
        c.vacationId,
        c.createdAt,
        COUNT(ci.id) as itemCount,
        SUM(CASE WHEN ci.completed = 1 THEN 1 ELSE 0 END) as completedCount
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklistId
      GROUP BY c.id, c.title, c.vacationId, c.createdAt
      ORDER BY c.title, c.vacationId, c.createdAt
    `);

    console.log(`Found ${allChecklists.length} total checklists`);

    // Group by title and vacation ID
    const groups = new Map();

    for (const checklist of allChecklists) {
      const key = `${checklist.title}-${checklist.vacationId || 'template'}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(checklist);
    }

    // Find duplicates and keep the one with most items
    let deletedCount = 0;

    for (const [key, checklistGroup] of groups) {
      if (checklistGroup.length > 1) {
        console.log(`\n📋 Found ${checklistGroup.length} duplicates for "${key}"`);

        // Sort by item count (descending) and creation date (newest first)
        checklistGroup.sort((a, b) => {
          const itemDiff = b.itemCount - a.itemCount;
          if (itemDiff !== 0) return itemDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const keepChecklist = checklistGroup[0];
        const deleteChecklists = checklistGroup.slice(1);

        console.log(`  ✅ Keeping: "${keepChecklist.title}" (${keepChecklist.itemCount} items, ${keepChecklist.completedCount} completed)`);

        for (const deleteChecklist of deleteChecklists) {
          console.log(`  🗑️  Deleting: "${deleteChecklist.title}" (${deleteChecklist.itemCount} items, ${deleteChecklist.completedCount} completed)`);

          // Delete checklist items first
          await db.execute(`DELETE FROM checklist_items WHERE checklistId = ?`, [deleteChecklist.id]);

          // Delete checklist
          await db.execute(`DELETE FROM checklists WHERE id = ?`, [deleteChecklist.id]);

          deletedCount++;
        }
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicate checklists.`);

    // Show final stats
    const finalChecklists = await db.execute(`
      SELECT
        c.id,
        c.title,
        c.vacationId,
        COUNT(ci.id) as itemCount,
        SUM(CASE WHEN ci.completed = 1 THEN 1 ELSE 0 END) as completedCount
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklistId
      GROUP BY c.id, c.title, c.vacationId
      ORDER BY c.title
    `);

    console.log(`📊 Final count: ${finalChecklists.length} checklists remaining`);

    for (const checklist of finalChecklists) {
      const completed = checklist.completedCount || 0;
      const total = checklist.itemCount || 0;
      console.log(`  - "${checklist.title}": ${completed}/${total} items`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupDuplicateChecklists();