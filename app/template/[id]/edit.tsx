import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Button, Icon } from '@/components/design';
import { FormInput } from '@/components/ui/forms';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { Checklist, ChecklistCategory, ChecklistItem } from '@/types';

// Category configuration
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string }> = {
  packing: { label: 'Packlisten', icon: '🧳' },
  shopping: { label: 'Einkaufslisten', icon: '🛒' },
  bucket: { label: 'Bucket Lists', icon: '🌟' },
  todo: { label: 'To-Do Listen', icon: '✅' },
  planning: { label: 'Planungslisten', icon: '📋' },
  general: { label: 'Allgemein', icon: '📝' },
  custom: { label: 'Benutzerdefiniert', icon: '⚙️' },
};

// Common icons for templates
const TEMPLATE_ICONS = ['📝', '🧳', '🛒', '🌟', '✅', '📋', '🎯', '📱', '💡', '🎨', '🔧', '⚙️'];

export default function TemplateEditScreen() {
  const { id } = useLocalSearchParams();
  const templateId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme();

  const [, setTemplate] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as ChecklistCategory,
    icon: '📝',
  });

  // Items management
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

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
      console.error('Failed to load template:', error);
      Alert.alert('Fehler', 'Standard-Liste konnte nicht geladen werden.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [templateId, loadTemplate]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Titel ein.');
      return;
    }

    try {
      setSaving(true);

      if (templateId === 'new') {
        // Create new template
        const newTemplate = await checklistRepository.create({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          isTemplate: true,
          category: formData.category,
          icon: formData.icon,
        });

        // Add items
        for (const item of items) {
          await checklistRepository.addItem({
            checklistId: newTemplate.id,
            text: item.text,
            notes: item.notes,
            priority: item.priority,
            quantity: item.quantity,
            order: item.order,
          });
        }

        Alert.alert('Erfolg', 'Standard-Liste wurde erstellt.');
      } else {
        // Update existing template
        await checklistRepository.update(templateId, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          icon: formData.icon,
        });

        // Update template items
        const itemsToUpdate = items.map(item => ({
          text: item.text,
          notes: item.notes,
          priority: item.priority,
          quantity: item.quantity,
        }));

        await checklistRepository.updateTemplateItems(templateId, itemsToUpdate);
        Alert.alert('Erfolg', 'Standard-Liste wurde aktualisiert.');
      }

      router.back();
    } catch (error) {
      console.error('Failed to save template:', error);
      Alert.alert('Fehler', 'Standard-Liste konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `temp_${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      priority: 'medium',
      order: items.length,
    };

    setItems([...items, newItem]);
    setNewItemText('');
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveItemEdit = () => {
    if (!editingItemText.trim()) return;

    setItems(items.map(item =>
      item.id === editingItemId
        ? { ...item, text: editingItemText.trim() }
        : item
    ));

    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleCategorySelect = (category: ChecklistCategory) => {
    setFormData(prev => ({
      ...prev,
      category,
      icon: CATEGORY_CONFIG[category]?.icon || prev.icon,
    }));
  };

  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Zurück"
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {templateId === 'new' ? 'Neue Standard-Liste' : 'Standard-Liste bearbeiten'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Lade...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Zurück"
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {templateId === 'new' ? 'Neue Standard-Liste' : 'Bearbeiten'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={saving}
          accessibilityLabel="Speichern"
        >
          <Text style={[
            styles.saveButtonText,
            {
              color: saving ? (isDark ? '#8E8E93' : '#6D6D70') : '#007AFF',
              opacity: saving ? 0.5 : 1
            }
          ]}>
            {saving ? 'Speichern...' : 'Speichern'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                GRUNDINFORMATIONEN
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Name und Beschreibung Ihrer Standard-Liste
              </Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <FormInput
                label="Titel"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Name der Standard-Liste"
                required
              />

              <FormInput
                label="Beschreibung"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Optionale Beschreibung"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                KATEGORIE
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Wählen Sie eine Kategorie für Ihre Liste
              </Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.categoryGrid}>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: formData.category === key
                          ? '#007AFF15'
                          : 'transparent',
                        borderColor: formData.category === key
                          ? '#007AFF'
                          : (isDark ? '#38383A' : '#E5E5EA'),
                      }
                    ]}
                    onPress={() => handleCategorySelect(key as ChecklistCategory)}
                  >
                    <Text style={styles.categoryIcon}>{config.icon}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      {
                        color: formData.category === key
                          ? '#007AFF'
                          : (isDark ? '#FFFFFF' : '#1C1C1E')
                      }
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                SYMBOL
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Wählen Sie ein Symbol für Ihre Liste
              </Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.iconGrid}>
                {TEMPLATE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: formData.icon === icon
                          ? '#007AFF15'
                          : 'transparent',
                        borderColor: formData.icon === icon
                          ? '#007AFF'
                          : (isDark ? '#38383A' : '#E5E5EA'),
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                EINTRÄGE ({items.length})
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Fügen Sie Einträge zu Ihrer Standard-Liste hinzu
              </Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              {/* Add new item */}
              <View style={styles.addItemSection}>
                <View style={styles.inputContainer}>
                  <FormInput
                    value={newItemText}
                    onChangeText={setNewItemText}
                    placeholder="Neuen Eintrag hinzufügen"
                    onSubmitEditing={handleAddItem}
                    returnKeyType="done"
                    style={[styles.addItemInput, {
                      backgroundColor: isDark ? '#2C2C2E' : '#F7F7F7',
                      borderColor: isDark ? '#38383A' : '#E5E5EA'
                    }]}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: '#34C759',
                      opacity: newItemText.trim() ? 1 : 0.4
                    }
                  ]}
                  onPress={handleAddItem}
                  disabled={!newItemText.trim()}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="plus"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Items list */}
              {items.map((item, index) => (
                <View key={item.id} style={[
                  styles.itemRow,
                  {
                    borderBottomColor: isDark ? '#38383A' : '#E5E5EA',
                    borderBottomWidth: index < items.length - 1 ? StyleSheet.hairlineWidth : 0
                  }
                ]}>
                  <View style={[
                    styles.itemNumber,
                    { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                  ]}>
                    <Text style={[styles.itemNumberText, { color: isDark ? '#FFFFFF' : '#6D6D70' }]}>
                      {index + 1}
                    </Text>
                  </View>

                  {editingItemId === item.id ? (
                    <View style={styles.editingItem}>
                      <FormInput
                        value={editingItemText}
                        onChangeText={setEditingItemText}
                        onSubmitEditing={handleSaveItemEdit}
                        onBlur={handleSaveItemEdit}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.itemContent}
                      onPress={() => handleEditItem(item)}
                    >
                      <Text style={[styles.itemText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Icon name="trash-2" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

              {items.length === 0 && (
                <View style={styles.emptyItems}>
                  <Icon name="list" size={32} color={isDark ? '#38383A' : '#E5E5EA'} />
                  <Text style={[styles.emptyItemsText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Noch keine Einträge vorhanden
                  </Text>
                  <Text style={[styles.emptyItemsSubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    Tippen Sie oben, um den ersten Eintrag hinzuzufügen
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  inputGroup: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addItemSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 1,
  },
  addItemInput: {
    marginBottom: 0,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
  },
  editingItem: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  emptyItems: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});