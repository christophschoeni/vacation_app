import { checklistRepository } from './db/repositories/checklist-repository';
import { vacationRepository } from './db/repositories/vacation-repository';
import { ChecklistCategory } from '@/types';

// Manual function to create test data with a specific vacation ID
export async function createTestDataForVacation(vacationId: string) {
  console.log(`🌱 Creating test data for vacation ID: ${vacationId}`);

  try {
    // Check if vacation exists
    const vacation = await vacationRepository.findById(vacationId);
    if (!vacation) {
      console.error(`❌ Vacation with ID ${vacationId} not found`);
      return;
    }

    console.log(`✅ Found vacation: ${vacation.destination}`);

    // Check if checklists already exist
    const existingChecklists = await checklistRepository.findByVacationId(vacationId);

    if (existingChecklists.length === 0) {
      console.log('Creating test checklists...');

      // Create "Packliste" checklist
      const packingList = await checklistRepository.create({
        title: 'Packliste',
        description: 'Was ich mitnehmen muss',
        isTemplate: false,
        vacationId: vacationId,
        category: 'packing' as ChecklistCategory,
        icon: '🧳',
      });

      console.log(`✅ Created Packliste: ${packingList.id}`);

      // Add items to packing list
      const item1 = await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Reisepass',
        priority: 'high',
        order: 1,
      });

      const item2 = await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Sonnencreme',
        priority: 'medium',
        order: 2,
      });

      const item3 = await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Badehose',
        priority: 'medium',
        order: 3,
      });

      // Toggle one item as completed
      await checklistRepository.toggleItem(item1.id);

      console.log(`✅ Added 3 items to Packliste, 1 completed`);

      // Create "Reiseplanung" checklist
      const travelPlanning = await checklistRepository.create({
        title: 'Reiseplanung',
        description: 'Alles was vor der Reise erledigt werden muss',
        isTemplate: false,
        vacationId: vacationId,
        category: 'planning' as ChecklistCategory,
        icon: '📋',
      });

      console.log(`✅ Created Reiseplanung: ${travelPlanning.id}`);

      // Add items to travel planning
      const planItem1 = await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Hotel buchen',
        priority: 'high',
        order: 1,
      });

      const planItem2 = await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Flug buchen',
        priority: 'high',
        order: 2,
      });

      const planItem3 = await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Mietwagen reservieren',
        priority: 'low',
        order: 3,
      });

      const planItem4 = await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Reiseversicherung abschließen',
        priority: 'medium',
        order: 4,
      });

      // Toggle some items as completed
      await checklistRepository.toggleItem(planItem1.id); // Hotel buchen
      await checklistRepository.toggleItem(planItem2.id); // Flug buchen

      console.log(`✅ Added 4 items to Reiseplanung, 2 completed`);

      // Show final stats
      const finalChecklists = await checklistRepository.findByVacationId(vacationId);
      console.log('\n📊 Final checklist stats:');

      for (const checklist of finalChecklists) {
        const completedItems = checklist.items.filter(item => item.completed).length;
        const totalItems = checklist.items.length;
        console.log(`  - "${checklist.title}": ${completedItems}/${totalItems} items`);
      }

      return finalChecklists;
    } else {
      console.log(`ℹ️ Found ${existingChecklists.length} existing checklists, skipping creation`);
      return existingChecklists;
    }

  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    throw error;
  }
}