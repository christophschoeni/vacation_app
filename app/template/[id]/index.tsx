import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Button, Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { Checklist, ChecklistCategory } from '@/types';

// Category configuration from templates.tsx
const CATEGORY_CONFIG: Record<ChecklistCategory, { label: string; icon: string; color: string }> = {
  packing: { label: 'Packlisten', icon: '🧳', color: '#007AFF' },
  shopping: { label: 'Einkaufslisten', icon: '🛒', color: '#FF9500' },
  bucket: { label: 'Bucket Lists', icon: '🌟', color: '#AF52DE' },
  todo: { label: 'To-Do Listen', icon: '✅', color: '#34C759' },
  planning: { label: 'Planungslisten', icon: '📋', color: '#FF3B30' },
  general: { label: 'Allgemein', icon: '📝', color: '#8E8E93' },
  custom: { label: 'Benutzerdefiniert', icon: '⚙️', color: '#5856D6' },
};

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams();
  const templateId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme();

  const [template, setTemplate] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const templateData = await checklistRepository.findById(templateId);
      setTemplate(templateData);
    } catch (error) {
      console.error('Failed to load template:', error);
      Alert.alert('Fehler', 'Standard-Liste konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTemplate();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleEdit = () => {
    router.push(`/template/${templateId}/edit`);
  };

  const handleDelete = async () => {
    if (!template) return;

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
              router.back();
            } catch {
              Alert.alert('Fehler', 'Standard-Liste konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!template) return;

    try {
      await checklistRepository.duplicateTemplate(template.id);
      Alert.alert('Erfolg', 'Standard-Liste wurde dupliziert.');
      router.back();
    } catch {
      Alert.alert('Fehler', 'Standard-Liste konnte nicht dupliziert werden.');
    }
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
            Standard-Liste
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Lade Standard-Liste...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!template) {
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
            Standard-Liste
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size={48} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Standard-Liste nicht gefunden
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
          Standard-Liste
        </Text>
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.headerButton}
          accessibilityLabel="Bearbeiten"
        >
          <Icon name="edit" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Template Header */}
        <Card variant="clean" style={styles.headerCard}>
          <View style={styles.templateHeader}>
            <View style={styles.templateIcon}>
              <Text style={styles.iconText}>{template.icon}</Text>
            </View>
            <View style={styles.templateInfo}>
              <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                {template.title}
              </Text>
              {template.description && (
                <Text style={[styles.templateDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {template.description}
                </Text>
              )}
              <View style={styles.templateMeta}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryEmoji}>
                    {CATEGORY_CONFIG[template.category]?.icon || '📝'}
                  </Text>
                  <Text style={[styles.categoryText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {CATEGORY_CONFIG[template.category]?.label || template.category}
                  </Text>
                </View>
                <Text style={[styles.itemCount, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {template.items.length} Einträge
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Template Items */}
        {template.items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              Einträge
            </Text>
            {template.items.map((item, index) => (
              <Card key={item.id} variant="clean" style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={[
                    styles.itemNumber,
                    { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                  ]}>
                    <Text style={[styles.itemNumberText, { color: isDark ? '#FFFFFF' : '#6D6D70' }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                      {item.text}
                    </Text>
                    {item.notes && (
                      <Text style={[styles.itemNotes, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {item.notes}
                      </Text>
                    )}
                    <View style={styles.itemMeta}>
                      {item.priority !== 'medium' && (
                        <View style={[styles.priorityBadge, {
                          backgroundColor: item.priority === 'high' ? '#FF3B30' : '#8E8E93'
                        }]}>
                          <Text style={styles.priorityText}>
                            {item.priority === 'high' ? 'Hoch' : 'Niedrig'}
                          </Text>
                        </View>
                      )}
                      {item.quantity && (
                        <Text style={[styles.quantity, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                          Anzahl: {item.quantity}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={handleDuplicate}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={styles.actionButtonCard}>
              <View style={styles.actionButtonContent}>
                <Icon name="copy" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                <Text style={[styles.actionButtonText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  Duplizieren
                </Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Card variant="clean" style={[styles.actionButtonCard, { backgroundColor: '#FF3B30', borderColor: '#FF3B30' }]}>
              <View style={styles.actionButtonContent}>
                <Icon name="trash-2" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  Löschen
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerSpacer: {
    width: 40,
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerCard: {
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  templateIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 32,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  itemsSection: {
    marginBottom: 32,
  },
  itemCard: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quantity: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.12)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
});