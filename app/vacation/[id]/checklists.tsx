import React, { useEffect, useReducer, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, useColorScheme, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useChecklists } from '@/hooks/use-checklists';
import { useVacations } from '@/hooks/use-vacations';
import ChecklistCard from '@/components/ui/cards/ChecklistCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import AppHeader from '@/components/ui/AppHeader';
import { Icon } from '@/components/design';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';

export default function VacationChecklistsScreen() {
  // WORKAROUND: NativeTabs in expo-router doesn't pass route params to child screens
  // We get the vacation from the vacations list - since we're inside /vacation/[id]/
  // the parent layout has already loaded the vacation
  const { vacations } = useVacations();

  // Get the first vacation (in a real app with multiple vacations,
  // we'd need a better way to identify which vacation we're viewing)
  // But since the parent _layout.tsx filters by ID, we can assume it's the active one
  const vacation = vacations.length > 0 ? vacations[0] : null;
  const vacationId = vacation?.id;

  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Force re-render when checklists change
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const {
    checklists,
    templates,
    loading,
    loadChecklists,
    loadTemplates,
    createChecklist,
    createFromTemplate,
    saveChecklist,
    deleteChecklist
  } = useChecklists(vacationId || '');

  useEffect(() => {
    if (vacationId) {
      loadChecklists();
      loadTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacationId]);

  // Reload checklists when screen comes into focus (e.g., when returning from detail view)
  useFocusEffect(
    useCallback(() => {
      if (vacationId) {
        loadChecklists();
        loadTemplates();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vacationId])
  );

  // Force re-render when checklists change to ensure ChecklistCard gets updated data
  useEffect(() => {
    forceUpdate();
  }, [checklists]);

  const handleCreateList = () => {
    Alert.prompt(
      t('vacation.checklists.create.title'),
      t('vacation.checklists.create.prompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.create'),
          onPress: async (title) => {
            if (title?.trim()) {
              try {
                await createChecklist(title.trim());
              } catch (error) {
                Alert.alert(t('common.error'), t('vacation.checklists.errors.create'));
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };


  const handleShowTemplates = () => {
    if (templates.length === 0) {
      Alert.alert(t('vacation.checklists.templates.title'), t('vacation.checklists.templates.empty'));
      return;
    }

    setShowTemplateModal(true);
  };

  const handleSelectTemplate = async (templateId: string) => {
    setShowTemplateModal(false);
    try {
      const template = templates.find(t => t.id === templateId);
      await createFromTemplate(templateId);
    } catch (error) {
      Alert.alert(t('common.error'), t('vacation.checklists.errors.create_from_template'));
    }
  };

  const handleEditChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    Alert.prompt(
      t('vacation.checklists.edit.title'),
      t('vacation.checklists.edit.prompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save'),
          onPress: async (newTitle) => {
            if (newTitle?.trim() && newTitle.trim() !== checklist.title) {
              try {
                await saveChecklist({
                  ...checklist,
                  title: newTitle.trim(),
                });
              } catch (error) {
                Alert.alert(t('common.error'), t('vacation.checklists.errors.update'));
              }
            }
          },
        },
      ],
      'plain-text',
      checklist.title
    );
  };

  const handleDeleteChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    Alert.alert(
      t('vacation.checklists.delete.title'),
      t('vacation.checklists.delete.message', { title: checklist?.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChecklist(checklistId);
            } catch (error) {
              Alert.alert(t('common.error'), t('vacation.checklists.errors.delete'));
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        showBack={true}
        onBackPress={() => router.push('/(tabs)')}
        rightAction={
          <View style={styles.headerButtonGroup}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShowTemplates}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="book-template" size={18} color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreateList}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="plus" size={18} color={colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E'} />
              </View>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('vacation.checklists.title')}
          </Text>
        </View>

        <View style={styles.listContainer}>
          {checklists.length > 0 ? (
            checklists.map((checklist) => (
              <SwipeableCard
                key={checklist.id}
                onPress={() => router.push(`/checklist/${checklist.id}`)}
                onEdit={() => handleEditChecklist(checklist.id)}
                onDelete={() => handleDeleteChecklist(checklist.id)}
              >
                <ChecklistCard
                  checklist={checklist}
                  onPress={(id) => router.push(`/checklist/${id}`)}
                />
              </SwipeableCard>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: isDark ? '#007AFF' : '#007AFF' }]}>{t('vacation.checklists.empty.title')}</Text>
              <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('vacation.checklists.empty.description')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTemplateModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('vacation.checklists.templates.select_title')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.checklists.templates.select_prompt')}
            </Text>
            <ScrollView style={styles.templateList}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateItem, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E5' }]}
                  onPress={() => handleSelectTemplate(template.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.templateTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {template.title}
                  </Text>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTemplateModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'System',
    color: '#6D6D70',
    marginTop: 4,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6D6D70',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 20,
    textAlign: 'center',
  },
  templateList: {
    maxHeight: 300,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    flex: 1,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
    color: '#FFFFFF',
  },
  headerButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});