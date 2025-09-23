import { checklistRepository } from '../lib/db/repositories/checklist-repository';
import { initializeDatabase } from '../lib/db/database';

async function cleanupDuplicateChecklists() {
  console.log('🧹 Starting cleanup of duplicate checklists...');

  try {
    // Initialize database first
    await initializeDatabase();

    // Get all checklists
    const allChecklists = await checklistRepository.findAll();
    console.log(`Found ${allChecklists.length} total checklists`);

    // Group by title and vacation ID
    const groups = new Map<string, typeof allChecklists>();

    for (const checklist of allChecklists) {
      const key = `${checklist.title}-${checklist.vacationId || 'template'}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(checklist);
    }

    // Find duplicates and keep the one with most items
    let deletedCount = 0;

    for (const [key, checklists] of groups) {
      if (checklists.length > 1) {
        console.log(`\n📋 Found ${checklists.length} duplicates for "${key}"`);

        // Sort by item count (descending) and creation date (newest first)
        checklists.sort((a, b) => {
          const itemDiff = b.items.length - a.items.length;
          if (itemDiff !== 0) return itemDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const keepChecklist = checklists[0];
        const deleteChecklists = checklists.slice(1);

        console.log(`  ✅ Keeping: "${keepChecklist.title}" (${keepChecklist.items.length} items, created: ${keepChecklist.createdAt})`);

        for (const deleteChecklist of deleteChecklists) {
          console.log(`  🗑️  Deleting: "${deleteChecklist.title}" (${deleteChecklist.items.length} items, created: ${deleteChecklist.createdAt})`);
          await checklistRepository.delete(deleteChecklist.id);
          deletedCount++;
        }
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicate checklists.`);

    // Show final stats
    const finalChecklists = await checklistRepository.findAll();
    console.log(`📊 Final count: ${finalChecklists.length} checklists remaining`);

    for (const checklist of finalChecklists) {
      const completedItems = checklist.items.filter(item => item.completed).length;
      console.log(`  - "${checklist.title}": ${completedItems}/${checklist.items.length} items`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDuplicateChecklists();
}

export { cleanupDuplicateChecklists };