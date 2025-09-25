import { checklistRepository } from './db/repositories/checklist-repository';
import { ChecklistCategory } from '@/types';

// Template definitions
const DEFAULT_TEMPLATES = [
  {
    title: 'Strandurlaub',
    description: 'Packliste für Strandurlaub',
    category: 'packing' as ChecklistCategory,
    icon: '🏖️',
    items: [
      { text: 'Badehose/Bikini', priority: 'high' as const, order: 1 },
      { text: 'Sonnencreme', priority: 'high' as const, order: 2 },
      { text: 'Handtuch', priority: 'medium' as const, order: 3 },
      { text: 'Sonnenbrille', priority: 'medium' as const, order: 4 },
      { text: 'Flip-Flops', priority: 'medium' as const, order: 5 },
    ],
  },
  {
    title: 'Städtereise',
    description: 'Packliste für Städtereise',
    category: 'packing' as ChecklistCategory,
    icon: '🏙️',
    items: [
      { text: 'Bequeme Schuhe', priority: 'high' as const, order: 1 },
      { text: 'Stadtkarte/App', priority: 'medium' as const, order: 2 },
      { text: 'Kamera', priority: 'medium' as const, order: 3 },
      { text: 'Powerbank', priority: 'medium' as const, order: 4 },
    ],
  },
  {
    title: 'Skiurlaub',
    description: 'Packliste für Skiurlaub',
    category: 'packing' as ChecklistCategory,
    icon: '🎿',
    items: [
      { text: 'Skiausrüstung', priority: 'high' as const, order: 1 },
      { text: 'Warme Kleidung', priority: 'high' as const, order: 2 },
      { text: 'Ski-Unterwäsche', priority: 'high' as const, order: 3 },
      { text: 'Skibrille', priority: 'medium' as const, order: 4 },
      { text: 'Handschuhe', priority: 'medium' as const, order: 5 },
      { text: 'Après-Ski Outfit', priority: 'low' as const, order: 6 },
    ],
  },
  {
    title: 'Geschäftsreise',
    description: 'Packliste für Geschäftsreise',
    category: 'packing' as ChecklistCategory,
    icon: '💼',
    items: [
      { text: 'Business-Kleidung', priority: 'high' as const, order: 1 },
      { text: 'Laptop/Tablet', priority: 'high' as const, order: 2 },
      { text: 'Ladegeräte', priority: 'high' as const, order: 3 },
      { text: 'Visitenkarten', priority: 'medium' as const, order: 4 },
      { text: 'Dokumente', priority: 'medium' as const, order: 5 },
    ],
  },
];

// Create a single template with error handling
async function createTemplate(templateData: typeof DEFAULT_TEMPLATES[0]) {
  try {
    console.log(`Creating template: ${templateData.title}`);

    const template = await checklistRepository.create({
      title: templateData.title,
      description: templateData.description,
      isTemplate: true,
      category: templateData.category,
      icon: templateData.icon,
    });

    // Add all items
    for (const item of templateData.items) {
      await checklistRepository.addItem({
        checklistId: template.id,
        text: item.text,
        priority: item.priority,
        order: item.order,
      });
    }

    console.log(`✅ Created template: ${templateData.title} (${templateData.items.length} items)`);
    return template;
  } catch (error) {
    console.error(`❌ Failed to create template ${templateData.title}:`, error);
    return null;
  }
}

// Ensure default templates exist (create missing ones)
export async function ensureDefaultTemplates() {
  console.log('🌱 Ensuring default templates exist...');

  try {
    const existingTemplates = await checklistRepository.findTemplates();
    const existingTitles = existingTemplates.map(t => t.title);

    console.log(`Found ${existingTemplates.length} existing templates: ${existingTitles.join(', ')}`);

    let createdCount = 0;

    // Create any missing templates
    for (const templateData of DEFAULT_TEMPLATES) {
      if (!existingTitles.includes(templateData.title)) {
        const created = await createTemplate(templateData);
        if (created) createdCount++;
      } else {
        console.log(`ℹ️ Template "${templateData.title}" already exists, skipping`);
      }
    }

    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new templates`);
    } else {
      console.log('ℹ️ All default templates already exist');
    }

    // Return final count
    const finalTemplates = await checklistRepository.findTemplates();
    console.log(`📊 Total templates available: ${finalTemplates.length}`);
    return finalTemplates;

  } catch (error) {
    console.error('❌ Failed to ensure default templates:', error);
    throw error;
  }
}

// Legacy function for compatibility
export async function seedTemplates() {
  return await ensureDefaultTemplates();
}