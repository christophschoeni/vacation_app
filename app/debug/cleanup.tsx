import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vacationRepository } from '@/lib/db/repositories/vacation-repository';
import { LocalDatabase } from '@/lib/database/storage';
import AppHeader from '@/components/ui/AppHeader';

export default function CleanupScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const cleanupOrphanedExpenses = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setLogs([]);
    addLog('🧹 Starting cleanup...');

    try {
      // Get all vacations from SQLite
      const vacations = await vacationRepository.findAll();
      const validVacationIds = new Set(vacations.map(v => String(v.id)));

      addLog(`📊 Found ${vacations.length} vacations in SQLite`);
      addLog(`✅ Valid IDs: ${Array.from(validVacationIds).join(', ')}`);

      // Get all expenses from AsyncStorage
      const allExpenses = await LocalDatabase.getExpenses();
      addLog(`📊 Found ${allExpenses.length} expenses in AsyncStorage`);

      // Log each expense
      allExpenses.forEach((expense, idx) => {
        const expenseVacationId = String(expense.vacationId || '');
        const isValid = validVacationIds.has(expenseVacationId);
        addLog(`${idx + 1}. ${isValid ? '✅' : '❌'} ${expense.category} ${expense.amount} (ID: ${expenseVacationId})`);
      });

      // Filter valid expenses
      const validExpenses = allExpenses.filter(expense => {
        const expenseVacationId = String(expense.vacationId || '');
        return validVacationIds.has(expenseVacationId);
      });

      const orphanedCount = allExpenses.length - validExpenses.length;

      if (orphanedCount === 0) {
        addLog('✅ No orphaned expenses! Database is clean.');
        Alert.alert('Success', 'No orphaned expenses found. Database is already clean!');
      } else {
        // Save cleaned expenses using correct storage key
        await AsyncStorage.setItem('@vacation_assist:expenses', JSON.stringify(validExpenses));
        addLog(`✅ Removed ${orphanedCount} orphaned expenses`);
        addLog(`✅ ${validExpenses.length} valid expenses remain`);
        Alert.alert(
          'Cleanup Complete',
          `Removed ${orphanedCount} orphaned expenses.\n${validExpenses.length} valid expenses remain.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Error', 'Failed to cleanup expenses. Check logs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkStorage = async () => {
    setLogs([]);
    addLog('🔍 Checking AsyncStorage...');

    try {
      // Check all possible keys
      const keys = [
        'expenses',
        '@vacation_assist:expenses',
      ];

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          addLog(`\n📦 Key: ${key}`);
          addLog(`   Count: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any, idx: number) => {
              addLog(`   ${idx + 1}. ${item.category || 'N/A'} ${item.amount || 'N/A'} (vacationId: ${item.vacationId || 'N/A'})`);
            });
          }
        } else {
          addLog(`\n📦 Key: ${key} → (empty)`);
        }
      }

      addLog('\n✅ Check complete');
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAllExpenses = async () => {
    Alert.alert(
      '⚠️ DANGER',
      'This will DELETE ALL EXPENSES permanently. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setLogs([]);
            addLog('⚠️ Clearing ALL expenses...');
            await AsyncStorage.setItem('@vacation_assist:expenses', JSON.stringify([]));
            addLog('✅ All expenses deleted from @vacation_assist:expenses');
            // Also clear the old key just in case
            await AsyncStorage.setItem('expenses', JSON.stringify([]));
            addLog('✅ All expenses deleted from expenses (legacy)');
            Alert.alert('Done', 'All expenses have been deleted. Go back and reload the screen.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppHeader
        title="Database Cleanup"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={checkStorage}
          >
            <Text style={styles.buttonText}>🔍 Check Storage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isProcessing && styles.buttonDisabled]}
            onPress={cleanupOrphanedExpenses}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? '🧹 Cleaning...' : '🧹 Cleanup Orphaned Expenses'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={clearAllExpenses}
          >
            <Text style={styles.buttonText}>⚠️ Delete ALL Expenses</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.logs} contentContainerStyle={styles.logsContent}>
          <Text style={styles.logsTitle}>Logs:</Text>
          {logs.map((log, idx) => (
            <Text key={idx} style={styles.logText}>
              {log}
            </Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.emptyText}>No logs yet. Press a button to start.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buttons: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButton: {
    backgroundColor: '#5E5CE6',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logs: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
  },
  logsContent: {
    paddingBottom: 20,
  },
  logsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  logText: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'Menlo',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6D6D70',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
