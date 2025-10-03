import { useState, useCallback } from 'react';
import { Checklist, ChecklistItem, ChecklistCategory } from '@/types';
import { checklistServiceSQLite } from '@/lib/checklist-service-sqlite';
import { logger } from '@/lib/utils/logger';

export function useChecklists(vacationId: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);

  // Load checklists for vacation
  const loadChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const lists = await checklistServiceSQLite.getChecklists(vacationId);
      logger.debug('Hook: Loaded', lists.length, 'checklists from database');

      // Filter out duplicates by title, keeping the one with most items
      const deduplicatedLists = [];
      const titleMap = new Map();

      for (const checklist of lists) {
        const existingChecklist = titleMap.get(checklist.title);

        if (!existingChecklist) {
          titleMap.set(checklist.title, checklist);
          deduplicatedLists.push(checklist);
        } else {
          // Keep the checklist with more items (or newer if same count)
          const currentItemCount = checklist.items?.length || 0;
          const existingItemCount = existingChecklist.items?.length || 0;

          if (currentItemCount > existingItemCount ||
              (currentItemCount === existingItemCount &&
               new Date(checklist.createdAt) > new Date(existingChecklist.createdAt))) {

            // Replace the existing one
            const index = deduplicatedLists.findIndex(c => c.id === existingChecklist.id);
            if (index !== -1) {
              deduplicatedLists[index] = checklist;
              titleMap.set(checklist.title, checklist);
            }

            logger.debug(`Hook: Replaced duplicate "${checklist.title}" - kept one with ${currentItemCount} items instead of ${existingItemCount}`);
          } else {
            logger.debug(`Hook: Skipped duplicate "${checklist.title}" - keeping one with ${existingItemCount} items instead of ${currentItemCount}`);
          }
        }
      }

      logger.debug('Hook: Setting checklists state with', deduplicatedLists.length, 'deduplicated checklists');
      setChecklists(deduplicatedLists);
    } catch (error) {
      logger.warn('Failed to load checklists:', error);
    } finally {
      setLoading(false);
    }
  }, [vacationId]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const templateList = await checklistServiceSQLite.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      logger.warn('Failed to load templates:', error);
    }
  }, []);

  // Create new checklist
  const createChecklist = useCallback(async (
    title: string,
    category: ChecklistCategory = 'general',
    icon: string = 'check'
  ) => {
    try {
      const newChecklist = await checklistServiceSQLite.createChecklist(title, vacationId, category, icon);
      setChecklists(prev => [...prev, newChecklist]);
      return newChecklist;
    } catch (error) {
      logger.warn('Failed to create checklist:', error);
      throw error;
    }
  }, [vacationId]);

  // Create from template
  const createFromTemplate = useCallback(async (templateId: string) => {
    try {
      const newChecklist = await checklistServiceSQLite.createFromTemplate(templateId, vacationId);
      setChecklists(prev => [...prev, newChecklist]);
      return newChecklist;
    } catch (error) {
      logger.warn('Failed to create from template:', error);
      throw error;
    }
  }, [vacationId]);

  // Save checklist
  const saveChecklist = useCallback(async (checklist: Checklist) => {
    try {
      await checklistServiceSQLite.saveChecklist(checklist);
      setChecklists(prev =>
        prev.map(c => (c.id === checklist.id ? checklist : c))
      );
    } catch (error) {
      logger.warn('Failed to save checklist:', error);
      throw error;
    }
  }, []);

  // Delete checklist
  const deleteChecklist = useCallback(async (checklistId: string) => {
    try {
      await checklistServiceSQLite.deleteChecklist(checklistId);
      setChecklists(prev => prev.filter(c => c.id !== checklistId));
    } catch (error) {
      logger.warn('Failed to delete checklist:', error);
      throw error;
    }
  }, []);

  // Add item to checklist
  const addItem = useCallback(async (
    checklistId: string,
    text: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    try {
      const newItem = await checklistServiceSQLite.addItem(checklistId, text, priority);
      setChecklists(prev =>
        prev.map(checklist =>
          checklist.id === checklistId
            ? { ...checklist, items: [...checklist.items, newItem] }
            : checklist
        )
      );
      return newItem;
    } catch (error) {
      logger.warn('Failed to add item:', error);
      throw error;
    }
  }, []);

  // Toggle item completion
  const toggleItem = useCallback(async (checklistId: string, itemId: string) => {
    try {
      await checklistServiceSQLite.toggleItem(checklistId, itemId);
      setChecklists(prev =>
        prev.map(checklist =>
          checklist.id === checklistId
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === itemId ? { ...item, completed: !item.completed } : item
                ),
              }
            : checklist
        )
      );
    } catch (error) {
      logger.warn('Failed to toggle item:', error);
      throw error;
    }
  }, []);

  // Delete item
  const deleteItem = useCallback(async (checklistId: string, itemId: string) => {
    try {
      await checklistServiceSQLite.deleteItem(checklistId, itemId);
      setChecklists(prev =>
        prev.map(checklist =>
          checklist.id === checklistId
            ? {
                ...checklist,
                items: checklist.items.filter(item => item.id !== itemId),
              }
            : checklist
        )
      );
    } catch (error) {
      logger.warn('Failed to delete item:', error);
      throw error;
    }
  }, []);

  return {
    checklists,
    templates,
    loading,
    loadChecklists,
    loadTemplates,
    createChecklist,
    createFromTemplate,
    saveChecklist,
    deleteChecklist,
    addItem,
    toggleItem,
    deleteItem,
  };
}