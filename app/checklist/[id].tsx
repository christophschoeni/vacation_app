import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChecklists } from '@/hooks/use-checklists';
import { ChecklistItem } from '@/types';
import { checklistServiceSQLite } from '@/lib/checklist-service-sqlite';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams();
  const checklistId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Extract vacation ID from the checklist to initialize the hook
  const [vacationId, setVacationId] = useState<string>('');
  const [checklist, setChecklist] = useState<any>(null);

  const {
    checklists,
    loadChecklists,
    addItem,
    toggleItem,
    deleteItem,
    saveChecklist,
  } = useChecklists(vacationId);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load checklist directly from SQLite using the service
        const currentChecklist = await checklistServiceSQLite.getChecklistById(checklistId);
        if (currentChecklist) {
          setVacationId(currentChecklist.vacationId || '');
          setChecklist(currentChecklist);
        } else {
          console.warn('Checklist not found:', checklistId);
        }
      } catch (error) {
        console.error('Failed to load checklist:', error);
      }
    };
    loadData();
  }, [checklistId]);

  useEffect(() => {
    if (vacationId) {
      loadChecklists();
    }
  }, [vacationId, loadChecklists]);

  useEffect(() => {
    if (checklists.length > 0) {
      const currentChecklist = checklists.find(c => c.id === checklistId);
      if (currentChecklist) {
        setChecklist(currentChecklist);
      }
    }
  }, [checklists, checklistId]);

  if (!checklist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Liste wird geladen...
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      packing: '#007AFF',
      shopping: '#34C759',
      bucket: '#FF9500',
      todo: '#FF3B30',
      planning: '#5856D6',
      general: '#8E8E93',
      custom: '#6D6D70',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryName = (category: string) => {
    const names = {
      packing: 'Packen',
      shopping: 'Einkaufen',
      bucket: 'Bucket List',
      todo: 'Aufgaben',
      planning: 'Planung',
      general: 'Allgemein',
      custom: 'Benutzerdefiniert',
    };
    return names[category as keyof typeof names] || 'Allgemein';
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      await addItem(checklistId, newItemText.trim());
      setNewItemText('');
      setIsAddingItem(false);
      // Reload checklists to update the view
      await loadChecklists();
    } catch {
      Alert.alert('Fehler', 'Element konnte nicht hinzugefügt werden.');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await toggleItem(checklistId, itemId);
      // Reload checklists to update the view
      await loadChecklists();
    } catch {
      Alert.alert('Fehler', 'Element konnte nicht aktualisiert werden.');
    }
  };

  const handleDeleteItem = async (item: ChecklistItem) => {
    Alert.alert(
      'Element löschen',
      `Möchten Sie "${item.text}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(checklistId, item.id);
              // Reload checklists to update the view
              await loadChecklists();
            } catch {
              Alert.alert('Fehler', 'Element konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const handleEditTitle = () => {
    Alert.prompt(
      'Liste umbenennen',
      'Neuer Name:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Speichern',
          onPress: async (newTitle) => {
            if (newTitle?.trim() && newTitle !== checklist.title) {
              try {
                await saveChecklist({
                  ...checklist,
                  title: newTitle.trim(),
                  updatedAt: new Date(),
                });
                // Reload checklists to update the view
                await loadChecklists();
              } catch {
                Alert.alert('Fehler', 'Titel konnte nicht geändert werden.');
              }
            }
          },
        },
      ],
      'plain-text',
      checklist.title
    );
  };

  const completedItems = checklist.items.filter((item: ChecklistItem) => item.completed).length;
  const totalItems = checklist.items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={handleEditTitle}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {checklist.title}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            {getCategoryName(checklist.category)} • {completedItems}/{totalItems}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddingItem(!isAddingItem)}
          style={[styles.addButton, { backgroundColor: getCategoryColor(checklist.category) }]}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: getCategoryColor(checklist.category),
                },
              ]}
            />
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Item Input */}
          {isAddingItem && (
            <View style={[styles.addItemContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <TextInput
                style={[
                  styles.addItemInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1C1C1E',
                    backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
                  },
                ]}
                placeholder="Neues Element hinzufügen..."
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={newItemText}
                onChangeText={setNewItemText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
              />
              <View style={styles.addItemActions}>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingItem(false);
                    setNewItemText('');
                  }}
                  style={[styles.actionButton, { backgroundColor: isDark ? '#48484A' : '#E5E5EA' }]}
                >
                  <Icon name="close" size={16} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddItem}
                  style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                >
                  <Icon name="plus" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Items List */}
          <View style={styles.itemsList}>
            {checklist.items
              .sort((a: ChecklistItem, b: ChecklistItem) => a.order - b.order)
              .map((item: ChecklistItem) => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                    onPress={() => handleToggleItem(item.id)}
                    style={[
                      styles.itemCheckbox,
                      {
                        backgroundColor: item.completed ? '#34C759' : 'transparent',
                        borderColor: item.completed ? '#34C759' : (isDark ? '#3A3A3C' : '#E5E5EA'),
                      }
                    ]}
                  >
                    <Icon
                      name="check"
                      size={16}
                      color={item.completed ? '#FFFFFF' : 'transparent'}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.itemText,
                      {
                        color: item.completed
                          ? (isDark ? '#8E8E93' : '#6D6D70')
                          : (isDark ? '#FFFFFF' : '#1C1C1E'),
                        textDecorationLine: item.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={styles.deleteButton}
                  >
                    <Icon name="close" size={14} color={isDark ? '#8E8E93' : '#6D6D70'} />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* Empty State */}
          {checklist.items.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name={checklist.icon as any} size={48} color={isDark ? '#3A3A3C' : '#E5E5EA'} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Liste ist leer
              </Text>
              <Text style={[styles.emptyDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Fügen Sie Ihr erstes Element hinzu, um zu beginnen.
              </Text>
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  addItemContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  addItemInput: {
    fontSize: 16,
    fontFamily: 'System',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.12)',
  },
  addItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    paddingHorizontal: 16,
    gap: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 22,
  },
});