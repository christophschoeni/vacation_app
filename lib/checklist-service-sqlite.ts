import { Checklist, ChecklistItem, ChecklistCategory } from '@/types';
import { checklistRepository } from './db/repositories/checklist-repository';

// Updated ChecklistService using SQLite through repository pattern
class ChecklistServiceSQLite {

  // Get all checklists for a vacation
  async getChecklists(vacationId: string): Promise<Checklist[]> {
    try {
      const checklists = await checklistRepository.findByVacationId(vacationId);
      console.log(`Service: loaded ${checklists.length} checklists`);
      checklists.forEach(cl => console.log(`  - "${cl.title}": ${cl.items?.length || 0} items`));
      return checklists;
    } catch (error) {
      console.warn('Failed to load checklists:', error);
      return [];
    }
  }

  // Get all templates
  async getTemplates(): Promise<Checklist[]> {
    try {
      return await checklistRepository.findTemplates();
    } catch (error) {
      console.warn('Failed to load templates:', error);
      return [];
    }
  }

  // Create new empty checklist
  async createChecklist(
    title: string,
    vacationId: string,
    category: ChecklistCategory = 'general',
    icon: string = 'check'
  ): Promise<Checklist> {
    try {
      return await checklistRepository.create({
        title,
        description: '',
        isTemplate: false,
        vacationId,
        category,
        icon,
      });
    } catch (error) {
      console.error('Failed to create checklist:', error);
      throw error;
    }
  }

  // Create checklist from template
  async createFromTemplate(templateId: string, vacationId: string): Promise<Checklist> {
    try {
      return await checklistRepository.createFromTemplate(templateId, vacationId);
    } catch (error) {
      console.error('Failed to create from template:', error);
      throw error;
    }
  }

  // Save/update checklist
  async saveChecklist(checklist: Checklist): Promise<void> {
    try {
      await checklistRepository.update(checklist.id, {
        title: checklist.title,
        description: checklist.description,
        category: checklist.category,
        icon: checklist.icon,
      });
    } catch (error) {
      console.error('Failed to save checklist:', error);
      throw error;
    }
  }

  // Delete checklist
  async deleteChecklist(checklistId: string): Promise<void> {
    try {
      const success = await checklistRepository.delete(checklistId);
      if (!success) {
        throw new Error('Checklist not found');
      }
    } catch (error) {
      console.error('Failed to delete checklist:', error);
      throw error;
    }
  }

  // Add item to checklist
  async addItem(
    checklistId: string,
    text: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ChecklistItem> {
    try {
      return await checklistRepository.addItem({
        checklistId,
        text,
        priority,
      });
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }

  // Toggle item completion
  async toggleItem(checklistId: string, itemId: string): Promise<void> {
    try {
      await checklistRepository.toggleItem(itemId);
    } catch (error) {
      console.error('Failed to toggle item:', error);
      throw error;
    }
  }

  // Delete item
  async deleteItem(checklistId: string, itemId: string): Promise<void> {
    try {
      const success = await checklistRepository.deleteItem(itemId);
      if (!success) {
        throw new Error('Item not found');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }

  // Update item
  async updateItem(itemId: string, updates: Partial<ChecklistItem>): Promise<void> {
    try {
      await checklistRepository.updateItem(itemId, {
        text: updates.text,
        completed: updates.completed,
        notes: updates.notes,
        priority: updates.priority,
        dueDate: updates.dueDate,
        quantity: updates.quantity,
        order: updates.order,
      });
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }

  // Get single checklist by ID
  async getChecklistById(checklistId: string): Promise<Checklist | null> {
    try {
      return await checklistRepository.findById(checklistId);
    } catch (error) {
      console.error('Failed to get checklist:', error);
      return null;
    }
  }

  // Search checklists
  async searchChecklists(query: string, vacationId?: string): Promise<Checklist[]> {
    try {
      const checklists = vacationId
        ? await checklistRepository.findByVacationId(vacationId)
        : await checklistRepository.findAll();

      const searchLower = query.toLowerCase();

      return checklists.filter(checklist =>
        checklist.title.toLowerCase().includes(searchLower) ||
        checklist.description?.toLowerCase().includes(searchLower) ||
        checklist.items.some(item => item.text.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Failed to search checklists:', error);
      return [];
    }
  }

  // Get checklist statistics
  async getChecklistStats(vacationId?: string): Promise<{
    totalChecklists: number;
    totalItems: number;
    completedItems: number;
    completionRate: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const checklists = vacationId
        ? await checklistRepository.findByVacationId(vacationId)
        : await checklistRepository.findAll();

      const totalItems = checklists.reduce((sum, list) => sum + list.items.length, 0);
      const completedItems = checklists.reduce(
        (sum, list) => sum + list.items.filter(item => item.completed).length,
        0
      );

      const byCategory = checklists.reduce((acc, list) => {
        acc[list.category] = (acc[list.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalChecklists: checklists.length,
        totalItems,
        completedItems,
        completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
        byCategory,
      };
    } catch (error) {
      console.error('Failed to get checklist stats:', error);
      return {
        totalChecklists: 0,
        totalItems: 0,
        completedItems: 0,
        completionRate: 0,
        byCategory: {},
      };
    }
  }

  // Duplicate checklist
  async duplicateChecklist(checklistId: string, newTitle?: string): Promise<Checklist> {
    try {
      const original = await checklistRepository.findById(checklistId);
      if (!original) {
        throw new Error('Checklist not found');
      }

      const duplicate = await checklistRepository.create({
        title: newTitle || `${original.title} (Kopie)`,
        description: original.description,
        isTemplate: original.isTemplate,
        vacationId: original.vacationId,
        category: original.category,
        icon: original.icon,
      });

      // Copy all items
      for (const item of original.items) {
        await checklistRepository.addItem({
          checklistId: duplicate.id,
          text: item.text,
          notes: item.notes,
          priority: item.priority,
          dueDate: item.dueDate,
          quantity: item.quantity,
          order: item.order,
        });
      }

      return await checklistRepository.findById(duplicate.id) as Checklist;
    } catch (error) {
      console.error('Failed to duplicate checklist:', error);
      throw error;
    }
  }

  // Convert checklist to template
  async convertToTemplate(checklistId: string): Promise<Checklist> {
    try {
      const checklist = await checklistRepository.findById(checklistId);
      if (!checklist) {
        throw new Error('Checklist not found');
      }

      return await checklistRepository.update(checklistId, {
        // Remove vacation association to make it a global template
        // Note: This would require updating the repository to handle this case
      });
    } catch (error) {
      console.error('Failed to convert to template:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateItems(updates: Array<{ itemId: string; completed: boolean }>): Promise<void> {
    try {
      await Promise.all(
        updates.map(({ itemId, completed }) =>
          checklistRepository.updateItem(itemId, { completed })
        )
      );
    } catch (error) {
      console.error('Failed to bulk update items:', error);
      throw error;
    }
  }

  async bulkDeleteItems(itemIds: string[]): Promise<void> {
    try {
      await Promise.all(
        itemIds.map(itemId => checklistRepository.deleteItem(itemId))
      );
    } catch (error) {
      console.error('Failed to bulk delete items:', error);
      throw error;
    }
  }
}

export const checklistServiceSQLite = new ChecklistServiceSQLite();