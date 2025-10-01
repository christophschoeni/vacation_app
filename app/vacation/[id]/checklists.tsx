import React, { useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useRouteParam } from '@/hooks/use-route-param';
import { useCallback } from 'react';
import { useChecklists } from '@/hooks/use-checklists';
import ChecklistCard from '@/components/ui/cards/ChecklistCard';
import AppHeader from '@/components/ui/AppHeader';
import { Icon } from '@/components/design';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n';

export default function VacationChecklistsScreen() {
  const vacationId = useRouteParam('id');
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  // Force re-render when checklists change
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const {
    checklists,
    templates,
    loading,
    loadChecklists,
    loadTemplates,
    createChecklist,
    createFromTemplate,
    deleteChecklist
  } = useChecklists(vacationId || '');

  useEffect(() => {
    if (vacationId) {
      logger.info(`🎯 Checklists screen: Loading checklists for vacation ID: ${vacationId}`);
      // Load with a delay to ensure database and app initialization is complete
      setTimeout(() => {
        loadChecklists();
        loadTemplates();
      }, 500);
    } else {
      logger.warn('⚠️ No vacation ID available');
    }
  }, [vacationId]);

  // Reload checklists when screen comes into focus (e.g., when returning from detail view)
  useFocusEffect(
    useCallback(() => {
      if (vacationId) {
        // Reload when returning to this screen with longer delay on first load
        setTimeout(() => {
          loadChecklists();
        }, 300);
      }
    }, [vacationId])
  );

  // Debug: Log checklists data
  useEffect(() => {
    logger.debug(`UI State Update: ${checklists.length} checklists loaded`);
    checklists.forEach(checklist => {
      const completedItems = checklist.items?.filter(item => item.completed).length || 0;
      const totalItems = checklist.items?.length || 0;
      logger.debug(`  UI: "${checklist.title}": ${completedItems}/${totalItems} items`);
    });
    // Force re-render to ensure ChecklistCard gets updated data
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

    const templateButtons = templates.map(template => ({
      text: template.title,
      onPress: () => handleSelectTemplate(template.id),
    }));

    Alert.alert(
      t('vacation.checklists.templates.select_title'),
      t('vacation.checklists.templates.select_prompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        ...templateButtons,
      ]
    );
  };

  const handleSelectTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      await createFromTemplate(templateId);
    } catch (error) {
      Alert.alert(t('common.error'), t('vacation.checklists.errors.create_from_template'));
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
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
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
      {checklists.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* iOS-style large title in content area */}
          <View style={styles.titleSection}>
            <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {t('vacation.checklists.title')}
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.checklists.count', { count: checklists.length })}
            </Text>
          </View>

          {checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onPress={(id) => router.push(`/checklist/${id}`)}
              onLongPress={handleDeleteChecklist}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? '#007AFF' : '#007AFF' }]}>{t('vacation.checklists.empty.title')}</Text>
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.checklists.empty.description')}
            </Text>
          </View>
        </View>
      )}

    </View>
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
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
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