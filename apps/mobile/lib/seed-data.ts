import { vacationRepository } from './db/repositories/vacation-repository';
import { checklistRepository } from './db/repositories/checklist-repository';
import { ChecklistCategory } from '@/types';
import { logger } from '@/lib/utils/logger';

export async function seedTestData() {
  logger.info('🌱 Seeding test data...');

  try {
    // Create Antalya vacation if it doesn't exist
    const existingVacations = await vacationRepository.findAll();
    let antalyaVacation = existingVacations.find(v => v.destination === 'Antalya');

    if (!antalyaVacation) {
      logger.debug('Creating Antalya vacation...');
      antalyaVacation = await vacationRepository.create({
        destination: 'Antalya',
        country: 'Türkei',
        hotel: 'Club Hotel Sera',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-22'),
        budget: 2000,
        currency: 'EUR',
      });
    }

    logger.debug(`✅ Antalya vacation: ${antalyaVacation.id}`);

    // Check if checklists already exist
    const existingChecklists = await checklistRepository.findByVacationId(antalyaVacation.id);

    if (existingChecklists.length === 0) {
      logger.debug('Creating test checklists...');

      // Create "Packliste" checklist
      const packingList = await checklistRepository.create({
        title: 'Packliste',
        description: 'Was ich mitnehmen muss',
        isTemplate: false,
        vacationId: antalyaVacation.id,
        category: 'packing' as ChecklistCategory,
        icon: '🧳',
      });

      // Add items to packing list
      await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Reisepass',
        priority: 'high',
        order: 1,
      });

      await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Sonnencreme',
        priority: 'medium',
        order: 2,
      });

      await checklistRepository.addItem({
        checklistId: packingList.id,
        text: 'Badehose',
        priority: 'medium',
        order: 3,
      });

      // Toggle one item as completed
      const packingItems = await checklistRepository.findById(packingList.id);
      if (packingItems && packingItems.items.length > 0) {
        await checklistRepository.toggleItem(packingItems.items[0].id);
      }

      // Create "Reiseplanung" checklist
      const travelPlanning = await checklistRepository.create({
        title: 'Reiseplanung',
        description: 'Alles was vor der Reise erledigt werden muss',
        isTemplate: false,
        vacationId: antalyaVacation.id,
        category: 'planning' as ChecklistCategory,
        icon: '📋',
      });

      // Add items to travel planning
      await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Hotel buchen',
        priority: 'high',
        order: 1,
      });

      await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Flug buchen',
        priority: 'high',
        order: 2,
      });

      await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Mietwagen reservieren',
        priority: 'low',
        order: 3,
      });

      await checklistRepository.addItem({
        checklistId: travelPlanning.id,
        text: 'Reiseversicherung abschließen',
        priority: 'medium',
        order: 4,
      });

      // Toggle some items as completed
      const planningItems = await checklistRepository.findById(travelPlanning.id);
      if (planningItems && planningItems.items.length >= 2) {
        await checklistRepository.toggleItem(planningItems.items[0].id); // Hotel buchen
        await checklistRepository.toggleItem(planningItems.items[1].id); // Flug buchen
      }

      logger.info('✅ Created test checklists with items');
    } else {
      logger.info(`ℹ️ Found ${existingChecklists.length} existing checklists, skipping seed data`);
    }

    // Show final stats
    const finalChecklists = await checklistRepository.findByVacationId(antalyaVacation.id);
    logger.info('\n📊 Final checklist stats:');

    for (const checklist of finalChecklists) {
      const completedItems = checklist.items.filter(item => item.completed).length;
      const totalItems = checklist.items.length;
      logger.info(`  - "${checklist.title}": ${completedItems}/${totalItems} items`);
    }

    return {
      vacation: antalyaVacation,
      checklists: finalChecklists,
    };

  } catch (error) {
    logger.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

// Create some default templates
export { ensureDefaultTemplates as seedTemplates } from './seed-templates';