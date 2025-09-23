import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { checklistRepository } from '@/lib/db/repositories/checklist-repository';
import { appInitialization } from '@/lib/app-initialization';
import { seedTestData, seedTemplates } from '@/lib/seed-data';
import { getDatabaseStats, checkDatabaseFile, forceDatabaseSync } from '@/lib/db/database';
import * as FileSystem from 'expo-file-system';

export default function DebugScreen() {
  const [dbStats, setDbStats] = useState<any>(null);
  const [vacations, setVacations] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
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

      console.log('Debug - Database stats:', stats);
      console.log('Debug - Vacations:', allVacations);
      console.log('Debug - Checklists:', allChecklists);
    } catch (error) {
      console.error('Failed to load database info:', error);
      Alert.alert('Fehler', `Konnte Datenbank-Info nicht laden: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runFullInitialization = async () => {
    setLoading(true);
    try {
      console.log('🔧 Running full app initialization...');

      // Run app initialization
      const result = await appInitialization.forceReinitialization();

      if (result.success) {
        Alert.alert('Erfolg!', 'App-Initialisierung abgeschlossen! 🎉');
        await loadDatabaseInfo();
      } else {
        Alert.alert('Fehler', `Initialisierung fehlgeschlagen: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      Alert.alert('Fehler', `Initialisierung fehlgeschlagen: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createAntalyaVacation = async () => {
    setLoading(true);
    try {
      console.log('🏖️ Creating Antalya vacation with specific ID...');

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

      console.log('✅ Created Antalya vacation:', antalyaVacation);

      // Force database sync to ensure persistence
      await forceDatabaseSync();

      Alert.alert('Erfolg!', `Antalya-Vacation erstellt! ID: ${antalyaVacation.id}`);
      await loadDatabaseInfo();
    } catch (error) {
      console.error('Failed to create vacation:', error);
      Alert.alert('Fehler', `Konnte Vacation nicht erstellen: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const showDatabasePath = async () => {
    try {
      console.log('📁 Checking database file and paths...');

      // Use the new checkDatabaseFile function
      await checkDatabaseFile();

      const documentsDir = FileSystem.documentDirectory;
      const sqliteDir = `${documentsDir}SQLite/`;
      const dbPath = `${sqliteDir}vacation_assist.db`;

      // Check if directory exists
      const sqliteDirInfo = await FileSystem.getInfoAsync(sqliteDir);
      const dbFileInfo = await FileSystem.getInfoAsync(dbPath);

      let message = `Document Directory:\n${documentsDir}\n\n`;
      message += `SQLite Directory:\n${sqliteDir}\n`;
      message += `Exists: ${sqliteDirInfo.exists}\n\n`;
      message += `Database File:\n${dbPath}\n`;
      message += `Exists: ${dbFileInfo.exists}\n`;
      if (dbFileInfo.exists) {
        message += `Size: ${dbFileInfo.size} bytes\n`;
        message += `Modified: ${new Date(dbFileInfo.modificationTime * 1000).toLocaleString()}`;
      }

      Alert.alert('Database Path Info', message);
    } catch (error) {
      console.error('Failed to get database path:', error);
      Alert.alert('Fehler', `Konnte Datenbankpfad nicht ermitteln: ${error}`);
    }
  };

  const clearDatabase = async () => {
    Alert.alert(
      'Datenbank löschen?',
      'Alle Daten werden unwiderruflich gelöscht!',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Clear all data - use direct SQL to ensure CASCADE deletes work
              const { db } = await import('@/lib/db/database');
              const schema = await import('@/lib/db/schema');

              console.log('🗑️ Clearing all checklist items...');
              await db.delete(schema.checklistItems);

              console.log('🗑️ Clearing all checklists...');
              await db.delete(schema.checklists);

              console.log('🗑️ Clearing all expenses...');
              await db.delete(schema.expenses);

              console.log('🗑️ Clearing all vacations...');
              await db.delete(schema.vacations);

              console.log('🗑️ Clearing all categories...');
              await db.delete(schema.categories);

              console.log('🗑️ Clearing all backup history...');
              await db.delete(schema.backupHistory);

              console.log('💾 Syncing cleared database to disk...');
              await forceDatabaseSync();

              Alert.alert('Erfolg!', 'Datenbank wurde geleert!');
              await loadDatabaseInfo();
            } catch (error) {
              console.error('Failed to clear database:', error);
              Alert.alert('Fehler', `Konnte Datenbank nicht löschen: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
            onPress={clearDatabase}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🗑️ Datenbank löschen</Text>
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
                  Completed: {checklist.items?.filter((item: any) => item.completed).length || 0}
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