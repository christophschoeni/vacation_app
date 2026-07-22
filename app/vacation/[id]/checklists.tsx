import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { goBack } from '@/lib/utils/navigation';
import {
  useChecklists,
  useTemplates,
  useCreateChecklist,
  useCreateChecklistFromTemplate,
  useUpdateChecklist,
  useDeleteChecklist,
} from '@/hooks/queries';
import { useRouteParam } from '@/hooks/use-route-param';
import ChecklistCard from '@/components/ui/cards/ChecklistCard';
import SwipeableCard from '@/components/ui/SwipeableCard';
import AppHeader from '@/components/ui/AppHeader';
import { PromptModal } from '@/components/ui/PromptModal';
import { Icon } from '@/components/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useTranslation } from '@/lib/i18n';
import { useTabBarPadding } from '@/hooks/use-tab-bar-padding';

export default function VacationChecklistsScreen() {
  const tabBarPadding = useTabBarPadding();
  const vacationId = useRouteParam('id');

  const theme = useIOSTheme();
  const { t } = useTranslation();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // Cross-platform prompt (Alert.prompt is iOS-only). Holds which flow is open.
  const [prompt, setPrompt] = useState<
    | { mode: 'create'; title: string; message: string; initialValue: string; confirmLabel: string }
    | { mode: 'rename'; checklistId: string; title: string; message: string; initialValue: string; confirmLabel: string }
    | null
  >(null);

  const { data: checklists = [] } = useChecklists(vacationId || undefined);
  const { data: templates = [] } = useTemplates();
  const { mutateAsync: createChecklist } = useCreateChecklist();
  const { mutateAsync: createFromTemplate } = useCreateChecklistFromTemplate();
  const { mutateAsync: updateChecklist } = useUpdateChecklist();
  const { mutateAsync: deleteChecklist } = useDeleteChecklist();

  const handleCreateList = () => {
    setPrompt({
      mode: 'create',
      title: t('vacation.checklists.create.title'),
      message: t('vacation.checklists.create.prompt'),
      initialValue: '',
      confirmLabel: t('common.create'),
    });
  };

  const submitCreateList = async (title: string) => {
    if (!title.trim()) return;
    try {
      await createChecklist({
        title: title.trim(),
        vacationId,
        category: 'general',
        icon: 'check',
      });
    } catch {
      Alert.alert(t('common.error'), t('vacation.checklists.errors.create'));
    }
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
      await createFromTemplate({ templateId, vacationId });
    } catch {
      Alert.alert(t('common.error'), t('vacation.checklists.errors.create_from_template'));
    }
  };

  const handleEditChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    setPrompt({
      mode: 'rename',
      checklistId: checklist.id,
      title: t('vacation.checklists.edit.title'),
      message: t('vacation.checklists.edit.prompt'),
      initialValue: checklist.title,
      confirmLabel: t('common.save'),
    });
  };

  const submitRename = async (checklistId: string, newTitle: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;
    if (newTitle.trim() && newTitle.trim() !== checklist.title) {
      try {
        await updateChecklist({ id: checklist.id, title: newTitle.trim() });
      } catch {
        Alert.alert(t('common.error'), t('vacation.checklists.errors.update'));
      }
    }
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
            } catch {
              Alert.alert(t('common.error'), t('vacation.checklists.errors.delete'));
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <AppHeader
        showBack={true}
        onBackPress={() => goBack('/(tabs)')}
        rightAction={
          <View style={styles.headerButtonGroup}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShowTemplates}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
                <Icon name="book-template" size={18} color={theme.accent} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreateList}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: theme.groupedBackground }]}>
                <Icon name="plus" size={18} color={theme.accent} />
              </View>
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: theme.label }]}>
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
              <Text style={[styles.emptyTitle, { color: theme.accent }]}>{t('vacation.checklists.empty.title')}</Text>
              <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
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
          <View style={[styles.modalContent, { backgroundColor: theme.groupedBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.label }]}>
              {t('vacation.checklists.templates.select_title')}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.secondaryLabel }]}>
              {t('vacation.checklists.templates.select_prompt')}
            </Text>
            <ScrollView style={styles.templateList}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateItem, { borderBottomColor: theme.separator }]}
                  onPress={() => handleSelectTemplate(template.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.templateTitle, { color: theme.label }]}>
                    {template.title}
                  </Text>
                  <Icon name="chevron-right" size={16} color={theme.tertiaryLabel} />
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

      <PromptModal
        visible={prompt !== null}
        title={prompt?.title ?? ''}
        message={prompt?.message}
        initialValue={prompt?.initialValue}
        confirmLabel={prompt?.confirmLabel}
        onCancel={() => setPrompt(null)}
        onConfirm={(value) => {
          const current = prompt;
          setPrompt(null);
          if (current?.mode === 'create') submitCreateList(value);
          else if (current?.mode === 'rename') submitRename(current.checklistId, value);
        }}
      />

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