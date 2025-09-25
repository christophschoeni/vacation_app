import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Icon } from '@/components/design';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { Checklist, ChecklistCategory } from '@/types';

// Kategorie-Konfiguration für bessere UX
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string; color: string }> = {
  packing: { label: 'Packlisten', icon: '🧳', color: '#007AFF' },
  shopping: { label: 'Einkaufslisten', icon: '🛒', color: '#FF9500' },
  bucket: { label: 'Bucket Lists', icon: '🌟', color: '#AF52DE' },
  todo: { label: 'To-Do Listen', icon: '✅', color: '#34C759' },
  planning: { label: 'Planungslisten', icon: '📋', color: '#FF3B30' },
  general: { label: 'Allgemein', icon: '📝', color: '#8E8E93' },
  custom: { label: 'Benutzerdefiniert', icon: '⚙️', color: '#5856D6' },
};

export default function TemplatesScreen() {
  const colorScheme = useColorScheme();
  const [templates, setTemplates] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      let templateList = await checklistRepository.findTemplates();
      console.log(`Found ${templateList.length} templates`);

      // Smart auto-creation: If no templates found, try to create defaults
      if (templateList.length === 0) {
        console.log('No templates found, attempting to create defaults...');
        try {
          await ensureDefaultTemplates();
          templateList = await checklistRepository.findTemplates();
          console.log(`After auto-creation: ${templateList.length} templates`);
        } catch (createError) {
          console.error('Failed to auto-create templates:', createError);
          // Continue with empty list, fallback button will be available
        }
      }

      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to load templates:', error);
      Alert.alert('Fehler', 'Standard-Listen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [])
  );

  const handleTemplatePress = (template: Checklist) => {
    router.push(`/template/${template.id}`);
  };

  const handleTemplateEdit = (template: Checklist) => {
    router.push(`/template/${template.id}/edit`);
  };

  const handleTemplateDelete = async (template: Checklist) => {
    Alert.alert(
      'Standard-Liste löschen',
      `Möchten Sie die Standard-Liste "${template.title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await checklistRepository.delete(template.id);
              await loadTemplates();
            } catch {
              Alert.alert('Fehler', 'Standard-Liste konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const handleAddTemplate = () => {
    router.push('/template/new/edit');
  };

  const createDefaultTemplates = async () => {
    try {
      setLoading(true);
      console.log('Manually creating default templates...');

      await ensureDefaultTemplates();

      Alert.alert('Erfolg!', '4 Standard-Listen wurden erstellt!');
      await loadTemplates();

    } catch (error) {
      console.error('Failed to create default templates:', error);
      Alert.alert('Fehler', 'Standard-Listen konnten nicht erstellt werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (data: Checklist[]) => {
    try {
      setTemplates(data);
      const templateIds = data.map(template => template.id);
      await checklistRepository.updateTemplateOrder(templateIds);
    } catch (error) {
      console.error('Failed to update template order:', error);
      Alert.alert('Fehler', 'Reihenfolge konnte nicht gespeichert werden.');
      // Revert the order
      loadTemplates();
    }
  };

  const isDark = colorScheme === 'dark';

  const renderTemplateItem = ({ item, drag, isActive }: RenderItemParams<Checklist>) => {
    return (
      <View style={[styles.templateItem, { opacity: isActive ? 0.7 : 1 }]}>
        <SwipeableCard
          onPress={() => handleTemplatePress(item)}
          onEdit={() => handleTemplateEdit(item)}
          onDelete={() => handleTemplateDelete(item)}
        >
          <Card variant="clean" style={styles.templateCard}>
            <TouchableOpacity
              onPress={() => handleTemplatePress(item)}
              style={styles.templateContent}
            >
              <TouchableOpacity
                onLongPress={drag}
                style={styles.dragHandle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="grip-vertical" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
              </TouchableOpacity>

              <View style={styles.templateInfo}>
                <Text style={styles.templateIcon}>{item.icon}</Text>
                <View style={styles.templateText}>
                  <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={[styles.templateDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={[styles.templateItems, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {item.items.length} Einträge
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
            </TouchableOpacity>
          </Card>
        </SwipeableCard>
      </View>
    );
  };

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
          Standard-Listen
        </Text>
        <TouchableOpacity
          onPress={handleAddTemplate}
          style={styles.headerButton}
          accessibilityLabel="Neue Standard-Liste hinzufügen"
        >
          <Icon name="plus" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
      </View>


      {loading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Lade Standard-Listen...
          </Text>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-square" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Keine Standard-Listen
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Erstellen Sie Standard-Listen für Ihre Reisen
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: '#007AFF' }]}
            onPress={createDefaultTemplates}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              4 Standard-Listen erstellen
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {templates.map((template, index) => (
            <View key={template.id} style={styles.templateItem}>
              <Card variant="clean" style={styles.templateCard}>
                <TouchableOpacity
                  onPress={() => handleTemplatePress(template)}
                  style={styles.templateContent}
                >
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <View style={styles.templateText}>
                      <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {template.title}
                      </Text>
                      {template.description && (
                        <Text style={[styles.templateDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                          {template.description}
                        </Text>
                      )}
                      <Text style={[styles.templateItems, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {template.items.length} Einträge
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </TouchableOpacity>
              </Card>
            </View>
          ))}
        </View>
      )}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  templateItem: {
    marginBottom: 8,
  },
  templateCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  templateText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  templateItems: {
    fontSize: 12,
    fontWeight: '500',
  },
});