import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vacation, Checklist, ChecklistItem } from '@/types';
import Constants from 'expo-constants';

import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { appInitialization } from '@/lib/app-initialization';
import { seedTestData, seedTemplates } from '@/lib/seed-data';
import { getDatabaseStats } from '@/lib/db/database';
import * as FileSystem from 'expo-file-system';
import { logger } from '@/lib/utils/logger';
import { onboardingService } from '@/lib/onboarding-service';

// Interface for database statistics
interface DatabaseStats {
  vacations: number;
  checklists: number;
  checklistItems: number;
  expenses: number;
  totalRecords: number;
}

// Interface for AsyncStorage errors
interface AsyncStorageError extends Error {
  message: string;
}

// Only allow the debug screen in development mode. The guard lives in this
// wrapper so that DebugScreenContent's hooks are never called conditionally.
export default function DebugScreen() {
  if (!__DEV__) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Zurück</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Debug nicht verfügbar</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, textAlign: 'center', color: '#1C1C1E' }}>
            Der Debug-Screen ist nur in der Entwicklungsumgebung verfügbar.
          </Text>
        </View>
      </View>
    );
  }

  return <DebugScreenContent />;
}

function DebugScreenContent() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      // Get database stats
      const stats = await getDatabaseStats();
      setDbStats(stats);

      // Get all vacations
      const allVacations = await vacationRepository.findAll();
      setVacations(allVacations);

      // Get all checklists
      const allChecklists = await checklistRepository.findAll();
      setChecklists(allChecklists);

      logger.info('Debug - Database stats:', stats);
      logger.info('Debug - Vacations:', allVacations);
      logger.info('Debug - Checklists:', allChecklists);
    } catch (error) {
      logger.error('Failed to load database info:', error);
      Alert.alert('Fehler', `Konnte Datenbank-Info nicht laden: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runFullInitialization = async () => {
    setLoading(true);
    try {
      logger.info('🔧 Running full app initialization...');

      // Run app initialization
      const result = await appInitialization.forceReinitialization();

      if (result.success) {
        Alert.alert('Erfolg!', 'App-Initialisierung abgeschlossen! 🎉');
        await loadDatabaseInfo();
      } else {
        Alert.alert('Fehler', `Initialisierung fehlgeschlagen: ${result.error}`);
      }
    } catch (error) {
      logger.error('Failed to initialize:', error);
      Alert.alert('Fehler', `Initialisierung fehlgeschlagen: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createAntalyaVacation = async () => {
    setLoading(true);
    try {
      logger.info('🏖️ Creating Antalya vacation with specific ID...');

      // Create vacation with the expected ID that the app uses
      const antalyaVacation = await vacationRepository.create({
        id: 'antalya-vacation-2024', // Use the expected ID
        destination: 'Antalya',
        country: 'Türkei',
        hotel: 'Club Hotel Sera',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-22'),
        budget: 2000,
        currency: 'EUR',
      });

      logger.info('✅ Created Antalya vacation:', antalyaVacation);

      Alert.alert('Erfolg!', `Antalya-Vacation erstellt! ID: ${antalyaVacation.id}`);
      await loadDatabaseInfo();
    } catch (error) {
      logger.error('Failed to create vacation:', error);
      Alert.alert('Fehler', `Konnte Vacation nicht erstellen: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const showDatabasePath = async () => {
    try {
      logger.info('📁 Checking database file and paths...');

      const documentsDir = FileSystem.Paths.document.uri;
      const sqliteDir = `${documentsDir}SQLite/`;
      const dbPath = `${sqliteDir}vacation_assist.db`;

      let message = `Document Directory:\n${documentsDir}\n\n`;
      message += `SQLite Directory:\n${sqliteDir}\n\n`;
      message += `Database File:\n${dbPath}\n\n`;
      message += `Check console logs for detailed file information.`;

      Alert.alert('Database Path Info', message);
    } catch (error) {
      logger.error('Failed to get database path:', error);
      Alert.alert('Fehler', `Konnte Datenbankpfad nicht ermitteln: ${error}`);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Alle Daten löschen?',
      'SQLite-Datenbank UND AsyncStorage werden komplett geleert!',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alles löschen',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // 1. Clear SQLite database
              const { db } = await import('@/lib/db/database');
              const schema = await import('@/lib/db/schema');

              logger.info('🗑️ Clearing SQLite database...');
              await db.delete(schema.checklistItems);
              await db.delete(schema.checklists);
              await db.delete(schema.expenses);
              await db.delete(schema.vacations);
              await db.delete(schema.categories);
              await db.delete(schema.backupHistory);

              logger.info('💾 Database cleared');

              // 2. Clear ALL AsyncStorage data
              logger.info('🗑️ Clearing AsyncStorage...');
              try {
                await AsyncStorage.clear();
                logger.info('✅ AsyncStorage cleared successfully');
              } catch (asyncError: unknown) {
                const error = asyncError as AsyncStorageError;
                // AsyncStorage might already be cleared or directory doesn't exist
                if (error.message?.includes('No such file or directory') ||
                    error.message?.includes('couldn\'t be removed')) {
                  logger.info('ℹ️ AsyncStorage directory already cleared or doesn\'t exist');
                } else {
                  logger.warn('⚠️ AsyncStorage clear failed:', error);
                }
              }

              Alert.alert('Erfolg!', 'Alle Daten (SQLite + AsyncStorage) wurden gelöscht!');
              await loadDatabaseInfo();
            } catch (error) {
              logger.error('Failed to clear all data:', error);
              Alert.alert('Fehler', `Konnte Daten nicht löschen: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRecreateDatabase = async () => {
    Alert.alert(
      'Datenbank neu erstellen?',
      'Alle Daten werden gelöscht und die Datenbank wird mit dem neuen Schema neu erstellt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Neu erstellen',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              logger.info('🔄 Recreating database...');
              // Database recreation functionality removed
              await loadDatabaseInfo();
              Alert.alert('Erfolg!', 'Datenbank wurde neu geladen!');
            } catch (error) {
              logger.error('Failed to recreate database:', error);
              Alert.alert('Fehler', `Konnte Datenbank nicht neu erstellen: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const clearAsyncStorageOnly = async () => {
    Alert.alert(
      'AsyncStorage löschen?',
      'Alle AsyncStorage-Daten werden gelöscht (SQLite bleibt bestehen)',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'AsyncStorage löschen',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              logger.info('🗑️ Clearing AsyncStorage...');
              await AsyncStorage.clear();
              Alert.alert('Erfolg!', 'AsyncStorage wurde geleert!');
            } catch (error) {
              logger.error('Failed to clear AsyncStorage:', error);
              Alert.alert('Fehler', `Konnte AsyncStorage nicht löschen: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetOnboarding = async () => {
    Alert.alert(
      'Onboarding zurücksetzen?',
      'Das Onboarding wird beim nächsten App-Start wieder angezeigt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              logger.info('🔄 Resetting onboarding...');
              await onboardingService.resetOnboarding();
              Alert.alert('Erfolg!', 'Onboarding wurde zurückgesetzt! Starte die App neu, um es zu sehen.');
            } catch (error) {
              logger.error('Failed to reset onboarding:', error);
              Alert.alert('Fehler', `Konnte Onboarding nicht zurücksetzen: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const viewOnboarding = () => {
    router.push('/onboarding');
  };

  const checkOnboardingStatus = async () => {
    try {
      const completed = await onboardingService.hasCompletedOnboarding();
      Alert.alert(
        'Onboarding Status',
        `Onboarding abgeschlossen: ${completed ? 'Ja ✅' : 'Nein ❌'}`
      );
    } catch (error) {
      logger.error('Failed to check onboarding status:', error);
      Alert.alert('Fehler', `Konnte Status nicht prüfen: ${error}`);
    }
  };

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Debug Screen</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktionen</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={loadDatabaseInfo}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Datenbank neu laden</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runFullInitialization}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🚀 App-Initialisierung starten</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF6B6B' }]}
            onPress={handleRecreateDatabase}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Datenbank neu erstellen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={createAntalyaVacation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🏖️ Antalya-Vacation erstellen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9500' }]}
            onPress={showDatabasePath}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📁 Datenbankpfad anzeigen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={clearAllData}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🗑️ Alle Daten löschen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9500' }]}
            onPress={clearAsyncStorageOnly}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📦 AsyncStorage löschen</Text>
          </TouchableOpacity>
        </View>

        {/* Onboarding Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onboarding</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#5856D6' }]}
            onPress={checkOnboardingStatus}
            disabled={loading}
          >
            <Text style={styles.buttonText}>ℹ️ Onboarding-Status prüfen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={viewOnboarding}
            disabled={loading}
          >
            <Text style={styles.buttonText}>👁️ Onboarding ansehen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9500' }]}
            onPress={resetOnboarding}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Onboarding zurücksetzen</Text>
          </TouchableOpacity>
        </View>

        {/* Database Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datenbank-Statistiken</Text>
          {dbStats ? (
            <View style={styles.statsContainer}>
              <Text style={styles.statItem}>Vacations: {dbStats.vacations}</Text>
              <Text style={styles.statItem}>Checklists: {dbStats.checklists}</Text>
              <Text style={styles.statItem}>Checklist Items: {dbStats.checklistItems}</Text>
              <Text style={styles.statItem}>Expenses: {dbStats.expenses}</Text>
              <Text style={styles.statItem}>Total Records: {dbStats.totalRecords}</Text>
            </View>
          ) : (
            <Text style={styles.noData}>Keine Daten geladen</Text>
          )}
        </View>

        {/* Vacations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vacations ({vacations.length})</Text>
          {vacations.length > 0 ? (
            vacations.map((vacation, index) => (
              <View key={vacation.id} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{vacation.destination}</Text>
                <Text style={styles.itemDetail}>ID: {vacation.id}</Text>
                <Text style={styles.itemDetail}>Country: {vacation.country}</Text>
                <Text style={styles.itemDetail}>Hotel: {vacation.hotel}</Text>
                <Text style={styles.itemDetail}>Budget: {vacation.budget} {vacation.currency}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Keine Vacations gefunden</Text>
          )}
        </View>

        {/* Checklists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklists ({checklists.length})</Text>
          {checklists.length > 0 ? (
            checklists.map((checklist, index) => (
              <View key={checklist.id} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{checklist.title}</Text>
                <Text style={styles.itemDetail}>ID: {checklist.id}</Text>
                <Text style={styles.itemDetail}>Vacation ID: {checklist.vacationId || 'Keine'}</Text>
                <Text style={styles.itemDetail}>Items: {checklist.items?.length || 0}</Text>
                <Text style={styles.itemDetail}>
                  Completed: {checklist.items?.filter((item: ChecklistItem) => item.completed).length || 0}
                </Text>
                <Text style={styles.itemDetail}>Template: {checklist.isTemplate ? 'Ja' : 'Nein'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Keine Checklists gefunden</Text>
          )}
        </View>
      </ScrollView>
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
    paddingTop: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  statItem: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemContainer: {
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#6D6D70',
    marginBottom: 2,
  },
  noData: {
    fontSize: 14,
    color: '#6D6D70',
    fontStyle: 'italic',
  },
});