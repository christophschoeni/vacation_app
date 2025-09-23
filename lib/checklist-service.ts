import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checklist, ChecklistItem, ChecklistCategory } from '@/types';

const CHECKLISTS_STORAGE_KEY = '@vacation_assist_checklists';
const TEMPLATES_STORAGE_KEY = '@vacation_assist_checklist_templates';

// Default templates
export const DEFAULT_TEMPLATES: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Grundausstattung Packen',
    description: 'Essentials für jede Reise',
    isTemplate: true,
    category: 'packing',
    icon: 'shopping',
    items: [
      { id: '1', text: 'Reisepass', completed: false, priority: 'high', order: 1 },
      { id: '2', text: 'Flugtickets/Buchungsbestätigung', completed: false, priority: 'high', order: 2 },
      { id: '3', text: 'Ladegeräte', completed: false, priority: 'medium', order: 3 },
      { id: '4', text: 'Kamera', completed: false, priority: 'low', order: 4 },
      { id: '5', text: 'Medikamente', completed: false, priority: 'high', order: 5 },
      { id: '6', text: 'Sonnencreme', completed: false, priority: 'medium', order: 6 },
    ],
  },
  {
    title: 'Strand Packliste',
    description: 'Alles für den perfekten Strandurlaub',
    isTemplate: true,
    category: 'packing',
    icon: 'sun',
    items: [
      { id: '1', text: 'Badehose/Bikini', completed: false, priority: 'high', order: 1 },
      { id: '2', text: 'Strandhandtuch', completed: false, priority: 'high', order: 2 },
      { id: '3', text: 'Sonnencreme LSF 30+', completed: false, priority: 'high', order: 3 },
      { id: '4', text: 'Sonnenbrille', completed: false, priority: 'medium', order: 4 },
      { id: '5', text: 'Flipflops', completed: false, priority: 'medium', order: 5 },
      { id: '6', text: 'Schnorchelausrüstung', completed: false, priority: 'low', order: 6 },
    ],
  },
  {
    title: 'Stadt Packliste',
    description: 'Für Städtereisen und Sightseeing',
    isTemplate: true,
    category: 'packing',
    icon: 'compass',
    items: [
      { id: '1', text: 'Bequeme Laufschuhe', completed: false, priority: 'high', order: 1 },
      { id: '2', text: 'Stadtplan/Reiseführer', completed: false, priority: 'medium', order: 2 },
      { id: '3', text: 'Rucksack für Tagesausflüge', completed: false, priority: 'medium', order: 3 },
      { id: '4', text: 'Powerbank', completed: false, priority: 'medium', order: 4 },
      { id: '5', text: 'Faltbare Wasserflasche', completed: false, priority: 'low', order: 5 },
    ],
  },
  {
    title: 'Sehenswürdigkeiten',
    description: 'Orte die ich besuchen möchte',
    isTemplate: true,
    category: 'bucket',
    icon: 'camera',
    items: [],
  },
  {
    title: 'Einkaufsliste',
    description: 'Was ich vor der Reise noch besorgen muss',
    isTemplate: true,
    category: 'shopping',
    icon: 'cart',
    items: [],
  },
];

class ChecklistService {
  // Get all checklists for a vacation
  async getChecklists(vacationId: string): Promise<Checklist[]> {
    try {
      const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
      if (stored) {
        const allChecklists = JSON.parse(stored) as Checklist[];
        return allChecklists
          .filter(list => list.vacationId === vacationId && !list.isTemplate)
          .map(this.parseChecklistDates);
      }
      return [];
    } catch (error) {
      console.warn('Failed to load checklists:', error);
      return [];
    }
  }

  // Get all templates
  async getTemplates(): Promise<Checklist[]> {
    try {
      const stored = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored) as Checklist[];
        return templates.map(this.parseChecklistDates);
      } else {
        // Initialize with default templates
        await this.initializeDefaultTemplates();
        return await this.getTemplates();
      }
    } catch (error) {
      console.warn('Failed to load templates:', error);
      return [];
    }
  }

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const templates = DEFAULT_TEMPLATES.map(template => ({
        ...template,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.warn('Failed to initialize default templates:', error);
    }
  }

  // Create checklist from template
  async createFromTemplate(templateId: string, vacationId: string): Promise<Checklist> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    const newChecklist: Checklist = {
      ...template,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isTemplate: false,
      vacationId,
      templateId,
      items: template.items.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completed: false, // Reset completion status
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveChecklist(newChecklist);
    return newChecklist;
  }

  // Create new empty checklist
  async createChecklist(
    title: string,
    vacationId: string,
    category: ChecklistCategory = 'general',
    icon: string = 'check'
  ): Promise<Checklist> {
    const newChecklist: Checklist = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      description: '',
      isTemplate: false,
      vacationId,
      category,
      icon,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveChecklist(newChecklist);
    return newChecklist;
  }

  // Save checklist
  async saveChecklist(checklist: Checklist): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
      const allChecklists = stored ? JSON.parse(stored) : [];

      const existingIndex = allChecklists.findIndex((c: Checklist) => c.id === checklist.id);

      if (existingIndex >= 0) {
        allChecklists[existingIndex] = { ...checklist, updatedAt: new Date() };
      } else {
        allChecklists.push(checklist);
      }

      await AsyncStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(allChecklists));
    } catch (error) {
      console.warn('Failed to save checklist:', error);
      throw error;
    }
  }

  // Delete checklist
  async deleteChecklist(checklistId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
      if (stored) {
        const allChecklists = JSON.parse(stored) as Checklist[];
        const filteredChecklists = allChecklists.filter(c => c.id !== checklistId);
        await AsyncStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(filteredChecklists));
      }
    } catch (error) {
      console.warn('Failed to delete checklist:', error);
      throw error;
    }
  }

  // Add item to checklist
  async addItem(checklistId: string, text: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<ChecklistItem> {
    const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
    if (!stored) throw new Error('No checklists found');

    const allChecklists = JSON.parse(stored) as Checklist[];
    const checklistIndex = allChecklists.findIndex(c => c.id === checklistId);

    if (checklistIndex === -1) throw new Error('Checklist not found');

    const newItem: ChecklistItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      priority,
      order: allChecklists[checklistIndex].items.length + 1,
    };

    allChecklists[checklistIndex].items.push(newItem);
    allChecklists[checklistIndex].updatedAt = new Date();

    await AsyncStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(allChecklists));
    return newItem;
  }

  // Toggle item completion
  async toggleItem(checklistId: string, itemId: string): Promise<void> {
    const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
    if (!stored) throw new Error('No checklists found');

    const allChecklists = JSON.parse(stored) as Checklist[];
    const checklistIndex = allChecklists.findIndex(c => c.id === checklistId);

    if (checklistIndex === -1) throw new Error('Checklist not found');

    const itemIndex = allChecklists[checklistIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found');

    allChecklists[checklistIndex].items[itemIndex].completed =
      !allChecklists[checklistIndex].items[itemIndex].completed;
    allChecklists[checklistIndex].updatedAt = new Date();

    await AsyncStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(allChecklists));
  }

  // Delete item
  async deleteItem(checklistId: string, itemId: string): Promise<void> {
    const stored = await AsyncStorage.getItem(CHECKLISTS_STORAGE_KEY);
    if (!stored) throw new Error('No checklists found');

    const allChecklists = JSON.parse(stored) as Checklist[];
    const checklistIndex = allChecklists.findIndex(c => c.id === checklistId);

    if (checklistIndex === -1) throw new Error('Checklist not found');

    allChecklists[checklistIndex].items = allChecklists[checklistIndex].items.filter(i => i.id !== itemId);
    allChecklists[checklistIndex].updatedAt = new Date();

    await AsyncStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(allChecklists));
  }

  // Helper to parse dates from storage
  private parseChecklistDates(checklist: any): Checklist {
    return {
      ...checklist,
      createdAt: new Date(checklist.createdAt),
      updatedAt: new Date(checklist.updatedAt),
      items: checklist.items ? checklist.items.map((item: any) => ({
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      })) : [],
    };
  }
}

export const checklistService = new ChecklistService();