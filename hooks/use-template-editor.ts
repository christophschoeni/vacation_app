import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { Checklist, ChecklistCategory, ChecklistItem } from '@/types';
import { logger } from '@/lib/utils/logger';

interface TemplateFormData {
  title: string;
  description: string;
  category: ChecklistCategory;
  icon: string;
}

export function useTemplateEditor(templateId: string) {
  const [template, setTemplate] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TemplateFormData>({
    title: '',
    description: '',
    category: 'general',
    icon: '📝',
  });

  // Items management
  const [items, setItems] = useState<ChecklistItem[]>([]);

  const loadTemplate = useCallback(async () => {
    try {
      if (templateId === 'new') {
        // New template
        setTemplate(null);
        setFormData({
          title: '',
          description: '',
          category: 'general',
          icon: '📝',
        });
        setItems([]);
      } else {
        // Edit existing template
        const templateData = await checklistRepository.findById(templateId);
        if (!templateData) {
          Alert.alert('Fehler', 'Standard-Liste nicht gefunden.');
          router.back();
          return;
        }

        setTemplate(templateData);
        setFormData({
          title: templateData.title,
          description: templateData.description || '',
          category: templateData.category,
          icon: templateData.icon,
        });
        setItems(templateData.items);
      }
    } catch (error) {
      logger.error('Failed to load template:', error);
      Alert.alert('Fehler', 'Standard-Liste konnte nicht geladen werden.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  const updateFormData = useCallback((updates: Partial<TemplateFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const addItem = useCallback((text: string) => {
    if (!text.trim()) return;

    const newItem: ChecklistItem = {
      id: `temp_${Date.now()}`,
      checklistId: templateId,
      text: text.trim(),
      completed: false,
      priority: 'medium',
      order: items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems(prev => [...prev, newItem]);
  }, [items.length, templateId]);

  const updateItem = useCallback((itemId: string, text: string) => {
    if (!text.trim()) return;

    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, text: text.trim(), updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      // Update order
      return newItems.map((item, index) => ({
        ...item,
        order: index,
        updatedAt: new Date().toISOString(),
      }));
    });
  }, []);

  const saveTemplate = useCallback(async () => {
    if (!formData.title.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Titel ein.');
      return false;
    }

    setSaving(true);
    try {
      if (templateId === 'new') {
        // Create new template
        const newTemplate = await checklistRepository.create({
          title: formData.title.trim(),
          description: formData.description.trim(),
          isTemplate: true,
          category: formData.category,
          icon: formData.icon,
        });

        // Add all items
        for (const item of items) {
          await checklistRepository.addItem({
            checklistId: newTemplate.id,
            text: item.text,
            priority: item.priority,
            order: item.order,
          });
        }

        Alert.alert('Erfolg', 'Standard-Liste wurde erstellt.');
      } else {
        // Update existing template
        await checklistRepository.update(templateId, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          icon: formData.icon,
        });

        // Update items - this is simplified, in a real app you'd want to diff items
        // For now, we'll clear and re-add all items
        const existingTemplate = await checklistRepository.findById(templateId);
        if (existingTemplate) {
          // Delete existing items
          for (const item of existingTemplate.items) {
            await checklistRepository.deleteItem(item.id);
          }

          // Add current items
          for (const item of items) {
            await checklistRepository.addItem({
              checklistId: templateId,
              text: item.text,
              priority: item.priority,
              order: item.order,
            });
          }
        }

        Alert.alert('Erfolg', 'Standard-Liste wurde aktualisiert.');
      }

      router.back();
      return true;
    } catch (error) {
      logger.error('Failed to save template:', error);
      Alert.alert('Fehler', 'Standard-Liste konnte nicht gespeichert werden.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, items, templateId]);

  return {
    template,
    loading,
    saving,
    formData,
    items,
    loadTemplate,
    updateFormData,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    saveTemplate,
  };
}