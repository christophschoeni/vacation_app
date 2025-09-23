import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useChecklists } from '@/hooks/use-checklists';
import ChecklistCard from '@/components/ui/cards/ChecklistCard';
import { createTestDataForVacation } from '@/lib/manual-seed';

export default function VacationChecklistsScreen() {
  const { id } = useLocalSearchParams();
  const extractedVacationId = Array.isArray(id) ? id[0] : id;

  // TEMPORARY FIX: Use a static vacation ID if none is extracted
  const vacationId = extractedVacationId || 'antalya-vacation-2024';

  console.log('🔍 Debug - Raw params:', { id });
  console.log('🔍 Debug - Extracted vacationId:', extractedVacationId);
  console.log('🔍 Debug - Final vacationId used:', vacationId);

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
      console.log(`🎯 Checklists screen: Loading checklists for vacation ID: ${vacationId}`);
      // Load with a delay to ensure database and app initialization is complete
      setTimeout(() => {
        loadChecklists();
        loadTemplates();
      }, 500);
    } else {
      console.log('⚠️ No vacation ID available');
    }
  }, [vacationId, loadChecklists, loadTemplates]);

  // Reload checklists when screen comes into focus (e.g., when returning from detail view)
  useFocusEffect(
    useCallback(() => {
      if (vacationId) {
        // Reload when returning to this screen with longer delay on first load
        setTimeout(() => {
          loadChecklists();
        }, 300);
      }
    }, [vacationId, loadChecklists])
  );

  // Debug: Log checklists data
  useEffect(() => {
    console.log(`UI State Update: ${checklists.length} checklists loaded`);
    checklists.forEach(checklist => {
      const completedItems = checklist.items?.filter(item => item.completed).length || 0;
      const totalItems = checklist.items?.length || 0;
      console.log(`  UI: "${checklist.title}": ${completedItems}/${totalItems} items`);
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
                Alert.alert('Erfolg!', `Liste "${title.trim()}" wurde erstellt! 🎉`);
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

  // DEBUG: Create test data
  const handleCreateTestData = async () => {
    console.log('🔧 Debug button clicked - vacationId:', vacationId);
    console.log('🔧 Debug button clicked - typeof vacationId:', typeof vacationId);

    // Just create a simple test list for now
    try {
      console.log('🔧 Creating simple test checklist...');
      await createChecklist('Test Liste', 'general', '📝');
      Alert.alert('Erfolg!', 'Test-Liste wurde erstellt! 🎉');
    } catch (error) {
      console.error('Failed to create test list:', error);
      Alert.alert('Fehler', `Test-Liste konnte nicht erstellt werden: ${error}`);
    }
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
      Alert.alert('Erfolg!', `Liste "${template?.title}" wurde aus Vorlage erstellt! 🎉`);
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
              Alert.alert('Erfolg!', 'Liste wurde gelöscht.');
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
      <View style={styles.header}>
        <Text style={styles.title}>Listen</Text>
        <Text style={styles.subtitle}>
          {checklists.length} {checklists.length === 1 ? 'Liste' : 'Listen'}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleCreateTestData}
          >
            <Text style={styles.debugButtonText}>🔧</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={handleShowTemplates}
          >
            <Text style={styles.buttonText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateList}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      {checklists.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
  buttons: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 16,
  },
  templateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    paddingVertical: 16,
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
});