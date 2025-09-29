import React, { useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useRouteParam } from '@/hooks/use-route-param';
import { useCallback } from 'react';
import { useChecklists } from '@/hooks/use-checklists';
import ChecklistCard from '@/components/ui/cards/ChecklistCard';
import AppHeader from '@/components/ui/AppHeader';
import { Icon } from '@/components/design';
import { logger } from '@/lib/utils/logger';

export default function VacationChecklistsScreen() {
  const extractedVacationId = useRouteParam('id');

  // TEMPORARY FIX: Use the actual vacation ID if none is extracted
  const vacationId = extractedVacationId || '17590895805177pt0zpcf5';

  logger.debug('🔍 Debug - Raw params:', { id: extractedVacationId });
  logger.debug('🔍 Debug - Extracted vacationId:', extractedVacationId);
  logger.debug('🔍 Debug - Final vacationId used:', vacationId);

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
      'Neue Liste erstellen',
      'Name der Liste:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Erstellen',
          onPress: async (title) => {
            if (title?.trim()) {
              try {
                await createChecklist(title.trim());
              } catch (error) {
                Alert.alert('Fehler', 'Liste konnte nicht erstellt werden.');
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
      Alert.alert('Vorlagen', 'Keine Vorlagen verfügbar.');
      return;
    }

    const templateButtons = templates.map(template => ({
      text: template.title,
      onPress: () => handleSelectTemplate(template.id),
    }));

    Alert.alert(
      'Vorlage auswählen',
      'Wählen Sie eine Vorlage aus:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        ...templateButtons,
      ]
    );
  };

  const handleSelectTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      await createFromTemplate(templateId);
    } catch (error) {
      Alert.alert('Fehler', 'Liste konnte nicht aus Vorlage erstellt werden.');
    }
  };

  const handleDeleteChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    Alert.alert(
      'Liste löschen',
      `Möchten Sie die Liste "${checklist?.title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChecklist(checklistId);
            } catch (error) {
              Alert.alert('Fehler', 'Liste konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
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
              <View style={[styles.headerButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="book-template" size={18} color="#1C1C1E" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreateList}
              activeOpacity={0.8}
            >
              <View style={[styles.headerButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="plus" size={18} color="#1C1C1E" />
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
            <Text style={[styles.largeTitle, { color: '#1C1C1E' }]}>
              Listen
            </Text>
            <Text style={styles.subtitle}>
              {checklists.length} {checklists.length === 1 ? 'Liste' : 'Listen'}
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
            <Text style={styles.emptyTitle}>Noch keine Listen</Text>
            <Text style={styles.emptyText}>
              Erstellen Sie Ihre erste Liste mit dem Plus-Button.
              {'\n\n'}
              Oder wählen Sie eine Vorlage aus dem Vorlagen-Button.
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
    backgroundColor: '#FFFFFF',
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
  subtitle: {
    fontSize: 15,
    color: '#6D6D70',
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